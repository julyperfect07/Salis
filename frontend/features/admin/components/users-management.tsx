"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Search, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { usePaginationCorrection } from "@/hooks/use-pagination-correction";
import type { UserRole } from "@/types/auth";
import { useAdminUsers } from "../use-admin-users";
import { UserStatusDialog } from "./user-status-dialog";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function UsersManagement() {
  const locale = useLocale();
  const t = useTranslations("AdminUsers");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "ALL">("ALL");

  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    limit: 10,
    search: deferredSearch || undefined,
    role: role === "ALL" ? undefined : role,
  });
  usePaginationCorrection(page, data?.pagination.totalPages, setPage);

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleRoleChange(value: string | null) {
    if (!value) {
      return;
    }

    setRole(value as UserRole | "ALL");
    setPage(1);
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("list.title")}</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("list.description")}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 sm:w-72">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder={t("list.searchPlaceholder")}
              className="h-10 rounded-full ps-9"
            />
          </div>

          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger className="h-10 w-full rounded-full sm:w-48">
              <SelectValue placeholder={t("list.allRoles")} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">{t("list.allRoles")}</SelectItem>

              <SelectItem value="SHOP_OWNER">
                {t("roles.SHOP_OWNER")}
              </SelectItem>

              <SelectItem value="DELIVERY_COMPANY">
                {t("roles.DELIVERY_COMPANY")}
              </SelectItem>

              <SelectItem value="DRIVER">{t("roles.DRIVER")}</SelectItem>

              <SelectItem value="ADMIN">{t("roles.ADMIN")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError || !data ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <UserRound className="size-5" />
          </div>

          <div>
            <h3 className="font-semibold">{t("list.errorTitle")}</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("list.errorDescription")}
            </p>
          </div>

          <Button type="button" onClick={() => refetch()}>
            {t("actions.retry")}
          </Button>
        </div>
      ) : data.users.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <UserRound className="size-5" />
          </div>

          <h3 className="mt-4 font-semibold">{t("list.emptyTitle")}</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("list.emptyDescription")}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>{t("list.columns.user")}</TableHead>
                  <TableHead>{t("list.columns.role")}</TableHead>
                  <TableHead>{t("list.columns.phone")}</TableHead>
                  <TableHead>{t("list.columns.status")}</TableHead>
                  <TableHead>{t("list.columns.created")}</TableHead>
                  <TableHead className="text-end">
                    {t("list.columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="transition-colors duration-200 hover:bg-primary/[0.035]"
                  >
                    <TableCell>
                      <div className="flex min-w-52 items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage
                            src={user.imageUrl ?? undefined}
                            alt={user.name}
                          />

                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="truncate font-medium">{user.name}</p>

                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2.5 py-1 font-medium"
                      >
                        {t(`roles.${user.role}`)}
                      </Badge>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {user.phoneNumber}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 rounded-full px-2.5 py-1 transition-colors",
                          user.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            user.isActive ? "bg-emerald-500" : "bg-red-500",
                          )}
                        />

                        {user.isActive ? t("list.active") : t("list.inactive")}
                      </Badge>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/users/${user.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        >
                          {t("actions.view")}
                        </Link>

                        <UserStatusDialog user={user} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-muted-foreground">
              {t("list.showing", {
                shown: data.users.length,
                total: data.pagination.total,
              })}
            </p>

            <Pagination className="mx-0 w-auto justify-start sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full transition-transform duration-200 active:scale-95"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((currentPage) => Math.max(1, currentPage - 1))
                    }
                    aria-label={t("actions.previous")}
                  >
                    <ChevronLeft className="size-4 rtl:rotate-180" />
                  </Button>
                </PaginationItem>

                <PaginationItem>
                  <div className="flex h-9 min-w-20 items-center justify-center rounded-full bg-muted px-3 text-sm">
                    {data.pagination.page} /{" "}
                    {Math.max(data.pagination.totalPages, 1)}
                  </div>
                </PaginationItem>

                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full transition-transform duration-200 active:scale-95"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                    aria-label={t("actions.next")}
                  >
                    <ChevronRight className="size-4 rtl:rotate-180" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </section>
  );
}
