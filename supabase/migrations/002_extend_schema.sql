-- ============================================================
-- Riba Market – Extension Migration
-- Safe to run on top of the existing "Riba Market Initial Schema"
-- Only adds missing columns, tables, and policies.
-- Does NOT touch existing enums, tables, triggers, or policies.
-- ============================================================

-- ─── 1. Extend profiles with missing columns ─────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS followed_sellers UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS purchased_product_ids UUID[] NOT NULL DEFAULT '{}';

-- ─── 2. Extend seller_stores with missing columns ────────────
ALTER TABLE seller_stores
  ADD COLUMN IF NOT EXISTS welcome_message TEXT,
  ADD COLUMN IF NOT EXISTS banner_color TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_link TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS total_sold INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;

-- ─── 3. Extend products with missing columns ─────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS original_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sales_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_embed JSONB;

-- ─── 4. Extend reviews with missing columns ──────────────────
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS author_avatar TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS helpful INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_reply JSONB,
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ─── 5. Extend orders with buyer_info JSONB ──────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS buyer_info JSONB;

-- ─── 6. New tables ───────────────────────────────────────────

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, product_id)
);

-- Seller followers
CREATE TABLE IF NOT EXISTS seller_followers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES seller_stores(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, follower_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  data       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_id   UUID REFERENCES orders(id) ON DELETE SET NULL,
  revenue    NUMERIC(12,2),
  cost       NUMERIC(12,2),
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 7. Enable RLS on new tables ─────────────────────────────
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ─── 8. RLS policies for new tables ──────────────────────────

-- Wishlists
CREATE POLICY "Users can view their own wishlist."
  ON wishlists FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = profile_id));

CREATE POLICY "Users can add to their own wishlist."
  ON wishlists FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = profile_id));

CREATE POLICY "Users can remove from their own wishlist."
  ON wishlists FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = profile_id));

-- Seller followers
CREATE POLICY "Follower counts are public."
  ON seller_followers FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow stores."
  ON seller_followers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = follower_id));

CREATE POLICY "Users can unfollow stores."
  ON seller_followers FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = follower_id));

-- Notifications
CREATE POLICY "Users can view their own notifications."
  ON notifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = user_id));

CREATE POLICY "Users can mark their own notifications read."
  ON notifications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = user_id));

-- Analytics events
CREATE POLICY "Sellers can view their own analytics."
  ON analytics_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = seller_id));

CREATE POLICY "Sellers can insert analytics events."
  ON analytics_events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = seller_id));

-- ─── 9. Trigger: update store follower_count ─────────────────
CREATE OR REPLACE FUNCTION update_store_follower_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE seller_stores SET follower_count = follower_count + 1 WHERE id = NEW.store_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE seller_stores SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.store_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_seller_followers_count ON seller_followers;
CREATE TRIGGER trg_seller_followers_count
  AFTER INSERT OR DELETE ON seller_followers
  FOR EACH ROW EXECUTE FUNCTION update_store_follower_count();

-- ─── 10. Trigger: update product/store rating after review ───
CREATE OR REPLACE FUNCTION update_ratings_after_review()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE products
    SET
      rating       = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE product_id = NEW.product_id),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
  END IF;
  IF NEW.store_id IS NOT NULL THEN
    UPDATE seller_stores
    SET
      rating       = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE store_id = NEW.store_id),
      review_count = (SELECT COUNT(*) FROM reviews WHERE store_id = NEW.store_id)
    WHERE id = NEW.store_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_review_rating ON reviews;
CREATE TRIGGER trg_review_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_ratings_after_review();

-- ─── 11. Trigger: increment sales_count on order_items insert ─
CREATE OR REPLACE FUNCTION increment_product_sales()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE products SET sales_count = sales_count + NEW.quantity WHERE id = NEW.product_id;
    UPDATE seller_stores
    SET total_sold = total_sold + NEW.quantity
    WHERE id = NEW.store_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_item_sales ON order_items;
CREATE TRIGGER trg_order_item_sales
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION increment_product_sales();

-- ─── 12. Storage buckets ─────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('store-logos', 'store-logos', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO NOTHING;
