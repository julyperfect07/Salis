import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CompanyOrderDetails } from "@/features/delivery-company/components/company-order-details";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const [{ id }, t] = await Promise.all([params, getTranslations("DeliveryCompany")]); return <DashboardShell title={t("details.title")} description={t("details.description")} contentClassName="max-w-4xl"><CompanyOrderDetails orderId={id}/></DashboardShell>; }
