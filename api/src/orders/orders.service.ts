import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import type { Prisma } from '../../generated/prisma/client';
import { OrderStatus, PaymentStatus, Role } from '../../generated/prisma/enums';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { FailOrderDto } from './dto/fail-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { VerifyPickupCodeDto } from './dto/verify-pickup-code.dto';

const COMMISSION_RATE = 0.025;

const orderInclude = {
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
} as const;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // Ensure the user is a shop owner
  private ensureShopOwner(user: JwtUser) {
    if (user.role !== Role.SHOP_OWNER) {
      throw new ForbiddenException('Only shop owners can perform this action');
    }
  }

  // Ensure the user is a delivery company
  private ensureDeliveryCompany(user: JwtUser) {
    if (user.role !== Role.DELIVERY_COMPANY) {
      throw new ForbiddenException(
        'Only delivery companies can perform this action',
      );
    }
  }

  // Ensure the user is a driver
  private ensureDriver(user: JwtUser) {
    if (user.role !== Role.DRIVER) {
      throw new ForbiddenException('Only drivers can perform this action');
    }
  }

  // Generate a unique six-digit pickup code
  private async generateUniquePickupCode() {
    let pickupCode: string;
    let existingOrder: { id: string } | null;

    do {
      pickupCode = randomInt(100000, 1000000).toString();

      existingOrder = await this.prisma.order.findUnique({
        where: {
          pickupCode,
        },
        select: {
          id: true,
        },
      });
    } while (existingOrder);

    return pickupCode;
  }

  // Build shared order filters
  private buildOrderFilters(
    orderQueryDto: OrderQueryDto,
  ): Prisma.OrderWhereInput {
    const { status, paymentStatus, search, fromDate, toDate } = orderQueryDto;

    const startDate = fromDate ? new Date(fromDate) : undefined;
    const endDate = toDate ? new Date(toDate) : undefined;

    if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(toDate!)) {
      endDate.setUTCHours(23, 59, 59, 999);
    }

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('fromDate cannot be later than toDate');
    }

    const cleanSearch = search?.trim();

    return {
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
  }

  // Find an order belonging to a shop owner
  private async findOwnedOrder(shopOwnerId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        shopOwnerId,
      },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // Find an order assigned to a driver
  private async findDriverOrder(driverId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        driverId,
      },
    });

    if (!order) {
      throw new NotFoundException('Assigned order not found');
    }

    return order;
  }

  // Create an order and calculate financial values
  async createOrder(user: JwtUser, createOrderDto: CreateOrderDto) {
    this.ensureShopOwner(user);

    const {
      customerName,
      customerPhone,
      customerAddress,
      customerNote,
      customerLatitude,
      customerLongitude,
      deliveryZone,
      items,
    } = createOrderDto;

    const hasLatitude = customerLatitude !== undefined;
    const hasLongitude = customerLongitude !== undefined;

    if (hasLatitude !== hasLongitude) {
      throw new BadRequestException(
        'Latitude and longitude must be provided together',
      );
    }

    const productIds = items.map((item) => item.productId);
    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      throw new BadRequestException(
        'The same product cannot appear more than once',
      );
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        shopOwnerId: user.id,
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more active products were not found');
    }

    const deliveryCompany = await this.prisma.deliveryCompany.findFirst({
      where: {
        coverageZones: {
          has: deliveryZone,
        },
        user: {
          isActive: true,
        },
      },
      orderBy: [
        {
          deliveryPrice: 'asc',
        },
        {
          userId: 'asc',
        },
      ],
    });

    if (!deliveryCompany) {
      throw new NotFoundException(
        'No active delivery company covers this zone',
      );
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    // Calculate using fils to avoid floating-point errors
    const productTotalInFils = items.reduce((total, item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const priceInFils = Math.round(Number(product.price) * 1000);

      return total + priceInFils * item.quantity;
    }, 0);

    const deliveryFeeInFils = Math.round(
      Number(deliveryCompany.deliveryPrice) * 1000,
    );

    const shopCommissionInFils = Math.round(
      productTotalInFils * COMMISSION_RATE,
    );

    const deliveryCompanyCommissionInFils = Math.round(
      deliveryFeeInFils * COMMISSION_RATE,
    );

    const customerTotalInFils = productTotalInFils + deliveryFeeInFils;

    const pickupCode = await this.generateUniquePickupCode();

    const order = await this.prisma.order.create({
      data: {
        shopOwnerId: user.id,
        deliveryCompanyId: deliveryCompany.userId,
        customerName,
        customerPhone,
        customerAddress,
        customerNote,
        customerLatitude,
        customerLongitude,
        deliveryZone,

        totalPrice: productTotalInFils / 1000,
        deliveryFee: deliveryFeeInFils / 1000,
        shopCommission: shopCommissionInFils / 1000,
        deliveryCompanyCommission: deliveryCompanyCommissionInFils / 1000,
        customerTotal: customerTotalInFils / 1000,

        pickupCode,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: orderInclude,
    });

    return {
      message: 'Order created and assigned successfully',
      order,
    };
  }

  // Get shop orders with filtering and pagination
  async getShopOwnerDashboard(user: JwtUser) {
    this.ensureShopOwner(user);

    const [activeProducts, totalOrders, deliveredFinancials, recentOrders] =
      await Promise.all([
        this.prisma.product.count({
          where: { shopOwnerId: user.id, isActive: true },
        }),
        this.prisma.order.count({ where: { shopOwnerId: user.id } }),
        this.prisma.order.aggregate({
          where: { shopOwnerId: user.id, status: OrderStatus.DELIVERED },
          _sum: { totalPrice: true, shopCommission: true },
        }),
        this.prisma.order.findMany({
          where: { shopOwnerId: user.id },
          include: orderInclude,
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    const productsTotal = Number(deliveredFinancials._sum.totalPrice ?? 0);
    const commission = Number(
      deliveredFinancials._sum.shopCommission ?? 0,
    );

    return {
      message: 'Shop owner dashboard retrieved successfully',
      activeProducts,
      totalOrders,
      netSales: (productsTotal - commission).toFixed(3),
      recentOrders,
    };
  }

  // Get shop orders with filtering and pagination
  async getOrders(user: JwtUser, orderQueryDto: OrderQueryDto) {
    this.ensureShopOwner(user);

    const { page, limit } = orderQueryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      shopOwnerId: user.id,
      ...this.buildOrderFilters(orderQueryDto),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.order.count({
        where,
      }),
    ]);

    return {
      message: 'Orders retrieved successfully',
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get one authorized order
  async getOrderById(user: JwtUser, orderId: string) {
    const where: Prisma.OrderWhereInput = {
      id: orderId,
    };

    switch (user.role) {
      case Role.SHOP_OWNER:
        where.shopOwnerId = user.id;
        break;

      case Role.DELIVERY_COMPANY:
        where.deliveryCompanyId = user.id;
        break;

      case Role.DRIVER:
        where.driverId = user.id;
        break;

      case Role.ADMIN:
        break;

      default:
        throw new ForbiddenException('You cannot view this order');
    }

    const order = await this.prisma.order.findFirst({
      where,
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role !== Role.SHOP_OWNER) {
      const { pickupCode, ...safeOrder } = order;

      return {
        message: 'Order retrieved successfully',
        order: safeOrder,
      };
    }

    return {
      message: 'Order retrieved successfully',
      order,
    };
  }

  // Get company orders with filtering and pagination
  async getAssignedOrders(user: JwtUser, orderQueryDto: OrderQueryDto) {
    this.ensureDeliveryCompany(user);

    const { page, limit } = orderQueryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      deliveryCompanyId: user.id,
      ...this.buildOrderFilters(orderQueryDto),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.order.count({
        where,
      }),
    ]);

    const safeOrders = orders.map(({ pickupCode, ...order }) => order);

    return {
      message: 'Assigned orders retrieved successfully',
      orders: safeOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Accept an order assigned to the company
  async acceptOrder(user: JwtUser, orderId: string) {
    this.ensureDeliveryCompany(user);

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deliveryCompanyId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be accepted');
    }

    const acceptedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.ACCEPTED,
      },
      include: orderInclude,
    });

    const { pickupCode, ...safeOrder } = acceptedOrder;

    return {
      message: 'Order accepted successfully',
      order: safeOrder,
    };
  }

  // Assign one of the company's drivers
  async assignDriver(
    user: JwtUser,
    orderId: string,
    assignDriverDto: AssignDriverDto,
  ) {
    this.ensureDeliveryCompany(user);

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deliveryCompanyId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException('The order must be accepted first');
    }

    if (order.driverId) {
      throw new BadRequestException(
        'A driver is already assigned to this order',
      );
    }

    const driver = await this.prisma.driver.findFirst({
      where: {
        userId: assignDriverDto.driverId,
        companyId: user.id,
        user: {
          isActive: true,
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(
        'Active driver does not belong to this company',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        driverId: driver.userId,
      },
      include: orderInclude,
    });

    const { pickupCode, ...safeOrder } = updatedOrder;

    return {
      message: 'Driver assigned successfully',
      order: safeOrder,
    };
  }

  // Get driver orders with filtering and pagination
  async getDriverOrders(user: JwtUser, orderQueryDto: OrderQueryDto) {
    this.ensureDriver(user);

    const { page, limit } = orderQueryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      driverId: user.id,
      ...this.buildOrderFilters(orderQueryDto),
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
      message: 'Assigned orders retrieved successfully',
      orders: safeOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Verify the pickup code
  async pickupOrder(
    user: JwtUser,
    orderId: string,
    verifyPickupCodeDto: VerifyPickupCodeDto,
  ) {
    this.ensureDriver(user);

    const order = await this.findDriverOrder(user.id, orderId);

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted orders can be picked up');
    }

    if (order.pickupCodeUsed) {
      throw new BadRequestException('Pickup code has already been used');
    }

    if (order.pickupCode !== verifyPickupCodeDto.pickupCode) {
      throw new BadRequestException('Invalid pickup code');
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.PICKED_UP,
        pickupCodeUsed: true,
      },
    });

    const { pickupCode, ...safeOrder } = updatedOrder;

    return {
      message: 'Order picked up successfully',
      order: safeOrder,
    };
  }

  // Start delivering a picked-up order
  async startDelivery(user: JwtUser, orderId: string) {
    this.ensureDriver(user);

    const order = await this.findDriverOrder(user.id, orderId);

    if (order.status !== OrderStatus.PICKED_UP) {
      throw new BadRequestException('Only picked-up orders can start delivery');
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.OUT_FOR_DELIVERY,
      },
    });

    const { pickupCode, ...safeOrder } = updatedOrder;

    return {
      message: 'Delivery started successfully',
      order: safeOrder,
    };
  }

  // Complete a successful delivery
  async deliverOrder(user: JwtUser, orderId: string) {
    this.ensureDriver(user);

    const order = await this.findDriverOrder(user.id, orderId);

    if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException(
        'Only orders out for delivery can be delivered',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.COLLECTED,
      },
    });

    const { pickupCode, ...safeOrder } = updatedOrder;

    return {
      message: 'Order delivered successfully',
      order: safeOrder,
    };
  }

  // Record a failed delivery attempt
  async failOrder(user: JwtUser, orderId: string, failOrderDto: FailOrderDto) {
    this.ensureDriver(user);

    const order = await this.findDriverOrder(user.id, orderId);

    if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException(
        'Only orders out for delivery can be marked as failed',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.FAILED,
        paymentStatus: PaymentStatus.NOT_COLLECTED,
        returnReason: failOrderDto.reason,
      },
    });

    const { pickupCode, ...safeOrder } = updatedOrder;

    return {
      message: 'Failed delivery recorded successfully',
      order: safeOrder,
    };
  }

  // Confirm a failed order was returned to the shop
  async confirmReturn(user: JwtUser, orderId: string) {
    this.ensureShopOwner(user);

    const order = await this.findOwnedOrder(user.id, orderId);

    if (order.status !== OrderStatus.FAILED) {
      throw new BadRequestException(
        'Only failed orders can be confirmed as returned',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.RETURNED,
      },
    });

    return {
      message: 'Order return confirmed successfully',
      order: updatedOrder,
    };
  }

  // Confirm payment received by the shop
  async confirmPayment(user: JwtUser, orderId: string) {
    this.ensureShopOwner(user);

    const order = await this.findOwnedOrder(user.id, orderId);

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Payment can only be confirmed for delivered orders',
      );
    }

    if (order.paymentStatus !== PaymentStatus.COLLECTED) {
      throw new BadRequestException(
        'This order does not have a collected payment awaiting confirmation',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID_TO_SHOP,
      },
    });

    return {
      message: 'Payment received successfully',
      order: updatedOrder,
    };
  }

  // Cancel an order before company acceptance
  async cancelOrder(user: JwtUser, orderId: string) {
    this.ensureShopOwner(user);

    const order = await this.findOwnedOrder(user.id, orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.NOT_COLLECTED,
      },
    });

    return {
      message: 'Order cancelled successfully',
      order: updatedOrder,
    };
  }
}
