-- Promotions — run once in Supabase SQL Editor (same project as admin + shop).
-- Admin: Settings → Promotions. Shop: reads active rows via anon + RLS or GET /api/shop-promotions.

CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  description text,
  -- Matches menu_items.id (often uuid-as-text); add FK manually if your schema uses a stable type:
  menu_item_id text,
  external_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promotions_active_sort_idx
  ON public.promotions (is_active, sort_order);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Shop + public: only active promotions
DROP POLICY IF EXISTS "Public read active promotions" ON public.promotions;
CREATE POLICY "Public read active promotions"
  ON public.promotions
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Service role (admin API) bypasses RLS for full CRUD.

COMMENT ON TABLE public.promotions IS 'Marketing banners; admin CRUD via service role; shop reads active via anon RLS.';
