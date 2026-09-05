import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DriverOrders } from "@/features/driver/components/driver-orders";
export default async function Page() { const t = await getTranslations("Driver"); return <DashboardShell title={t("orders.title")} description={t("orders.description")} contentClassName="max-w-4xl"><DriverOrders/></DashboardShell>; }
