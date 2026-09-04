import { getTranslations } from "next-intl/server";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CreateUserDialog } from "@/features/admin/components/create-user-dialog";
import { UsersManagement } from "@/features/admin/components/users-management";

export default async function AdminUsersPage() {
  const t = await getTranslations("AdminUsers");

  return (
    <DashboardShell
      title={t("page.title")}
      description={t("page.description")}
      action={<CreateUserDialog />}
    >
      <UsersManagement />
    </DashboardShell>
  );
}
