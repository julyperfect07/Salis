import { getTranslations } from "next-intl/server";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OrdersManagement } from "@/features/admin/components/orders-management";

export default async function AdminOrdersPage() {
  const t = await getTranslations("AdminOrders");

  return (
    <DashboardShell
      title={t("page.title")}
      description={t("page.description")}
    >
      <OrdersManagement />
    </DashboardShell>
  );
}
