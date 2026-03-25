-- =============================================================================
-- menu_items — loyalty columns ONLY (products / rewards catalog)
-- =============================================================================
-- Safe to run many times: uses IF NOT EXISTS. Does NOT drop or rename anything.
-- Does NOT touch customer balances — those live in customer_loyalty_points + RPC.
--
-- If you already ran these ALTERs in the SQL Editor, you do NOT need to run this
-- again. Running again is harmless (no-op).
--
-- Related (separate file — auth users + per-user points + transactions):
--   scripts/supabase-auth-loyalty-schema.sql
-- =============================================================================

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS loyalty_points_earn INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS loyalty_points_cost INTEGER DEFAULT 0 NOT NULL;
