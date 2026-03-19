-- Add variations column to menu_items (products API shape stored on product)
-- Run in Supabase SQL Editor if your table was created without this column.

ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]';

-- Example shape stored in variations (for reference):
-- [
--   {
--     "id": "uuid",
--     "type": "radio",
--     "title": "Size",
--     "options": [
--       { "id": "uuid", "label": "Mini (24oz)", "priceModifier": 0 },
--       { "id": "uuid", "label": "Regular (32oz)", "priceModifier": 1 }
--     ]
--   }
-- ]
