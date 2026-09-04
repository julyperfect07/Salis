import { getTranslations } from "next-intl/server";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UserDetails } from "@/features/admin/components/user-details";

interface AdminUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminUserPage({ params }: AdminUserPageProps) {
  const { id } = await params;
  const t = await getTranslations("AdminUsers");

  return (
    <DashboardShell
      title={t("details.pageTitle")}
      description={t("details.pageDescription")}
    >
      <UserDetails userId={id} />
    </DashboardShell>
  );
}
