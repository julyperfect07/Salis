import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Role } from '../../generated/prisma/enums';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PrismaService } from '../prisma/prisma.service';

import type { Prisma } from '../../generated/prisma/client';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import * as bcrypt from 'bcrypt';
import { OrderQueryDto } from '../orders/dto/order-query.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Get platform statistics for the admin dashboard
  async getDashboard(user: JwtUser) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view the dashboard');
    }

    const [
      userGroups,
      activeUsers,
      totalProducts,
      activeProducts,
      orderGroups,
      deliveredFinancials,
      unpaidFinancials,
    ] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role'],
        _count: {
          _all: true,
        },
      }),

      this.prisma.user.count({
        where: {
          isActive: true,
        },
      }),

      this.prisma.product.count(),

      this.prisma.product.count({
        where: {
          isActive: true,
        },
      }),

      this.prisma.order.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
      }),

      this.prisma.order.aggregate({
        where: {
          status: OrderStatus.DELIVERED,
        },
        _sum: {
          totalPrice: true,
          deliveryFee: true,
          customerTotal: true,
          shopCommission: true,
          deliveryCompanyCommission: true,
        },
      }),

      this.prisma.order.aggregate({
        where: {
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.COLLECTED,
        },
        _sum: {
          totalPrice: true,
          shopCommission: true,
        },
      }),
    ]);

    const userCounts = Object.fromEntries(
      Object.values(Role).map((role) => [role, 0]),
    );

    for (const group of userGroups) {
      userCounts[group.role] = group._count._all;
    }

    const orderCounts = Object.fromEntries(
      Object.values(OrderStatus).map((status) => [status, 0]),
    );

    for (const group of orderGroups) {
      orderCounts[group.status] = group._count._all;
    }

    const productsTotal = Number(deliveredFinancials._sum.totalPrice ?? 0);

    const deliveryFees = Number(deliveredFinancials._sum.deliveryFee ?? 0);

    const shopCommissions = Number(
      deliveredFinancials._sum.shopCommission ?? 0,
    );

    const deliveryCompanyCommissions = Number(
      deliveredFinancials._sum.deliveryCompanyCommission ?? 0,
    );

    const unpaidProductTotal = Number(unpaidFinancials._sum.totalPrice ?? 0);

    const unpaidShopCommission = Number(
      unpaidFinancials._sum.shopCommission ?? 0,
    );

    return {
      message: 'Admin dashboard retrieved successfully',

      users: {
        total: userGroups.reduce(
          (total, group) => total + group._count._all,
          0,
        ),
        active: activeUsers,
        shopOwners: userCounts[Role.SHOP_OWNER],
        deliveryCompanies: userCounts[Role.DELIVERY_COMPANY],
        drivers: userCounts[Role.DRIVER],
        admins: userCounts[Role.ADMIN],
      },

      products: {
        total: totalProducts,
        active: activeProducts,
      },

      orders: {
        total: orderGroups.reduce(
          (total, group) => total + group._count._all,
          0,
        ),
        byStatus: orderCounts,
      },

      financials: {
        productsTotal: productsTotal.toFixed(3),
        deliveryFees: deliveryFees.toFixed(3),
        customerTotal: Number(
          deliveredFinancials._sum.customerTotal ?? 0,
        ).toFixed(3),
        platformRevenue: (shopCommissions + deliveryCompanyCommissions).toFixed(
          3,
        ),
        unpaidToShops: (unpaidProductTotal - unpaidShopCommission).toFixed(3),
      },
    };
  }
  // List users without exposing sensitive fields
  async getUsers(user: JwtUser, userQueryDto: UserQueryDto) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view users');
    }

    const { page, limit, role, search, isActive } = userQueryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            phoneNumber: {
              contains: search,
            },
          },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          imageUrl: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      message: 'Users retrieved successfully',
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get one user without exposing sensitive fields
  async getUserById(user: JwtUser, userId: string) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view users');
    }

    const selectedUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        imageUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,

        shopOwner: {
          select: {
            _count: {
              select: {
                products: true,
                orders: true,
              },
            },
          },
        },

        deliveryCompany: {
          select: {
            deliveryPrice: true,
            openTime: true,
            closeTime: true,
            coverageZones: true,
            _count: {
              select: {
                drivers: true,
                orders: true,
              },
            },
          },
        },

        driver: {
          select: {
            companyId: true,
            company: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                orders: true,
              },
            },
          },
        },
      },
    });

    if (!selectedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User retrieved successfully',
      user: selectedUser,
    };
  }
  // Update a user's basic account information
  async updateUser(
    user: JwtUser,
    userId: string,
    updateUserDto: UpdateUserDto,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update users');
    }

    if (Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: {
          email: updateUserDto.email,
        },
        select: {
          id: true,
        },
      });

      if (emailExists) {
        throw new ConflictException('Email is already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        imageUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  // Activate or deactivate a user account
  async updateUserStatus(
    user: JwtUser,
    userId: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can change account status');
    }

    if (user.id === userId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: updateUserStatusDto.isActive,

        // Remove the active refresh session when deactivating
        ...(!updateUserStatusDto.isActive && {
          refreshTokenHash: null,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        imageUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: updatedUser.isActive
        ? 'User activated successfully'
        : 'User deactivated successfully',
      user: updatedUser,
    };
  }

  // Reset a user's password and remove their existing session
  async resetUserPassword(
    user: JwtUser,
    userId: string,
    resetUserPasswordDto: ResetUserPasswordDto,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can reset passwords');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(
      resetUserPasswordDto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        refreshTokenHash: null,
      },
    });

    return {
      message: 'User password reset successfully',
    };
  }

  // Get all platform orders
  async getOrders(user: JwtUser, orderQueryDto: OrderQueryDto) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view all orders');
    }

    const { page, limit, status, paymentStatus, search, fromDate, toDate } =
      orderQueryDto;

    const skip = (page - 1) * limit;
    const cleanSearch = search?.trim();

    const startDate = fromDate ? new Date(fromDate) : undefined;
    const endDate = toDate ? new Date(toDate) : undefined;

    if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(toDate!)) {
      endDate.setUTCHours(23, 59, 59, 999);
    }

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('fromDate cannot be later than toDate');
    }

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),

      ...(cleanSearch && {
        OR: [
          {
            id: {
              contains: cleanSearch,
              mode: 'insensitive',
            },
          },
          {
            customerName: {
              contains: cleanSearch,
              mode: 'insensitive',
            },
          },
          {
            customerPhone: {
              contains: cleanSearch,
            },
          },
        ],
      }),

      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          shopOwner: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phoneNumber: true,
                },
              },
            },
          },
          deliveryCompany: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phoneNumber: true,
                },
              },
            },
          },
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phoneNumber: true,
                },
              },
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),

      this.prisma.order.count({
        where,
      }),
    ]);

    const safeOrders = orders.map(({ pickupCode, ...order }) => order);

    return {
      message: 'Orders retrieved successfully',
      orders: safeOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
