import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductReviews, getStoreReviews, createReview,
  addSellerReply, markReviewHelpful, deleteReview,
} from "@/lib/reviewService";
import type { ReviewInsert, SellerReply } from "@/lib/supabase.types";

export const reviewKeys = {
  all: ["reviews"] as const,
  product: (id: string) => [...reviewKeys.all, "product", id] as const,
  store: (id: string) => [...reviewKeys.all, "store", id] as const,
};

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.product(productId ?? ""),
    queryFn: () => getProductReviews(productId!),
    enabled: !!productId,
  });
}

export function useStoreReviews(storeId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.store(storeId ?? ""),
    queryFn: () => getStoreReviews(storeId!),
    enabled: !!storeId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewInsert) => createReview(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.all }),
  });
}

export function useAddSellerReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: SellerReply }) =>
      addSellerReply(reviewId, reply),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.all }),
  });
}

export function useMarkReviewHelpful() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => markReviewHelpful(reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.all }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.all }),
  });
}
