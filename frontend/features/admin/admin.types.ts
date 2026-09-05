export interface AdminDashboardResponse {
  message: string;

  users: {
    total: number;
    active: number;
    shopOwners: number;
    deliveryCompanies: number;
    drivers: number;
    admins: number;
  };

  products: {
    total: number;
    active: number;
  };

  orders: {
    total: number;
    byStatus: {
      PENDING: number;
      ACCEPTED: number;
      PICKED_UP: number;
      OUT_FOR_DELIVERY: number;
      DELIVERED: number;
      FAILED: number;
      RETURNED: number;
      CANCELLED: number;
      REJECTED: number;
    };
  };

  financials: {
    productsTotal: string;
    deliveryFees: string;
    customerTotal: string;
    platformRevenue: string;
    unpaidToShops: string;
  };
}
