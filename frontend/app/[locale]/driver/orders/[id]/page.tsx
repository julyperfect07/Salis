import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DriverOrderDetails } from "@/features/driver/components/driver-order-details";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const [{ id }, t] = await Promise.all([params, getTranslations("Driver")]); return <DashboardShell title={t("details.title")} description={t("details.description")} contentClassName="max-w-3xl"><DriverOrderDetails orderId={id}/></DashboardShell>; }
