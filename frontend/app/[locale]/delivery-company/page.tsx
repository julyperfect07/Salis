import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CompanyDashboard } from "@/features/delivery-company/components/company-dashboard";
export default async function Page() { const t = await getTranslations("DeliveryCompany"); return <DashboardShell title={t("dashboard.title")} description={t("dashboard.description")} contentClassName="max-w-6xl"><CompanyDashboard/></DashboardShell>; }
