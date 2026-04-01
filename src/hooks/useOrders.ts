import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBuyerOrders, getOrder, getSellerOrders,
  createOrder, updateOrderStatus,
} from "@/lib/orderService";
import type { PaymentMethod, DeliveryAddress, BuyerInfo } from "@/lib/supabase.types";

export const orderKeys = {
  all: ["orders"] as const,
  buyer: (id: string) => [...orderKeys.all, "buyer", id] as const,
  seller: (id: string) => [...orderKeys.all, "seller", id] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useBuyerOrders(buyerId: string | undefined) {
  return useQuery({
    queryKey: orderKeys.buyer(buyerId ?? ""),
    queryFn: () => getBuyerOrders(buyerId!),
    enabled: !!buyerId,
  });
}

export function useSellerOrders(profileId: string | undefined) {
  return useQuery({
    queryKey: orderKeys.seller(profileId ?? ""),
    queryFn: () => getSellerOrders(profileId!),
    enabled: !!profileId,
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(orderId ?? ""),
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: Parameters<typeof createOrder>[0]) => createOrder(opts),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Parameters<typeof updateOrderStatus>[1] }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
