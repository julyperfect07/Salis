import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { OrderStatus, PaymentStatus, Role } from '../../generated/prisma/enums';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPickupCodeDto } from './dto/verify-pickup-code.dto';
import { FailOrderDto } from './dto/fail-order.dto';

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

  // Get orders assigned to the logged-in driver
  async getDriverOrders(user: JwtUser, paginationDto: PaginationDto) {
    if (user.role !== Role.DRIVER) {
      throw new ForbiddenException('Only drivers can view assigned orders');
    }

    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    // للاختصار
    const where = {
      driverId: user.id,
    };
    // عشان في 2 استعلامات بدنا نعملهم بنفس الوقت
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: 'desc',
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

  // Verify the code and confirm that the driver received the order
  async pickupOrder(
    user: JwtUser,
    orderId: string,
    verifyPickupCodeDto: VerifyPickupCodeDto,
  ) {
    if (user.role !== Role.DRIVER) {
      throw new ForbiddenException('Only drivers can pick up orders');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        driverId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Assigned order not found');
    }

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

  // Change a picked-up order to out for delivery
  async startDelivery(user: JwtUser, orderId: string) {
    if (user.role !== Role.DRIVER) {
      throw new ForbiddenException('Only drivers can start deliveries');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        driverId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Assigned order not found');
    }

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

  // Complete the delivery and record the collected payment
  async deliverOrder(user: JwtUser, orderId: string) {
    if (user.role !== Role.DRIVER) {
      throw new ForbiddenException('Only drivers can complete deliveries');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        driverId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Assigned order not found');
    }

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
  // Record an unsuccessful delivery attempt
  async failOrder(user: JwtUser, orderId: string, failOrderDto: FailOrderDto) {
    if (user.role !== Role.DRIVER) {
      throw new ForbiddenException('Only drivers can report failed deliveries');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        driverId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Assigned order not found');
    }

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

  // Confirm that the failed order was returned to its shop
  async confirmReturn(user: JwtUser, orderId: string) {
    if (user.role !== Role.SHOP_OWNER) {
      throw new ForbiddenException(
        'Only shop owners can confirm returned orders',
      );
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        shopOwnerId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Shop order not found');
    }

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

  // Confirm that the delivery company paid the shop owner
  async confirmPayment(user: JwtUser, orderId: string) {
    if (user.role !== Role.SHOP_OWNER) {
      throw new ForbiddenException(
        'Only shop owners can confirm received payments',
      );
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        shopOwnerId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Shop order not found');
    }

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

  // Cancel a pending order owned by the shop
  async cancelOrder(user: JwtUser, orderId: string) {
    if (user.role !== Role.SHOP_OWNER) {
      throw new ForbiddenException('Only shop owners can cancel orders');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        shopOwnerId: user.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Shop order not found');
    }

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
