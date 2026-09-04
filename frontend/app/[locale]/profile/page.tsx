import { getTranslations } from "next-intl/server";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProfileManagement } from "@/features/profile/components/profile-management";

export default async function ProfilePage() {
  const t = await getTranslations("Profile");
  return <DashboardShell title={t("page.title")} description={t("page.description")}><ProfileManagement /></DashboardShell>;
}
