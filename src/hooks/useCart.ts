import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCartItems, addToCart, updateCartQuantity,
  removeFromCart, clearCart, getCartCount,
} from "@/lib/cartService";

export const cartKeys = {
  all: ["cart"] as const,
  items: (profileId: string) => [...cartKeys.all, "items", profileId] as const,
  count: (profileId: string) => [...cartKeys.all, "count", profileId] as const,
};

export function useCartItems(profileId: string | undefined) {
  return useQuery({
    queryKey: cartKeys.items(profileId ?? ""),
    queryFn: () => getCartItems(profileId!),
    enabled: !!profileId,
  });
}

export function useCartCount(profileId: string | undefined) {
  return useQuery({
    queryKey: cartKeys.count(profileId ?? ""),
    queryFn: () => getCartCount(profileId!),
    enabled: !!profileId,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, productId, quantity }: { profileId: string; productId: string; quantity?: number }) =>
      addToCart(profileId, productId, quantity),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: cartKeys.items(vars.profileId) });
      qc.invalidateQueries({ queryKey: cartKeys.count(vars.profileId) });
    },
  });
}

export function useUpdateCartQuantity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      updateCartQuantity(cartItemId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all }),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: string) => removeFromCart(cartItemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => clearCart(profileId),
    onSuccess: (_data, profileId) => {
      qc.invalidateQueries({ queryKey: cartKeys.items(profileId) });
      qc.invalidateQueries({ queryKey: cartKeys.count(profileId) });
    },
  });
}
