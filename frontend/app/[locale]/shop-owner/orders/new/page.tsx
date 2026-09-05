import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CreateOrderForm } from "@/features/shop-owner/components/create-order-form";
export default async function NewOrderPage() { const t = await getTranslations("ShopOwner"); return <DashboardShell title={t("orders.create.pageTitle")} description={t("orders.create.pageDescription")} contentClassName="max-w-6xl"><CreateOrderForm /></DashboardShell>; }
