import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CompanyOrders } from "@/features/delivery-company/components/company-orders";
export default async function Page() { const t = await getTranslations("DeliveryCompany"); return <DashboardShell title={t("orders.title")} description={t("orders.description")} contentClassName="max-w-5xl"><CompanyOrders/></DashboardShell>; }
