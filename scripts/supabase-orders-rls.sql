-- =============================================================================
-- Orders: fix "order not saving to database" (RLS / permissions)
-- Run this in Supabase → SQL Editor → Run
-- =============================================================================
--
-- BEST FIX (no SQL needed): Add to your deployment / .env.local:
--   SUPABASE_SERVICE_ROLE_KEY=<your service_role key from Supabase Settings → API>
-- The Next.js API uses this key and bypasses RLS for /api/create-order.
--
-- Use THIS SCRIPT only if you cannot use the service role key and inserts still
-- fail with "permission denied" or "new row violates row-level security policy".
-- =============================================================================

-- Ensure RLS is on (Supabase default for many projects)
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow inserts from the anon key (used by API route when service role is not set)
DROP POLICY IF EXISTS "orders_insert_anon" ON public.orders;
CREATE POLICY "orders_insert_anon"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_insert_anon" ON public.order_items;
CREATE POLICY "order_items_insert_anon"
  ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Dashboard / admin clients (authenticated) can read and update
DROP POLICY IF EXISTS "orders_select_auth" ON public.orders;
CREATE POLICY "orders_select_auth"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "orders_update_auth" ON public.orders;
CREATE POLICY "orders_update_auth"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_select_auth" ON public.order_items;
CREATE POLICY "order_items_select_auth"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: anon can read own orders only if you add client-side filters later
-- (not required for server-side API inserts)
