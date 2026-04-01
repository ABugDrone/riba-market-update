import { supabase } from "./supabase";

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalSales: number;
  totalCosts: number;
  totalProfit: number;
  activeProducts: number;
  pendingOrders: number;
  totalCustomers: number;
}

export interface MonthlyRevenue {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

// profileId = profiles.id (PK)
export async function getSellerAnalyticsSummary(profileId: string): Promise<AnalyticsSummary> {
  const { data: stores } = await supabase
    .from("seller_stores")
    .select("id")
    .eq("profile_id", profileId);

  const storeIds = (stores ?? []).map((s) => s.id);
  if (storeIds.length === 0) {
    return { totalRevenue: 0, totalOrders: 0, totalSales: 0, totalCosts: 0, totalProfit: 0, activeProducts: 0, pendingOrders: 0, totalCustomers: 0 };
  }

  const { count: activeProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .in("store_id", storeIds)
    .eq("status", "active");

  const { data: orderItemsData } = await supabase
    .from("order_items")
    .select("order_id, unit_price, quantity, store_id")
    .in("store_id", storeIds);

  const orderItems = orderItemsData ?? [];
  const uniqueOrderIds = [...new Set(orderItems.map((oi) => oi.order_id))];
  const totalSales = orderItems.reduce((s, oi) => s + oi.quantity, 0);
  const totalRevenue = orderItems.reduce((s, oi) => s + oi.unit_price * oi.quantity, 0);
  const totalCosts = Math.round(totalRevenue * 0.3);
  const totalProfit = totalRevenue - totalCosts;

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("id", uniqueOrderIds.length > 0 ? uniqueOrderIds : ["none"])
    .eq("order_status", "pending");

  const { data: ordersData } = await supabase
    .from("orders")
    .select("buyer_id")
    .in("id", uniqueOrderIds.length > 0 ? uniqueOrderIds : ["none"]);

  const uniqueCustomers = new Set((ordersData ?? []).map((o) => o.buyer_id)).size;

  return {
    totalRevenue,
    totalOrders: uniqueOrderIds.length,
    totalSales,
    totalCosts,
    totalProfit,
    activeProducts: activeProducts ?? 0,
    pendingOrders: pendingOrders ?? 0,
    totalCustomers: uniqueCustomers,
  };
}

export async function getMonthlyRevenue(profileId: string, months = 7): Promise<MonthlyRevenue[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const { data: stores } = await supabase
    .from("seller_stores")
    .select("id")
    .eq("profile_id", profileId);

  const storeIds = (stores ?? []).map((s) => s.id);
  if (storeIds.length === 0) return [];

  const { data } = await supabase
    .from("order_items")
    .select("unit_price, quantity, created_at, store_id")
    .in("store_id", storeIds)
    .gte("created_at", since.toISOString());

  if (!data) return [];

  const byMonth: Record<string, { revenue: number; orders: number }> = {};
  for (const item of data) {
    const month = new Date(item.created_at).toLocaleString("default", { month: "short" });
    if (!byMonth[month]) byMonth[month] = { revenue: 0, orders: 0 };
    byMonth[month].revenue += item.unit_price * item.quantity;
    byMonth[month].orders += 1;
  }

  return Object.entries(byMonth).map(([date, v]) => ({
    date,
    revenue: Math.round(v.revenue),
    orders: v.orders,
    profit: Math.round(v.revenue * 0.7),
  }));
}
