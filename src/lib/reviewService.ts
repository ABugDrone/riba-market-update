import { supabase } from "./supabase";
import type { Review, ReviewInsert, SellerReply } from "./supabase.types";

export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) { console.error("getProductReviews:", error.message); return []; }
  return (data ?? []) as Review[];
}

export async function getStoreReviews(storeId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  if (error) { console.error("getStoreReviews:", error.message); return []; }
  return (data ?? []) as Review[];
}

// buyer_id = profiles.id
export async function createReview(payload: ReviewInsert): Promise<{ review?: Review; error?: string }> {
  const { data, error } = await supabase
    .from("reviews")
    .insert(payload)
    .select()
    .single();
  if (error) return { error: error.message };
  return { review: data as Review };
}

export async function addSellerReply(reviewId: string, reply: SellerReply): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("reviews")
    .update({ seller_reply: reply, updated_at: new Date().toISOString() })
    .eq("id", reviewId);
  if (error) return { error: error.message };
  return {};
}

export async function markReviewHelpful(reviewId: string): Promise<{ error?: string }> {
  const { data } = await supabase.from("reviews").select("helpful").eq("id", reviewId).single();
  if (data) {
    await supabase.from("reviews").update({ helpful: (data.helpful ?? 0) + 1 }).eq("id", reviewId);
  }
  return {};
}

export async function deleteReview(reviewId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { error: error.message };
  return {};
}
