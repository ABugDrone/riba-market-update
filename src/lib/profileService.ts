import { supabase } from "./supabase";
import type { Profile, ProfileUpdate } from "./supabase.types";

// Get profile by auth user id (user_id column, not id)
export async function getProfile(authUserId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", authUserId)
    .single();
  if (error) { console.error("getProfile:", error.message); return null; }
  return data as Profile;
}

// Get profile by profiles.id (PK)
export async function getProfileById(profileId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();
  if (error) { console.error("getProfileById:", error.message); return null; }
  return data as Profile;
}

export async function updateProfile(
  authUserId: string,
  updates: ProfileUpdate
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", authUserId);
  if (error) return { error: error.message };
  return {};
}

export async function uploadAvatar(
  authUserId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split(".").pop();
  const path = `avatars/${authUserId}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (uploadError) return { error: uploadError.message };
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl };
}
