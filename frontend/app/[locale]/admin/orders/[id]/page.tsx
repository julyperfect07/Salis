import { getTranslations } from "next-intl/server";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OrderDetails } from "@/features/admin/components/order-details";

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  const t = await getTranslations("AdminOrders");

  return (
    <DashboardShell title={t("details.pageTitle")} description={t("details.pageDescription")}>
      <OrderDetails orderId={id} />
    </DashboardShell>
  );
}
