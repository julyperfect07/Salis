import { Check, Circle, PackageCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/features/admin/orders.types";

const steps: OrderStatus[] = ["ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
export function DriverStatus({ status, labels }: { status: OrderStatus; labels: Record<string, string> }) {
  const current = steps.indexOf(status); const terminal = status === "FAILED" || status === "RETURNED" || status === "CANCELLED" || status === "REJECTED";
  const icons = [PackageCheck, Check, Truck, Check];
  return <div className="grid grid-cols-4 gap-1">{steps.map((step, index) => { const Icon = icons[index] ?? Circle; const reached = !terminal && index <= current; return <div key={step} className="relative flex flex-col items-center text-center"><div className={cn("relative z-10 flex size-8 items-center justify-center rounded-full border bg-card", reached && "border-primary bg-primary text-primary-foreground") }><Icon className="size-3.5"/></div>{index < 3 && <div className={cn("absolute start-1/2 top-4 h-px w-full bg-border", reached && index < current && "bg-primary")}/>}<span className={cn("mt-2 text-[10px] text-muted-foreground sm:text-xs", reached && "font-medium text-foreground")}>{labels[step]}</span></div>; })}</div>;
}
