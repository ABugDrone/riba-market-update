import { supabase } from "./supabase";
import type { Order, OrderInsert, OrderItem, OrderItemInsert, PaymentMethod } from "./supabase.types";

function makeOrderNumber(): string {
  const yr = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RBM-${yr}-${rand}`;
}

// buyer_id and profile_id here are profiles.id (PK), not auth uid
export async function createOrder(opts: {
  profileId: string;        // profiles.id
  deliveryAddressId?: string;
  items: Array<{
    productId?: string;
    storeId?: string;
    unitPrice: number;
    quantity: number;
  }>;
  subtotal: number;
  deliveryFee?: number;
  discount?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}): Promise<{ order?: Order; error?: string }> {
  const orderNumber = makeOrderNumber();
  const deliveryFee = opts.deliveryFee ?? 2500;
  const discount = opts.discount ?? 0;
  const total = opts.subtotal + deliveryFee - discount;

  const orderPayload: OrderInsert = {
    order_number: orderNumber,
    buyer_id: opts.profileId,
    delivery_address_id: opts.deliveryAddressId ?? null,
    subtotal: opts.subtotal,
    delivery_fee: deliveryFee,
    discount,
    total,
    payment_method: opts.paymentMethod,
    notes: opts.notes ?? null,
  };

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select()
    .single();

  if (orderError) return { error: orderError.message };
  const order = orderData as Order;

  const itemPayloads: OrderItemInsert[] = opts.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId ?? null,
    store_id: item.storeId ?? null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.unitPrice * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemPayloads);
  if (itemsError) console.error("createOrder items:", itemsError.message);

  return { order };
}

// buyer_id = profiles.id
export async function getBuyerOrders(profileId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), delivery_address:addresses(*)")
    .eq("buyer_id", profileId)
    .order("created_at", { ascending: false });
  if (error) { console.error("getBuyerOrders:", error.message); return []; }
  return (data ?? []) as Order[];
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), delivery_address:addresses(*)")
    .eq("id", orderId)
    .single();
  if (error) { console.error("getOrder:", error.message); return null; }
  return data as Order;
}

// Orders for a seller — joins through order_items → seller_stores → profiles
export async function getSellerOrders(profileId: string): Promise<Order[]> {
  // Get seller's store ids first
  const { data: stores } = await supabase
    .from("seller_stores")
    .select("id")
    .eq("profile_id", profileId);

  const storeIds = (stores ?? []).map((s) => s.id);
  if (storeIds.length === 0) return [];

  const { data: orderItemRows } = await supabase
    .from("order_items")
    .select("order_id")
    .in("store_id", storeIds);

  const orderIds = [...new Set((orderItemRows ?? []).map((r) => r.order_id))];
  if (orderIds.length === 0) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), delivery_address:addresses(*)")
    .in("id", orderIds)
    .order("created_at", { ascending: false });

  if (error) { console.error("getSellerOrders:", error.message); return []; }
  return (data ?? []) as Order[];
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["order_status"]
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("orders")
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { error: error.message };
  return {};
}
