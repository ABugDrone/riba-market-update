import { supabase } from "./supabase";
import type { WishlistItem } from "./supabase.types";

// profile_id = profiles.id (PK)

// ── Get wishlist items ────────────────────────────────────────
export async function getWishlist(profileId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from("wishlists")
    .select("*, product:products(*, store:seller_stores(*))")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) { console.error("getWishlist:", error.message); return []; }
  return (data ?? []) as WishlistItem[];
}

// ── Add to wishlist ───────────────────────────────────────────
export async function addToWishlist(
  profileId: string,
  productId: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("wishlists")
    .insert({ profile_id: profileId, product_id: productId });
  if (error && error.code !== "23505") return { error: error.message }; // ignore duplicate
  return {};
}

// ── Remove from wishlist ──────────────────────────────────────
export async function removeFromWishlist(
  profileId: string,
  productId: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("profile_id", profileId)
    .eq("product_id", productId);
  if (error) return { error: error.message };
  return {};
}

// ── Check if product is in wishlist ───────────────────────────
export async function isInWishlist(profileId: string, productId: string): Promise<boolean> {
  const { data } = await supabase
    .from("wishlists")
    .select("id")
    .eq("profile_id", profileId)
    .eq("product_id", productId)
    .single();
  return !!data;
}
