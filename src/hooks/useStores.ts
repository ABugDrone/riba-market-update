import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSellerStores, getStore, getStoreByName, getPublicStores, getStoresByIds,
  createStore, updateStore, deleteStore,
  followStore, unfollowStore, isFollowingStore,
} from "@/lib/storeService";
import type { SellerStoreInsert, SellerStoreUpdate } from "@/lib/supabase.types";

export const storeKeys = {
  all: ["stores"] as const,
  seller: (profileId: string) => [...storeKeys.all, "seller", profileId] as const,
  detail: (id: string) => [...storeKeys.all, "detail", id] as const,
  byName: (name: string) => [...storeKeys.all, "name", name] as const,
  public: (opts?: object) => [...storeKeys.all, "public", opts] as const,
  following: (storeId: string, followerId: string) => [...storeKeys.all, "following", storeId, followerId] as const,
};

export function useSellerStores(profileId: string | undefined) {
  return useQuery({
    queryKey: storeKeys.seller(profileId ?? ""),
    queryFn: () => getSellerStores(profileId!),
    enabled: !!profileId,
  });
}

export function useStore(storeId: string | undefined) {
  return useQuery({
    queryKey: storeKeys.detail(storeId ?? ""),
    queryFn: () => getStore(storeId!),
    enabled: !!storeId,
  });
}

export function useStoreByName(storeName: string | undefined) {
  return useQuery({
    queryKey: storeKeys.byName(storeName ?? ""),
    queryFn: () => getStoreByName(storeName!),
    enabled: !!storeName,
  });
}

export function usePublicStores(opts?: { storeType?: string; search?: string; limit?: number }) {
  return useQuery({
    queryKey: storeKeys.public(opts),
    queryFn: () => getPublicStores(opts),
  });
}

export function useIsFollowingStore(storeId: string | undefined, followerId: string | undefined) {
  return useQuery({
    queryKey: storeKeys.following(storeId ?? "", followerId ?? ""),
    queryFn: () => isFollowingStore(storeId!, followerId!),
    enabled: !!storeId && !!followerId,
  });
}

export function useStoresByIds(ids: string[] | undefined) {
  return useQuery({
    queryKey: [...storeKeys.all, "byIds", ids],
    queryFn: () => getStoresByIds(ids!),
    enabled: !!ids && ids.length > 0,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SellerStoreInsert) => createStore(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SellerStoreUpdate }) =>
      updateStore(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useDeleteStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useFollowStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, followerId }: { storeId: string; followerId: string }) =>
      followStore(storeId, followerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUnfollowStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, followerId }: { storeId: string; followerId: string }) =>
      unfollowStore(storeId, followerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
  });
}
