import type { ReactNode } from "react";
import { RoleGuard } from "@/features/auth/components/role-guard";
export default function ShopOwnerLayout({ children }: { children: ReactNode }) { return <RoleGuard allowedRoles={["SHOP_OWNER"]}>{children}</RoleGuard>; }
