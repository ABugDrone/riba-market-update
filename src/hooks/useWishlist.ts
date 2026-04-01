import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWishlist, addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/wishlistService";

export const wishlistKeys = {
  all: ["wishlist"] as const,
  list: (profileId: string) => [...wishlistKeys.all, profileId] as const,
  check: (profileId: string, productId: string) => [...wishlistKeys.all, "check", profileId, productId] as const,
};

export function useWishlist(profileId: string | undefined) {
  return useQuery({
    queryKey: wishlistKeys.list(profileId ?? ""),
    queryFn: () => getWishlist(profileId!),
    enabled: !!profileId,
  });
}

export function useIsInWishlist(profileId: string | undefined, productId: string | undefined) {
  return useQuery({
    queryKey: wishlistKeys.check(profileId ?? "", productId ?? ""),
    queryFn: () => isInWishlist(profileId!, productId!),
    enabled: !!profileId && !!productId,
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, productId }: { profileId: string; productId: string }) =>
      addToWishlist(profileId, productId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: wishlistKeys.list(vars.profileId) });
      qc.invalidateQueries({ queryKey: wishlistKeys.check(vars.profileId, vars.productId) });
    },
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, productId }: { profileId: string; productId: string }) =>
      removeFromWishlist(profileId, productId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: wishlistKeys.list(vars.profileId) });
      qc.invalidateQueries({ queryKey: wishlistKeys.check(vars.profileId, vars.productId) });
    },
  });
}
