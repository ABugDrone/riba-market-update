import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPublishedProducts, getProduct, getStoreProducts,
  getSellerProducts, createProduct, updateProduct, deleteProduct,
  searchProducts,
} from "@/lib/productService";
import type { ProductInsert, ProductUpdate } from "@/lib/supabase.types";

export const productKeys = {
  all: ["products"] as const,
  published: (opts?: object) => [...productKeys.all, "published", opts] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
  store: (storeId: string) => [...productKeys.all, "store", storeId] as const,
  seller: (profileId: string) => [...productKeys.all, "seller", profileId] as const,
  search: (q: string) => [...productKeys.all, "search", q] as const,
};

export function usePublishedProducts(opts?: {
  category?: string;
  storeId?: string;
  search?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: productKeys.published(opts),
    queryFn: () => getPublishedProducts(opts),
  });
}

export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(productId ?? ""),
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
  });
}

export function useStoreProducts(storeId: string | undefined, includeAll = false) {
  return useQuery({
    queryKey: [...productKeys.store(storeId ?? ""), includeAll],
    queryFn: () => getStoreProducts(storeId!, includeAll),
    enabled: !!storeId,
  });
}

export function useSellerProducts(profileId: string | undefined) {
  return useQuery({
    queryKey: productKeys.seller(profileId ?? ""),
    queryFn: () => getSellerProducts(profileId!),
    enabled: !!profileId,
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => searchProducts(query),
    enabled: query.length > 1,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductInsert) => createProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProductUpdate }) =>
      updateProduct(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}
