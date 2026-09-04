import type { UserRole } from "@/types/auth";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  imageUrl: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryCompanyDetails {
  deliveryPrice: string;
  openTime: string;
  closeTime: string;
  coverageZones: string[];

  _count: {
    drivers: number;
    orders: number;
  };
}

export interface DriverDetails {
  companyId: string;

  company: {
    user: {
      id: string;
      name: string;
      phoneNumber: string;
    };
  };

  _count: {
    orders: number;
  };
}

export interface ShopOwnerDetails {
  _count?: {
    products: number;
    orders: number;
  };
}

export interface AdminUserDetails extends AdminUser {
  shopOwner: ShopOwnerDetails | null;
  deliveryCompany: DeliveryCompanyDetails | null;
  driver: DriverDetails | null;
}

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  message: string;
  users: AdminUser[];
  pagination: UsersPagination;
}

export interface AdminUserResponse {
  message: string;
  user: AdminUserDetails;
}

export interface UpdateUserStatusResponse {
  message: string;
  user: AdminUser;
}

export interface AdminUsersQuery {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
}

export interface UpdateAdminUserInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  imageUrl?: string | null;
}

export interface UpdateAdminUserResponse {
  message: string;
  user: AdminUser;
}

export interface ResetUserPasswordInput {
  newPassword: string;
}

export interface ResetUserPasswordResponse {
  message: string;
}

export type DeliveryZone =
  | "AMMAN_CENTRAL"
  | "AMMAN_WEST"
  | "AMMAN_EAST"
  | "AMMAN_NORTH"
  | "AMMAN_SOUTH";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
  imageUrl?: string;

  // Driver fields
  companyId?: string;

  // Delivery company fields
  deliveryPrice?: number;
  openTime?: string;
  closeTime?: string;
  coverageZones?: DeliveryZone[];
}

export interface CreatedUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  imageUrl: string | null;
  role: UserRole;
}
