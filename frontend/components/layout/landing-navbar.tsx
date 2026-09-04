"use client";

import { Menu, PackageCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { Link } from "@/i18n/navigation";

import { LanguageSwitcher } from "../shared/language-switcher";
import { ThemeToggle } from "../shared/theme-toggle";

const navigationItems = [
  { key: "features", href: "#features" },
  { key: "howItWorks", href: "#how-it-works" },
  { key: "roles", href: "#roles" },
  { key: "faq", href: "#faq" },
] as const;

export function LandingNavbar() {
  const t = useTranslations("Navigation");
  const common = useTranslations("Common");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-border/70 bg-card/85 px-4 shadow-sm backdrop-blur-xl sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <PackageCheck className="size-5" />
          </span>

          <span className="text-xl font-extrabold tracking-tight text-primary">
            {common("appName")}
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full bg-muted/70 p-1 md:flex">
          {navigationItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              {t(item.key)}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />

          <div className="hidden sm:block">
            <LoginDialog />
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full md:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side={locale === "ar" ? "left" : "right"}
              className="w-[86%] max-w-sm"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-primary">
                  <PackageCheck className="size-5" />
                  {common("appName")}
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2 px-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {t(item.key)}
                  </a>
                ))}

                <div className="mt-4 border-t pt-5 sm:hidden">
                  <LoginDialog />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
