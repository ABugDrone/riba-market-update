-- ============================================================
-- Fix infinite recursion in RLS policies
-- The issue: policies on orders/order_items join back to profiles
-- which triggers other policies causing infinite loops.
-- Solution: use auth.uid() directly with a subquery to get profile id,
-- or use security definer functions to break the cycle.
-- ============================================================

-- ─── Helper function: get current user's profile id ──────────
-- SECURITY DEFINER bypasses RLS, breaking the recursion cycle.
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ─── Drop and recreate all recursive policies ────────────────

-- ORDERS
DROP POLICY IF EXISTS "Buyers can view their own orders." ON orders;
DROP POLICY IF EXISTS "Sellers can view orders containing their products." ON orders;
DROP POLICY IF EXISTS "Buyers can create orders." ON orders;
DROP POLICY IF EXISTS "Sellers can update orders containing their products." ON orders;

CREATE POLICY "Buyers can view their own orders."
  ON orders FOR SELECT
  USING (buyer_id = get_my_profile_id());

CREATE POLICY "Buyers can create orders."
  ON orders FOR INSERT
  WITH CHECK (buyer_id = get_my_profile_id());

CREATE POLICY "Buyers can update their own orders."
  ON orders FOR UPDATE
  USING (buyer_id = get_my_profile_id());

CREATE POLICY "Sellers can view orders containing their products."
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN seller_stores ss ON oi.store_id = ss.id
      WHERE oi.order_id = orders.id
        AND ss.profile_id = get_my_profile_id()
    )
  );

-- ORDER ITEMS
DROP POLICY IF EXISTS "Buyers can view their own order items." ON order_items;
DROP POLICY IF EXISTS "Sellers can view their own order items." ON order_items;
DROP POLICY IF EXISTS "Buyers can insert order items." ON order_items;

CREATE POLICY "Buyers can view their own order items."
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.buyer_id = get_my_profile_id()
    )
  );

CREATE POLICY "Sellers can view their own order items."
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seller_stores ss
      WHERE ss.id = store_id
        AND ss.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY "Buyers can insert order items."
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.buyer_id = get_my_profile_id()
    )
  );

-- CARTS (same pattern)
DROP POLICY IF EXISTS "Buyers can view their own cart." ON carts;
DROP POLICY IF EXISTS "Buyers can insert into their own cart." ON carts;
DROP POLICY IF EXISTS "Buyers can update their own cart." ON carts;
DROP POLICY IF EXISTS "Buyers can delete from their own cart." ON carts;

CREATE POLICY "Buyers can view their own cart."
  ON carts FOR SELECT
  USING (buyer_id = get_my_profile_id());

CREATE POLICY "Buyers can insert into their own cart."
  ON carts FOR INSERT
  WITH CHECK (buyer_id = get_my_profile_id());

CREATE POLICY "Buyers can update their own cart."
  ON carts FOR UPDATE
  USING (buyer_id = get_my_profile_id());

CREATE POLICY "Buyers can delete from their own cart."
  ON carts FOR DELETE
  USING (buyer_id = get_my_profile_id());

-- ADDRESSES
DROP POLICY IF EXISTS "Users can view their own addresses." ON addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses." ON addresses;
DROP POLICY IF EXISTS "Users can update their own addresses." ON addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses." ON addresses;

CREATE POLICY "Users can view their own addresses."
  ON addresses FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY "Users can insert their own addresses."
  ON addresses FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY "Users can update their own addresses."
  ON addresses FOR UPDATE
  USING (profile_id = get_my_profile_id());

CREATE POLICY "Users can delete their own addresses."
  ON addresses FOR DELETE
  USING (profile_id = get_my_profile_id());

-- SELLER STORES
DROP POLICY IF EXISTS "Sellers can create stores." ON seller_stores;
DROP POLICY IF EXISTS "Sellers can update their own stores." ON seller_stores;
DROP POLICY IF EXISTS "Sellers can delete their own stores." ON seller_stores;

