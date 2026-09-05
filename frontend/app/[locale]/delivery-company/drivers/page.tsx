import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CompanyDrivers } from "@/features/delivery-company/components/company-drivers";
export default async function Page() { const t = await getTranslations("DeliveryCompany"); return <DashboardShell title={t("drivers.title")} description={t("drivers.description")} contentClassName="max-w-5xl"><CompanyDrivers/></DashboardShell>; }
