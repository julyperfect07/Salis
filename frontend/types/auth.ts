export type UserRole = "ADMIN" | "SHOP_OWNER" | "DELIVERY_COMPANY" | "DRIVER";

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  imageUrl?: string | null;
  role: UserRole;
  isActive?: boolean;
}

export interface LoginResponse {
  message: string;
}
