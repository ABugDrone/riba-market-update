import { supabase } from "./supabase";
import type { CartItem } from "./supabase.types";

// Existing table is "carts" with buyer_id → profiles.id

export async function getCartItems(profileId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("carts")
    .select("*, product:products(*, store:seller_stores(*))")
    .eq("buyer_id", profileId)
    .order("added_at", { ascending: false });
  if (error) { console.error("getCartItems:", error.message); return []; }
  return (data ?? []) as CartItem[];
}

export async function addToCart(profileId: string, productId: string, quantity = 1): Promise<{ error?: string }> {
  const { data: existing } = await supabase
    .from("carts")
    .select("id, quantity")
    .eq("buyer_id", profileId)
    .eq("product_id", productId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("carts")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("carts")
      .insert({ buyer_id: profileId, product_id: productId, quantity });
    if (error) return { error: error.message };
  }
  return {};
}

export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<{ error?: string }> {
  if (quantity <= 0) return removeFromCart(cartItemId);
  const { error } = await supabase.from("carts").update({ quantity }).eq("id", cartItemId);
  if (error) return { error: error.message };
  return {};
}

export async function removeFromCart(cartItemId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("carts").delete().eq("id", cartItemId);
  if (error) return { error: error.message };
  return {};
}

export async function clearCart(profileId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("carts").delete().eq("buyer_id", profileId);
  if (error) return { error: error.message };
  return {};
}

export async function getCartCount(profileId: string): Promise<number> {
  const { count } = await supabase
    .from("carts")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", profileId);
  return count ?? 0;
}
