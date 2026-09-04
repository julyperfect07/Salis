"use client";

import { motion } from "motion/react";
import { PackageCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { Link } from "@/i18n/navigation";

const footerLinks = [
  {
    label: "features",
    href: "#features",
  },
  {
    label: "howItWorks",
    href: "#how-it-works",
  },
  {
    label: "roles",
    href: "#roles",
  },
  {
    label: "faq",
    href: "#faq",
  },
] as const;

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function LandingFooter() {
  const t = useTranslations("Footer");
  const common = useTranslations("Common");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <footer className="px-3 pb-3 pt-8 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary text-primary-foreground">
        <div className="grid items-end gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1fr_auto] lg:px-16 lg:py-16">
          <motion.div
            initial={{
              opacity: 0,
              x: isArabic ? 120 : -120,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 1.4,
              ease: smoothEase,
            }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">
              {t("eyebrow")}
            </p>

            <h2
              className={
                isArabic
                  ? "mt-4 max-w-3xl text-3xl font-extrabold leading-[1.5] sm:text-4xl"
                  : "mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl"
              }
            >
              {t("title")}
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              {t("description")}
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: isArabic ? -80 : 80,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 1.3,
              delay: 0.2,
              ease: smoothEase,
            }}
          >
            <LoginDialog
              triggerLabel={t("login")}
              triggerClassName="h-12 bg-white px-7 text-primary hover:bg-white/90 hover:text-primary"
            />
          </motion.div>
        </div>

        <Separator className="bg-white/15" />

        <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_auto] lg:px-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-full bg-white text-primary">
                <PackageCheck className="size-5" />
              </span>

              <span className="text-xl font-extrabold tracking-tight">
                {common("appName")}
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
              {t("copyright")}
            </p>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold">{t("platform")}</p>

            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
              <Link href="/" className="transition-colors hover:text-white">
                {t("home")}
              </Link>

              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {t(link.label)}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="px-6 pb-8 text-xs text-white/45 sm:px-10 lg:px-16">
          © 2026 {common("appName")}
        </div>
      </div>
    </footer>
  );
}
