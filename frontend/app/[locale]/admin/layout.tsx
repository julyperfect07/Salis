import type { ReactNode } from "react";

import { RoleGuard } from "@/features/auth/components/role-guard";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <RoleGuard allowedRoles={["ADMIN"]}>{children}</RoleGuard>;
}
