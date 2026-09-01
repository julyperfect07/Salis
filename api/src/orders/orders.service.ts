import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { OrderStatus, Role } from '../../generated/prisma/enums';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { CreateOrderDto } from './dto/create-order.dto';

const orderInclude = {
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

  // Find an order belonging to the shop owner
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

  // Create and automatically assign an order
  async createOrder(user: JwtUser, createOrderDto: CreateOrderDto) {
    this.ensureShopOwner(user);

    const {
      customerName,
      customerPhone,
      customerAddress,
      customerNote,
      deliveryZone,
      items,
    } = createOrderDto;

    // بس عشان اتأكد انو نفس المنتج ما يتكرر اكثر من مرة بالاوردر
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
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    const deliveryCompany = await this.prisma.deliveryCompany.findFirst({
      where: {
        coverageZones: {
          has: deliveryZone,
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
      throw new NotFoundException('No delivery company covers this zone');
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const totalInCents = items.reduce((total, item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const priceInCents = Math.round(Number(product.price) * 100);

      return total + priceInCents * item.quantity;
    }, 0);

    const totalPrice = totalInCents / 100;
    const pickupCode = await this.generateUniquePickupCode();

    const order = await this.prisma.order.create({
      data: {
        shopOwnerId: user.id,
        deliveryCompanyId: deliveryCompany.userId,
        customerName,
        customerPhone,
        customerAddress,
        customerNote,
        deliveryZone,
        totalPrice,
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

  // Get the shop owner's orders
  async getOrders(user: JwtUser, paginationDto: PaginationDto) {
    this.ensureShopOwner(user);

    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const where = {
      shopOwnerId: user.id,
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        skip,
        take: limit,
        orderBy: {
          id: 'asc',
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

  // Get one order belonging to the shop owner
  async getOrderById(user: JwtUser, orderId: string) {
    this.ensureShopOwner(user);

    const order = await this.findOwnedOrder(user.id, orderId);

    return {
      message: 'Order retrieved successfully',
      order,
    };
  }

  // Get orders assigned to the delivery company
  async getAssignedOrders(user: JwtUser, paginationDto: PaginationDto) {
    this.ensureDeliveryCompany(user);

    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const where = {
      deliveryCompanyId: user.id,
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        skip,
        take: limit,
        orderBy: {
          id: 'asc',
        },
      }),

      this.prisma.order.count({
        where,
      }),
    ]);

    return {
      message: 'Assigned orders retrieved successfully',
      orders,
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

    return {
      message: 'Order accepted successfully',
      order: acceptedOrder,
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

    const driver = await this.prisma.driver.findFirst({
      where: {
        userId: assignDriverDto.driverId,
        companyId: user.id,
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver does not belong to this company');
    }

    if (order.driverId) {
      throw new BadRequestException(
        'A driver is already assigned to this order',
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

    return {
      message: 'Driver assigned successfully',
      order: updatedOrder,
    };
  }
}
