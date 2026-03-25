-- =============================================================================
-- Druids Nutrition — Auth users, profiles, per-user loyalty (Supabase)
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Requires: Supabase Auth enabled (Email provider).
--
-- IMPORTANT — does NOT change menu_items or product data:
--   This file only creates user_profiles, customer_loyalty_points,
--   user_loyalty_transactions, and the apply_loyalty_delta RPC + RLS.
--   Your existing loyalty_points_earn / loyalty_points_cost on menu_items
--   (optional catalog columns) are untouched. If you add those columns, use:
--   scripts/menu-items-loyalty-columns.sql  (ADD COLUMN IF NOT EXISTS — safe).
-- Re-running this script: idempotent (IF NOT EXISTS tables, OR REPLACE functions,
--   DROP/CREATE policies by name). It will not wipe customer_loyalty_points rows.
--
-- After running:
-- 1. Authentication → URL configuration: add Site URL + Redirect URLs, e.g.
--    http://localhost:3000/auth/callback
--    https://YOUR_DOMAIN/auth/callback
-- 2. Email templates: use {{ .ConfirmationURL }} for confirm signup / reset password
--    (link flow; redirect URLs must include /auth/callback as in your Next.js app).
-- =============================================================================

-- Profiles (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One loyalty balance row per authenticated user
CREATE TABLE IF NOT EXISTS public.customer_loyalty_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  total_points_redeemed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_points_non_negative CHECK (total_points >= 0),
  CONSTRAINT loyalty_earned_non_negative CHECK (total_points_earned >= 0),
  CONSTRAINT loyalty_redeemed_non_negative CHECK (total_points_redeemed >= 0)
);

CREATE TABLE IF NOT EXISTS public.user_loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'bonus', 'adjustment')),
  description TEXT,
  order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_loyalty_tx_user ON public.user_loyalty_transactions (user_id, created_at DESC);

-- Auto-create profile + empty loyalty row for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.customer_loyalty_points (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Secure loyalty updates: only authenticated caller; balance cannot go negative
CREATE OR REPLACE FUNCTION public.apply_loyalty_delta(
  p_delta INTEGER,
  p_description TEXT DEFAULT '',
  p_order_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  cur INTEGER;
  new_bal INTEGER;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_delta = 0 THEN
    SELECT total_points INTO cur FROM public.customer_loyalty_points WHERE user_id = uid;
    RETURN jsonb_build_object('ok', true, 'balance', COALESCE(cur, 0));
  END IF;

  INSERT INTO public.customer_loyalty_points (user_id, total_points, total_points_earned, total_points_redeemed)
  VALUES (uid, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT total_points INTO cur FROM public.customer_loyalty_points WHERE user_id = uid FOR UPDATE;

  IF cur IS NULL THEN
    cur := 0;
  END IF;

  IF p_delta < 0 AND cur + p_delta < 0 THEN
    RAISE EXCEPTION 'Insufficient loyalty points';
  END IF;

  UPDATE public.customer_loyalty_points
  SET
    total_points = total_points + p_delta,
    total_points_earned = total_points_earned + CASE WHEN p_delta > 0 THEN p_delta ELSE 0 END,
    total_points_redeemed = total_points_redeemed + CASE WHEN p_delta < 0 THEN -p_delta ELSE 0 END,
    updated_at = now()
  WHERE user_id = uid
  RETURNING total_points INTO new_bal;

  INSERT INTO public.user_loyalty_transactions (user_id, points, transaction_type, description, order_id)
  VALUES (
    uid,
    p_delta,
    CASE WHEN p_delta > 0 THEN 'earned' ELSE 'redeemed' END,
    NULLIF(trim(p_description), ''),
    NULLIF(trim(p_order_id), '')
  );

  RETURN jsonb_build_object('ok', true, 'balance', new_bal);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_loyalty_delta(INTEGER, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_loyalty_delta(INTEGER, TEXT, TEXT) TO authenticated;

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "loyalty_select_own" ON public.customer_loyalty_points;
CREATE POLICY "loyalty_select_own"
  ON public.customer_loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "loyalty_tx_select_own" ON public.user_loyalty_transactions;
CREATE POLICY "loyalty_tx_select_own"
  ON public.user_loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);
