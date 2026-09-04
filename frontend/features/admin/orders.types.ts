export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "COLLECTED"
  | "PAID_TO_SHOP"
  | "NOT_COLLECTED";

interface OrderParty {
  user: {
    id: string;
    name: string;
    phoneNumber: string;
  };
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string | null;
  customerLatitude: string | null;
  customerLongitude: string | null;
  totalPrice: string;
  deliveryFee: string;
  shopCommission: string;
  deliveryCompanyCommission: string;
  customerTotal: string;
  deliveryZone: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  returnReason: string | null;
  createdAt: string;
  updatedAt: string;
  shopOwner: OrderParty;
  deliveryCompany: OrderParty | null;
  driver: OrderParty | null;
  orderItems: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: string;
      imageUrls: string[];
    };
  }>;
}

export interface AdminOrdersQuery {
  page: number;
  limit: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

export interface AdminOrdersResponse {
  message: string;
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminOrderResponse {
  message: string;
  order: AdminOrder;
}