CREATE POLICY "Sellers can create stores."
  ON seller_stores FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY "Sellers can update their own stores."
  ON seller_stores FOR UPDATE
  USING (profile_id = get_my_profile_id());

CREATE POLICY "Sellers can delete their own stores."
  ON seller_stores FOR DELETE
  USING (profile_id = get_my_profile_id());

-- PRODUCTS
DROP POLICY IF EXISTS "Sellers can insert products to their stores." ON products;
DROP POLICY IF EXISTS "Sellers can update their own products." ON products;
DROP POLICY IF EXISTS "Sellers can delete their own products." ON products;

CREATE POLICY "Sellers can insert products to their stores."
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seller_stores ss
      WHERE ss.id = store_id
        AND ss.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY "Sellers can update their own products."
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM seller_stores ss
      WHERE ss.id = store_id
        AND ss.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY "Sellers can delete their own products."
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM seller_stores ss
      WHERE ss.id = store_id
        AND ss.profile_id = get_my_profile_id()
    )
  );

-- REVIEWS
DROP POLICY IF EXISTS "Buyers can create reviews." ON reviews;
DROP POLICY IF EXISTS "Buyers can update their own reviews." ON reviews;
DROP POLICY IF EXISTS "Buyers can delete their own reviews." ON reviews;

CREATE POLICY "Buyers can create reviews."
  ON reviews FOR INSERT
  WITH CHECK (buyer_id = get_my_profile_id());

CREATE POLICY "Buyers can update their own reviews."
  ON reviews FOR UPDATE
  USING (buyer_id = get_my_profile_id());

CREATE POLICY "Buyers can delete their own reviews."
  ON reviews FOR DELETE
  USING (buyer_id = get_my_profile_id());

-- TRANSACTIONS
DROP POLICY IF EXISTS "Buyers can view their own transactions." ON transactions;

CREATE POLICY "Buyers can view their own transactions."
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.buyer_id = get_my_profile_id()
    )
  );

-- NEW TABLES (from extension migration)
DROP POLICY IF EXISTS "Users can view their own wishlist." ON wishlists;
DROP POLICY IF EXISTS "Users can add to their own wishlist." ON wishlists;
DROP POLICY IF EXISTS "Users can remove from their own wishlist." ON wishlists;

CREATE POLICY "Users can view their own wishlist."
  ON wishlists FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY "Users can add to their own wishlist."
  ON wishlists FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY "Users can remove from their own wishlist."
  ON wishlists FOR DELETE
  USING (profile_id = get_my_profile_id());

DROP POLICY IF EXISTS "Authenticated users can follow stores." ON seller_followers;
DROP POLICY IF EXISTS "Users can unfollow stores." ON seller_followers;

CREATE POLICY "Authenticated users can follow stores."
  ON seller_followers FOR INSERT
  WITH CHECK (follower_id = get_my_profile_id());

CREATE POLICY "Users can unfollow stores."
  ON seller_followers FOR DELETE
  USING (follower_id = get_my_profile_id());

DROP POLICY IF EXISTS "Users can view their own notifications." ON notifications;
DROP POLICY IF EXISTS "Users can mark their own notifications read." ON notifications;

CREATE POLICY "Users can view their own notifications."
  ON notifications FOR SELECT
  USING (user_id = get_my_profile_id());

CREATE POLICY "Users can mark their own notifications read."
  ON notifications FOR UPDATE
  USING (user_id = get_my_profile_id());

DROP POLICY IF EXISTS "Sellers can view their own analytics." ON analytics_events;
DROP POLICY IF EXISTS "Sellers can insert analytics events." ON analytics_events;

CREATE POLICY "Sellers can view their own analytics."
  ON analytics_events FOR SELECT
  USING (seller_id = get_my_profile_id());

CREATE POLICY "Sellers can insert analytics events."
  ON analytics_events FOR INSERT
  WITH CHECK (seller_id = get_my_profile_id());
