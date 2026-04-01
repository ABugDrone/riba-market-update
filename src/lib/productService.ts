import { supabase } from "./supabase";
import type { Product, ProductInsert, ProductUpdate } from "./supabase.types";

// Active products visible to everyone
export async function getPublishedProducts(opts?: {
  category?: string;
  storeId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*, store:seller_stores(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (opts?.storeId) query = query.eq("store_id", opts.storeId);
  if (opts?.category) query = query.ilike("category", `%${opts.category}%`);
  if (opts?.search) query = query.ilike("name", `%${opts.search}%`);
  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1);

  const { data, error } = await query;
  if (error) { console.error("getPublishedProducts:", error.message); return []; }
  return (data ?? []) as Product[];
}

export async function getProduct(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, store:seller_stores(*)")
    .eq("id", productId)
    .single();
  if (error) { console.error("getProduct:", error.message); return null; }
  return data as Product;
}

// All products for a seller (across all their stores)
export async function getSellerProducts(profileId: string): Promise<Product[]> {
  const { data: stores } = await supabase
    .from("seller_stores")
    .select("id")
    .eq("profile_id", profileId);

  const storeIds = (stores ?? []).map((s) => s.id);
  if (storeIds.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, store:seller_stores(*)")
    .in("store_id", storeIds)
    .order("created_at", { ascending: false });

  if (error) { console.error("getSellerProducts:", error.message); return []; }
  return (data ?? []) as Product[];
}

export async function getStoreProducts(storeId: string, includeAll = false): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (!includeAll) query = query.eq("status", "active");

  const { data, error } = await query;
  if (error) { console.error("getStoreProducts:", error.message); return []; }
  return (data ?? []) as Product[];
}

export async function createProduct(payload: ProductInsert): Promise<{ product?: Product; error?: string }> {
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) return { error: error.message };
  return { product: data as Product };
}

export async function updateProduct(productId: string, updates: ProductUpdate): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", productId);
  if (error) return { error: error.message };
  return {};
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };
  return {};
}

export async function uploadProductImage(
  productId: string,
  file: File,
  index = 0
): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split(".").pop();
  const path = `product-images/${productId}/${index}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true });
  if (uploadError) return { error: uploadError.message };
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, store:seller_stores(*)")
    .eq("status", "active")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(limit);
  if (error) { console.error("searchProducts:", error.message); return []; }
  return (data ?? []) as Product[];
}
