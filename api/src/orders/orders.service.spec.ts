import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Role } from '../../generated/prisma/enums';
import { OrdersService } from './orders.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('OrdersService', () => {
  let service: OrdersService;
  let transaction: {
    order: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    orderRejection: {
      create: jest.Mock;
    };
    deliveryCompany: {
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    transaction = {
      order: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      orderRejection: {
        create: jest.fn(),
      },
      deliveryCompany: {
        findMany: jest.fn(),
      },
    };

    const prisma = {
      $transaction: jest.fn((callback) => callback(transaction)),
    };

    service = new OrdersService(prisma as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('rejectOrder', () => {
    const user = {
      id: 'company-a',
      email: 'company-a@example.com',
      role: Role.DELIVERY_COMPANY,
    };

    const pendingOrder = {
      id: 'order-1',
      deliveryCompanyId: 'company-a',
      deliveryZone: 'AMMAN_CENTRAL',
      status: OrderStatus.PENDING,
    };

    it('reroutes by price, active workload, and oldest assignment', async () => {
      transaction.order.findFirst.mockResolvedValue(pendingOrder);
      transaction.deliveryCompany.findMany.mockResolvedValue([
        {
          userId: 'company-b',
          deliveryPrice: '3.000',
          _count: { orders: 2 },
          orders: [{ createdAt: new Date('2026-01-01') }],
        },
        {
          userId: 'company-c',
          deliveryPrice: '3.000',
          _count: { orders: 0 },
          orders: [{ createdAt: new Date('2026-02-01') }],
        },
        {
          userId: 'company-d',
          deliveryPrice: '3.000',
          _count: { orders: 0 },
          orders: [{ createdAt: new Date('2025-12-01') }],
        },
        {
          userId: 'company-e',
          deliveryPrice: '4.000',
          _count: { orders: 0 },
          orders: [],
        },
      ]);
      transaction.order.update.mockResolvedValue({
        id: 'order-1',
        pickupCode: '123456',
        status: OrderStatus.PENDING,
      });

      const result = await service.rejectOrder(user, 'order-1', {
        reason: '  No available drivers  ',
      });

      expect(transaction.orderRejection.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order-1',
          deliveryCompanyId: 'company-a',
          reason: 'No available drivers',
        },
      });
      expect(transaction.deliveryCompany.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            coverageZones: { has: 'AMMAN_CENTRAL' },
            user: { isActive: true },
            orderRejections: { none: { orderId: 'order-1' } },
          }),
        }),
      );
      expect(transaction.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            rejectionReason: null,
            deliveryCompany: { connect: { userId: 'company-d' } },
          }),
        }),
      );
      const updateData = transaction.order.update.mock.calls[0][0].data;
      expect(updateData).not.toHaveProperty('deliveryFee');
      expect(updateData).not.toHaveProperty('deliveryCompanyCommission');
      expect(updateData).not.toHaveProperty('customerTotal');
      expect(result).toEqual(
        expect.objectContaining({
          rerouted: true,
          order: { id: 'order-1', status: OrderStatus.PENDING },
        }),
      );
      expect(result.order).not.toHaveProperty('pickupCode');
    });

    it('finally rejects and unassigns the order when no company remains', async () => {
      transaction.order.findFirst.mockResolvedValue(pendingOrder);
      transaction.deliveryCompany.findMany.mockResolvedValue([]);
      transaction.order.update.mockResolvedValue({
        id: 'order-1',
        pickupCode: '123456',
        status: OrderStatus.REJECTED,
        rejectionReason: 'Outside capacity',
      });

      const result = await service.rejectOrder(user, 'order-1', {
        reason: 'Outside capacity',
      });

      expect(transaction.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: OrderStatus.REJECTED,
            paymentStatus: PaymentStatus.NOT_COLLECTED,
            rejectionReason: 'Outside capacity',
            deliveryCompany: { disconnect: true },
          }),
        }),
      );
      expect(result.rerouted).toBe(false);
    });

    it('rejects requests for orders not assigned to the company', async () => {
      transaction.order.findFirst.mockResolvedValue(null);

      await expect(
        service.rejectOrder(user, 'order-1', { reason: 'Unavailable' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('does not reroute an order that is no longer pending', async () => {
      transaction.order.findFirst.mockResolvedValue({
        ...pendingOrder,
        status: OrderStatus.ACCEPTED,
      });

      await expect(
        service.rejectOrder(user, 'order-1', { reason: 'Unavailable' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
