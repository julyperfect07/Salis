"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as service from "./delivery-company-api";
import type { CompanyOrdersQuery, CreateDriverInput } from "./delivery-company.types";

export function useCompanyDashboard() {
  return useQuery({ queryKey: ["company", "dashboard"], queryFn: service.getCompanyDashboard });
}
export function useCompanyOrders(query: CompanyOrdersQuery) {
  return useQuery({ queryKey: ["company", "orders", query], queryFn: () => service.getCompanyOrders(query), placeholderData: (old) => old });
}
export function useCompanyOrder(id: string) {
  return useQuery({ queryKey: ["company", "orders", id], queryFn: () => service.getCompanyOrder(id) });
}
export function useDrivers(page = 1, limit = 100) {
  return useQuery({ queryKey: ["company", "drivers", page, limit], queryFn: () => service.getDrivers(page, limit) });
}
function useRefreshCompany() {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: ["company", "orders"] });
    client.invalidateQueries({ queryKey: ["company", "dashboard"] });
  };
}
export function useAcceptOrder() { const done = useRefreshCompany(); return useMutation({ mutationFn: service.acceptOrder, onSuccess: done }); }
export function useRejectOrder() { const done = useRefreshCompany(); return useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => service.rejectOrder(id, reason), onSuccess: done }); }
export function useAssignDriver() { const done = useRefreshCompany(); return useMutation({ mutationFn: ({ id, driverId }: { id: string; driverId: string }) => service.assignDriver(id, driverId), onSuccess: done }); }
export function useConfirmPayment() { const done = useRefreshCompany(); return useMutation({ mutationFn: service.confirmPayment, onSuccess: done }); }
export function useCreateDriver() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateDriverInput) => service.createDriver(input), onSuccess: () => { client.invalidateQueries({ queryKey: ["company", "drivers"] }); client.invalidateQueries({ queryKey: ["company", "dashboard"] }); } }); }
export function useUpdateDriverStatus() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => service.updateDriverStatus(id, isActive), onSuccess: () => client.invalidateQueries({ queryKey: ["company", "drivers"] }) }); }
