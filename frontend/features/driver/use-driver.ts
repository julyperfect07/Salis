"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as service from "./driver-api";
import type { DriverOrdersQuery } from "./driver.types";

export function useDriverDashboard() { return useQuery({ queryKey: ["driver", "dashboard"], queryFn: service.getDashboard }); }
export function useDriverOrders(query: DriverOrdersQuery) { return useQuery({ queryKey: ["driver", "orders", query], queryFn: () => service.getOrders(query), placeholderData: old => old }); }
export function useDriverOrder(id: string) { return useQuery({ queryKey: ["driver", "orders", id], queryFn: () => service.getOrder(id) }); }
function useRefresh() { const client = useQueryClient(); return () => { client.invalidateQueries({ queryKey: ["driver", "orders"] }); client.invalidateQueries({ queryKey: ["driver", "dashboard"] }); }; }
export function useVerifyPickup() { const done = useRefresh(); return useMutation({ mutationFn: ({ id, pickupCode }: { id: string; pickupCode: string }) => service.verifyPickup(id, pickupCode), onSuccess: done }); }
export function useStartDelivery() { const done = useRefresh(); return useMutation({ mutationFn: service.startDelivery, onSuccess: done }); }
export function useDeliverOrder() { const done = useRefresh(); return useMutation({ mutationFn: service.deliverOrder, onSuccess: done }); }
export function useFailOrder() { const done = useRefresh(); return useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => service.failOrder(id, reason), onSuccess: done }); }
