import type { ReactNode } from "react";
import { RoleGuard } from "@/features/auth/components/role-guard";
export default function DriverLayout({ children }: { children: ReactNode }) { return <RoleGuard allowedRoles={["DRIVER"]}>{children}</RoleGuard>; }
