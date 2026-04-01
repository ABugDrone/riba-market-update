import { supabase } from "./supabase";
import type { Address, AddressInsert } from "./supabase.types";

// profile_id = profiles.id (PK)

export async function getAddresses(profileId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("profile_id", profileId)
    .order("is_default", { ascending: false });
  if (error) { console.error("getAddresses:", error.message); return []; }
  return (data ?? []) as Address[];
}

export async function createAddress(payload: AddressInsert): Promise<{ address?: Address; error?: string }> {
  const { data, error } = await supabase
    .from("addresses")
    .insert(payload)
    .select()
    .single();
  if (error) return { error: error.message };
  return { address: data as Address };
}

export async function updateAddress(
  addressId: string,
  updates: Partial<Omit<Address, "id" | "profile_id" | "created_at">>
): Promise<{ error?: string }> {
  const { error } = await supabase.from("addresses").update(updates).eq("id", addressId);
  if (error) return { error: error.message };
  return {};
}

export async function deleteAddress(addressId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("addresses").delete().eq("id", addressId);
  if (error) return { error: error.message };
  return {};
}

export async function setDefaultAddress(profileId: string, addressId: string): Promise<{ error?: string }> {
  // Clear existing default first
  await supabase.from("addresses").update({ is_default: false }).eq("profile_id", profileId);
  const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", addressId);
  if (error) return { error: error.message };
  return {};
}
