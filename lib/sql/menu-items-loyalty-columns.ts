/**
 * Idempotent: safe if columns already exist. Does not drop/rename tables or data.
 * Keep in sync with scripts/menu-items-loyalty-columns.sql
 */
export const MENU_ITEMS_LOYALTY_COLUMNS_SQL = `ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS loyalty_points_earn INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS loyalty_points_cost INTEGER DEFAULT 0 NOT NULL;`
