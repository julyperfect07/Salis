"use client";

import { Check, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Common");
  const pathname = usePathname();

  function changeLanguage(nextLocale: "en" | "ar") {
    if (nextLocale === locale) return;

    const nextPath = `/${nextLocale}${pathname === "/" ? "" : pathname}`;
    // A full locale navigation prevents the root theme script from being
    // re-rendered as a client-side React child.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(
      `${nextPath}${window.location.search}${window.location.hash}`,
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("language")}
            className="rounded-full"
          />
        }
      >
        <Languages className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("en")}>
          English
          {locale === "en" && (
            <Check className="ms-auto size-4 text-primary" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => changeLanguage("ar")}>
          العربية
          {locale === "ar" && (
            <Check className="ms-auto size-4 text-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
