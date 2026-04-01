// ============================================================
// Supabase Database Types – matches existing Riba Market schema
// ============================================================

export type UserType = "buyer" | "seller" | "both";
export type StoreType = "restaurant" | "product" | "service";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type ProductStatus = "active" | "sold" | "pending_removal" | "out_of_stock";
export type PaymentMethod = "online" | "cash_on_delivery";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type TransactionStatus = "pending" | "successful" | "failed";

// ─── Profile ──────────────────────────────────────────────────
// NOTE: profiles.id is its own UUID, profiles.user_id = auth.users.id
export interface Profile {
  id: string;           // profiles PK (not auth uid)
  user_id: string;      // FK → auth.users.id
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  user_type: UserType;
  created_at: string;
  updated_at: string;
  // Extended fields (added via ALTER TABLE migration)
  bio?: string | null;
  business_name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  is_pro?: boolean;
  followed_sellers?: string[];
  purchased_product_ids?: string[];
}

export interface ProfileUpdate {
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  user_type?: UserType;
  bio?: string | null;
  business_name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  is_pro?: boolean;
  followed_sellers?: string[];
  purchased_product_ids?: string[];
  updated_at?: string;
}

// ─── Seller Store ─────────────────────────────────────────────
export interface SellerStore {
  id: string;
  profile_id: string;           // FK → profiles.id (not user_id)
  store_name: string;
  store_type: StoreType;
  description: string | null;
  logo_url: string | null;
  verification_status: VerificationStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Extended fields
  welcome_message?: string | null;
  banner_color?: string | null;
  google_maps_link?: string | null;
  is_public?: boolean;
  total_sold?: number;
  follower_count?: number;
  rating?: number;
  review_count?: number;
}

export interface SellerStoreInsert {
  profile_id: string;
  store_name: string;
  store_type: StoreType;
  description?: string | null;
  logo_url?: string | null;
  welcome_message?: string | null;
  banner_color?: string | null;
  google_maps_link?: string | null;
  is_public?: boolean;
  is_active?: boolean;
}

export interface SellerStoreUpdate {
  store_name?: string;
  store_type?: StoreType;
  description?: string | null;
  logo_url?: string | null;
  welcome_message?: string | null;
  banner_color?: string | null;
  google_maps_link?: string | null;
  is_public?: boolean;
  is_active?: boolean;
  updated_at?: string;
}

// ─── Product ──────────────────────────────────────────────────
export interface VideoEmbed {
  url: string;
  embedUrl: string;
  thumbnail?: string;
  platform?: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number | null;
  original_price?: number | null;
  category: string;
  images: string[];
  video_url: string | null;
  inventory_count: number;
  specifications: Record<string, unknown>;
  status: ProductStatus;
  sold_at: string | null;
  removal_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  store?: SellerStore;
  // Virtual (computed client-side or via extended columns)
  rating?: number;
  review_count?: number;
  sales_count?: number;
  video_embed?: VideoEmbed | null;
}

export interface ProductInsert {
  store_id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  category: string;
  images?: string[];
  video_url?: string | null;
  inventory_count?: number;
  specifications?: Record<string, unknown>;
  status?: ProductStatus;
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  price?: number | null;
  category?: string;
  images?: string[];
  video_url?: string | null;
  inventory_count?: number;
  specifications?: Record<string, unknown>;
  status?: ProductStatus;
  updated_at?: string;
}

// ─── Address ──────────────────────────────────────────────────
export interface Address {
  id: string;
  profile_id: string;
  label: string | null;
  full_address: string;
  city: string;
  state: string;
  postal_code: string | null;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}

export interface AddressInsert {
  profile_id: string;
  label?: string | null;
  full_address: string;
  city: string;
  state: string;
  postal_code?: string | null;
  phone?: string | null;
  is_default?: boolean;
}

// ─── Cart (existing table is "carts") ────────────────────────
export interface CartItem {
  id: string;
  buyer_id: string;       // FK → profiles.id
  product_id: string;
  quantity: number;
  added_at: string;
  product?: Product;
}

// ─── Order ────────────────────────────────────────────────────
export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;             // FK → profiles.id
  delivery_address_id: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  delivery_address?: Address;
}

export interface OrderInsert {
  order_number: string;
  buyer_id: string;
  delivery_address_id?: string | null;
  subtotal: number;
  delivery_fee?: number;
  discount?: number;
  total: number;
  payment_method: PaymentMethod;
  notes?: string | null;
}

// ─── Order Item ───────────────────────────────────────────────
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  store_id: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  product?: Product;
}

export interface OrderItemInsert {
  order_id: string;
  product_id?: string | null;
  store_id?: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// ─── Transaction ──────────────────────────────────────────────
export interface Transaction {
  id: string;
  order_id: string;
  amount: number;
  payment_provider: string;
  payment_reference: string;
  status: TransactionStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Review ───────────────────────────────────────────────────
export interface SellerReply {
  seller_id: string;
  seller_name: string;
  message: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string | null;
  store_id: string | null;
  buyer_id: string;             // FK → profiles.id
  rating: number;
  comment: string | null;
  created_at: string;
  // Extended fields (added via ALTER TABLE)
  author_name?: string | null;
  author_avatar?: string | null;
  location?: string | null;
  helpful?: number;
  seller_reply?: SellerReply | null;
  is_anonymous?: boolean;
  updated_at?: string;
}

export interface ReviewInsert {
  product_id?: string | null;
  store_id?: string | null;
  buyer_id: string;
  rating: number;
  comment?: string | null;
  author_name?: string | null;
  author_avatar?: string | null;
  location?: string | null;
  is_anonymous?: boolean;
}

// ─── Wishlist (new table — added via extension migration) ─────
export interface WishlistItem {
  id: string;
  profile_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// ─── Notification (new table) ─────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}
