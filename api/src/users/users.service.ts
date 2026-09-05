import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateDeliveryCompanyProfileDto } from './dto/update-delivery-company-profile.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    if (createUserDto.role === Role.ADMIN) {
      throw new BadRequestException('Creating another admin is not allowed');
    }

    if (
      createUserDto.role === Role.DELIVERY_COMPANY &&
      (createUserDto.deliveryPrice === undefined ||
        !createUserDto.openTime ||
        !createUserDto.closeTime ||
        !createUserDto.coverageZones?.length)
    ) {
      throw new BadRequestException(
        'Delivery price, working times and coverage zones are required',
      );
    }

    if (createUserDto.role === Role.DRIVER) {
      if (!createUserDto.companyId) {
        throw new BadRequestException('Company ID is required');
      }

      const company = await this.prisma.deliveryCompany.findUnique({
        where: {
          userId: createUserDto.companyId,
        },
      });

      if (!company) {
        throw new NotFoundException('Delivery company not found');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: createUserDto.name.trim(),
          email,
          password: hashedPassword,
          phoneNumber: createUserDto.phoneNumber,
          imageUrl: createUserDto.imageUrl,
          role: createUserDto.role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          imageUrl: true,
          role: true,
        },
      });

      if (createUserDto.role === Role.SHOP_OWNER) {
        await transaction.shopOwner.create({
          data: {
            userId: user.id,
          },
        });
      }

      if (createUserDto.role === Role.DELIVERY_COMPANY) {
        await transaction.deliveryCompany.create({
          data: {
            userId: user.id,
            deliveryPrice: createUserDto.deliveryPrice!,
            openTime: createUserDto.openTime!,
            closeTime: createUserDto.closeTime!,
            coverageZones: createUserDto.coverageZones!,
          },
        });
      }

      if (createUserDto.role === Role.DRIVER) {
        await transaction.driver.create({
          data: {
            userId: user.id,
            companyId: createUserDto.companyId!,
          },
        });
      }

      return user;
    });
  }

  // Get drivers belonging to the logged-in delivery company
  async getCompanyDrivers(user: JwtUser, paginationDto: PaginationDto) {
    if (user.role !== Role.DELIVERY_COMPANY) {
      throw new ForbiddenException(
        'Only delivery companies can view their drivers',
      );
    }

    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const where = {
      companyId: user.id,
    };

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          userId: 'asc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              imageUrl: true,
              role: true,
              isActive: true,
            },
          },
        },
      }),

      this.prisma.driver.count({
        where,
      }),
    ]);

    return {
      message: 'Company drivers retrieved successfully',
      drivers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createCompanyDriver(user: JwtUser, dto: CreateDriverDto) {
    if (user.role !== Role.DELIVERY_COMPANY) {
      throw new ForbiddenException('Only delivery companies can create drivers');
    }

    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const driver = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        password,
        phoneNumber: dto.phoneNumber.trim(),
        role: Role.DRIVER,
        driver: { create: { companyId: user.id } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        imageUrl: true,
        role: true,
        isActive: true,
      },
    });

    return { message: 'Driver created successfully', driver };
  }

  async updateCompanyDriverStatus(
    user: JwtUser,
    driverId: string,
    dto: UpdateDriverStatusDto,
  ) {
    if (user.role !== Role.DELIVERY_COMPANY) {
      throw new ForbiddenException('Only delivery companies can manage drivers');
    }

    const driver = await this.prisma.driver.findFirst({
      where: { userId: driverId, companyId: user.id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const updatedDriver = await this.prisma.user.update({
      where: { id: driverId },
      data: { isActive: dto.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        imageUrl: true,
        role: true,
        isActive: true,
      },
    });

    return { message: 'Driver status updated successfully', driver: updatedDriver };
  }

  // Get the logged-in user's profile without sensitive fields
  async getMyProfile(user: JwtUser) {
    const profile = await this.prisma.user.findUnique({
      where: {
        id: user.id,
        isActive: true,
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
                    phoneNumber: true,
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

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Profile retrieved successfully',
      user: profile,
    };
  }

  // Update the logged-in user's safe profile fields
  async updateMyProfile(user: JwtUser, updateProfileDto: UpdateProfileDto) {
    if (Object.keys(updateProfileDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
        isActive: true,
      },
      data: updateProfileDto,
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
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  // Verify the current password and save the new password
  async changePassword(user: JwtUser, changePasswordDto: ChangePasswordDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
        isActive: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const currentPasswordMatches = await bcrypt.compare(
      changePasswordDto.currentPassword,
      existingUser.password,
    );

    if (!currentPasswordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const samePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      existingUser.password,
    );

    if (samePassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        refreshTokenHash: null,
      },
    });

    return {
      message: 'Password changed successfully. Please log in again',
    };
  }

  // Update delivery price, working hours, or coverage zones
  async updateDeliveryCompanyProfile(
    user: JwtUser,
    dto: UpdateDeliveryCompanyProfileDto,
  ) {
    if (user.role !== Role.DELIVERY_COMPANY) {
      throw new ForbiddenException(
        'Only delivery companies can update these details',
      );
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const deliveryCompany = await this.prisma.deliveryCompany.update({
      where: {
        userId: user.id,
      },
      data: dto,
      select: {
        userId: true,
        deliveryPrice: true,
        openTime: true,
        closeTime: true,
        coverageZones: true,
      },
    });

    return {
      message: 'Delivery company profile updated successfully',
      deliveryCompany,
    };
  }
}
