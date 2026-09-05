import type { ReactNode } from "react";
import { RoleGuard } from "@/features/auth/components/role-guard";
export default function DeliveryCompanyLayout({ children }: { children: ReactNode }) { return <RoleGuard allowedRoles={["DELIVERY_COMPANY"]}>{children}</RoleGuard>; }
