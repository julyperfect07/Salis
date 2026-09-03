export type UserRole = "ADMIN" | "SHOP_OWNER" | "DELIVERY_COMPANY" | "DRIVER";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  message: string;
}
