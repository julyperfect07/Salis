import type { ReactNode } from "react";

import { RoleGuard } from "@/features/auth/components/role-guard";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN", "SHOP_OWNER", "DELIVERY_COMPANY", "DRIVER"]}>{children}</RoleGuard>;
}
