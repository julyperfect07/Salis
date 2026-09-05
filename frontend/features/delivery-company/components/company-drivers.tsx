"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search, UserRoundPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateDriver, useDrivers, useUpdateDriverStatus } from "../use-delivery-company";

export function CompanyDrivers() {
  const t = useTranslations("DeliveryCompany"); const [open, setOpen] = useState(false); const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useDrivers(); const create = useCreateDriver(); const status = useUpdateDriverStatus();
  const drivers = data?.drivers.filter(({ user }) => `${user.name} ${user.email} ${user.phoneNumber}`.toLowerCase().includes(search.toLowerCase())) ?? [];
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); create.mutate({ name: String(form.get("name")), email: String(form.get("email")), phoneNumber: String(form.get("phone")), password: String(form.get("password")) }, { onSuccess: () => { toast.success(t("drivers.created")); setOpen(false); }, onError: () => toast.error(t("drivers.createError")) }); }

  return <div className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("drivers.search")} className="h-11 rounded-full bg-card ps-11" /></div><Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button className="h-11 rounded-full" />}><Plus className="size-4" />{t("drivers.add")}</DialogTrigger><DialogContent className="rounded-3xl sm:max-w-md"><DialogHeader><div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UserRoundPlus /></div><DialogTitle>{t("drivers.formTitle")}</DialogTitle><DialogDescription>{t("drivers.formHint")}</DialogDescription></DialogHeader><form onSubmit={submit} className="grid gap-4"><Field label={t("drivers.name")} name="name" required minLength={2} /><Field label={t("drivers.email")} name="email" type="email" required /><Field label={t("drivers.phone")} name="phone" required /><Field label={t("drivers.password")} name="password" type="password" required minLength={8} /><Button disabled={create.isPending} className="mt-2 rounded-full">{create.isPending ? t("drivers.creating") : t("drivers.create")}</Button></form></DialogContent></Dialog></div>
    {isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div> : isError ? <Card className="rounded-3xl"><CardContent className="flex min-h-64 flex-col items-center justify-center gap-4"><Users className="size-10 text-destructive"/><p>{t("common.loadError")}</p><Button onClick={() => refetch()}>{t("actions.retry")}</Button></CardContent></Card> : drivers.length === 0 ? <Card className="rounded-3xl"><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><Users className="size-10 text-primary"/><p className="mt-4 font-medium">{t("drivers.empty")}</p><p className="mt-1 text-sm text-muted-foreground">{t("drivers.emptyHint")}</p></CardContent></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{drivers.map(({ user }) => { const active = user.isActive !== false; return <Card key={user.id} className="rounded-3xl"><CardContent className="p-5"><div className="flex items-start gap-4"><Avatar className="size-12"><AvatarImage src={user.imageUrl ?? undefined}/><AvatarFallback className="bg-primary/10 font-semibold text-primary">{user.name.split(" ").map(v => v[0]).slice(0,2).join("")}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate font-semibold">{user.name}</p><Badge variant={active ? "default" : "secondary"} className="rounded-full">{active ? t("drivers.active") : t("drivers.suspended")}</Badge></div><p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p><p className="mt-0.5 text-sm text-muted-foreground" dir="ltr">{user.phoneNumber}</p></div></div><Button variant="outline" className="mt-5 w-full rounded-full" disabled={status.isPending} onClick={() => status.mutate({ id: user.id, isActive: !active }, { onSuccess: () => toast.success(t("drivers.statusSaved")), onError: () => toast.error(t("drivers.statusError")) })}>{active ? t("drivers.suspend") : t("drivers.activate")}</Button></CardContent></Card>; })}</div>}
  </div>;
}

function Field({ label, name, ...props }: React.ComponentProps<typeof Input> & { label: string; name: string }) { return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} className="h-11 rounded-xl" {...props}/></div>; }
