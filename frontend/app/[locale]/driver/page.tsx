import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DriverDashboard } from "@/features/driver/components/driver-dashboard";
export default async function Page() { const t = await getTranslations("Driver"); return <DashboardShell title={t("dashboard.title")} description={t("dashboard.description")} contentClassName="max-w-5xl"><DriverDashboard/></DashboardShell>; }
