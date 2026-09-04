import { getTranslations } from "next-intl/server";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";

export default async function AdminDashboardPage() {
  const t = await getTranslations("AdminDashboard");

  return (
    <DashboardShell title={t("page.title")} description={t("page.description")}>
      <AdminDashboard />
    </DashboardShell>
  );
}
