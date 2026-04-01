import { supabase } from "./supabase";
import type { SellerStore, SellerStoreInsert, SellerStoreUpdate } from "./supabase.types";

export type { SellerStore, SellerStoreInsert, SellerStoreUpdate };

// profile_id here is profiles.id (PK), not auth uid
export async function getSellerStores(profileId: string): Promise<SellerStore[]> {
  const { data, error } = await supabase
    .from("seller_stores")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) { console.error("getSellerStores:", error.message); return []; }
  return (data ?? []) as SellerStore[];
}

export async function getStore(storeId: string): Promise<SellerStore | null> {
  const { data, error } = await supabase
    .from("seller_stores")
    .select("*")
    .eq("id", storeId)
    .single();
  if (error) { console.error("getStore:", error.message); return null; }
  return data as SellerStore;
}

export async function getStoreByName(storeName: string): Promise<SellerStore | null> {
  const { data, error } = await supabase
    .from("seller_stores")
    .select("*")
    .ilike("store_name", storeName)
    .eq("is_active", true)
    .single();
  if (error) { console.error("getStoreByName:", error.message); return null; }
  return data as SellerStore;
}

export async function getPublicStores(opts?: {
  storeType?: string;
  search?: string;
  limit?: number;
}): Promise<SellerStore[]> {
  let query = supabase
    .from("seller_stores")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (opts?.storeType) query = query.eq("store_type", opts.storeType);
  if (opts?.search) query = query.ilike("store_name", `%${opts.search}%`);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) { console.error("getPublicStores:", error.message); return []; }
  return (data ?? []) as SellerStore[];
}

export async function getStoresByIds(ids: string[]): Promise<SellerStore[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("seller_stores")
    .select("*")
    .in("id", ids);
  if (error) { console.error("getStoresByIds:", error.message); return []; }
  return (data ?? []) as SellerStore[];
}

export async function createStore(payload: SellerStoreInsert): Promise<{ store?: SellerStore; error?: string }> {
  const { data, error } = await supabase
    .from("seller_stores")
    .insert(payload)
    .select()
    .single();
  if (error) return { error: error.message };
  return { store: data as SellerStore };
}

export async function updateStore(storeId: string, updates: SellerStoreUpdate): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("seller_stores")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", storeId);
  if (error) return { error: error.message };
  return {};
}

export async function deleteStore(storeId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("seller_stores").delete().eq("id", storeId);
  if (error) return { error: error.message };
  return {};
}

export async function uploadStoreLogo(storeId: string, file: File): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split(".").pop();
  const path = `store-logos/${storeId}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("store-logos")
    .upload(path, file, { upsert: true });
  if (uploadError) return { error: uploadError.message };
  const { data } = supabase.storage.from("store-logos").getPublicUrl(path);
  return { url: data.publicUrl };
}

// Follow/unfollow stored in profiles.followed_sellers array (no separate table yet)
export async function followStore(storeId: string, profileId: string): Promise<{ error?: string }> {
  const { data } = await supabase
    .from("profiles")
    .select("followed_sellers")
    .eq("id", profileId)
    .single();
  const current: string[] = data?.followed_sellers ?? [];
  if (current.includes(storeId)) return {};
  const { error } = await supabase
    .from("profiles")
    .update({ followed_sellers: [...current, storeId] })
    .eq("id", profileId);
  if (error) return { error: error.message };
  return {};
}

export async function unfollowStore(storeId: string, profileId: string): Promise<{ error?: string }> {
  const { data } = await supabase
    .from("profiles")
    .select("followed_sellers")
    .eq("id", profileId)
    .single();
  const current: string[] = data?.followed_sellers ?? [];
  const { error } = await supabase
    .from("profiles")
    .update({ followed_sellers: current.filter((id) => id !== storeId) })
    .eq("id", profileId);
  if (error) return { error: error.message };
  return {};
}

export async function isFollowingStore(storeId: string, profileId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("followed_sellers")
    .eq("id", profileId)
    .single();
  return (data?.followed_sellers ?? []).includes(storeId);
}
