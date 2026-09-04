import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProductsManagement } from "@/features/shop-owner/components/products-management";
export default async function ProductsPage() { const t = await getTranslations("ShopOwner"); return <DashboardShell title={t("products.pageTitle")} description={t("products.pageDescription")}><div className="mx-auto max-w-6xl [&>div>div:first-child]:border-0 [&>div>div:first-child]:bg-transparent [&>div>div:first-child]:p-0 [&>div>div:first-child]:shadow-none"><ProductsManagement /></div></DashboardShell>; }
