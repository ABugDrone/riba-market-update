import { supabase } from "./supabase";
import type { Notification } from "./supabase.types";

// ── Get user notifications ────────────────────────────────────
export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("getNotifications:", error.message); return []; }
  return (data ?? []) as Notification[];
}

// ── Get unread count ──────────────────────────────────────────
export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

// ── Mark notification as read ─────────────────────────────────
export async function markAsRead(notificationId: string): Promise<void> {
  await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
}

// ── Mark all as read ──────────────────────────────────────────
export async function markAllAsRead(userId: string): Promise<void> {
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
}

// ── Create notification ───────────────────────────────────────
export async function createNotification(opts: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  await supabase.from("notifications").insert({
    user_id: opts.userId,
    type: opts.type,
    title: opts.title,
    message: opts.message,
    data: opts.data ?? null,
  });
}
