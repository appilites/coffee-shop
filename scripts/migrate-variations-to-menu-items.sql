-- ============================================================
-- MIGRATION: Move all variations from customization_options +
-- customization_choices into menu_items.variations (JSONB)
-- ============================================================
-- Run this ONCE in Supabase SQL Editor.
-- It is fully safe to re-run (uses UPDATE ... WHERE, not INSERT).
-- ============================================================


-- STEP 1: Ensure the variations column exists on menu_items
-- ============================================================
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]';


-- STEP 2: Migrate all data from customization_options + choices
--         into menu_items.variations
-- ============================================================
-- Converts:
--   customization_options.option_type "single"   → "radio"
--   customization_options.option_type "multiple" → "checkbox"
--
-- Output shape per item:
-- [
--   {
--     "id":      "<customization_options.id>",
--     "type":    "radio" | "checkbox",
--     "title":   "<customization_options.option_name>",
--     "options": [
--       { "id": "<choice.id>", "label": "<choice.choice_name>", "priceModifier": <choice.price_modifier> },
--       ...
--     ]
--   },
--   ...
-- ]
-- ============================================================

UPDATE menu_items mi
SET
  variations = merged.new_variations,
  updated_at = NOW()
FROM (
  -- Build the full variations JSON array per menu item from old tables
  SELECT
    co.menu_item_id,
    jsonb_agg(
      jsonb_build_object(
        'id',      co.id::text,
        'type',    CASE co.option_type WHEN 'multiple' THEN 'checkbox' ELSE 'radio' END,
        'title',   co.option_name,
        'options', COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id',            cc.id::text,
                'label',         cc.choice_name,
                'priceModifier', COALESCE(cc.price_modifier, 0)
              )
              ORDER BY cc.is_default DESC, cc.choice_name
            )
            FROM customization_choices cc
            WHERE cc.option_id = co.id
          ),
          '[]'::jsonb
        )
      )
      ORDER BY co.option_name
    ) AS new_variations
  FROM customization_options co
  GROUP BY co.menu_item_id
) merged
WHERE mi.id = merged.menu_item_id
  -- Only overwrite if the current variations column is empty/null
  -- Remove the condition below if you want to FORCE overwrite every product:
  AND (mi.variations IS NULL OR mi.variations = '[]'::jsonb OR jsonb_array_length(mi.variations) = 0);


-- STEP 3: Preview the migrated data (run separately to verify)
-- ============================================================
-- SELECT
--   mi.id,
--   mi.name,
--   jsonb_array_length(mi.variations) AS variation_count,
--   mi.variations
-- FROM menu_items mi
-- WHERE jsonb_array_length(mi.variations) > 0
-- ORDER BY mi.name;


-- STEP 4: Inject DEFAULT variations for "Build Your Own" products
--         that still have empty variations after the migration
-- ============================================================

-- 4a. Build Your Own Power Bowl
UPDATE menu_items
SET
  variations = '[
    {
      "id": "pb-base-opt",
      "type": "radio",
      "title": "Pick your Base",
      "options": [
        { "id": "pb-base-acai",    "label": "Açaí",    "priceModifier": 0 },
        { "id": "pb-base-pitaya",  "label": "Pitaya",  "priceModifier": 0 },
        { "id": "pb-base-oatmeal", "label": "Oatmeal", "priceModifier": 0 }
      ]
    },
    {
      "id": "pb-granola-opt",
      "type": "radio",
      "title": "Add Granola or Not",
      "options": [
        { "id": "pb-granola-yes",      "label": "Granola",        "priceModifier": 0   },
        { "id": "pb-granola-no",       "label": "No Granola",     "priceModifier": 0   },
        { "id": "pb-granola-blueberry","label": "Blueberry Flax", "priceModifier": 0.5 }
      ]
    },
    {
      "id": "pb-fruits-opt",
      "type": "checkbox",
      "title": "Pick 3 Fruits",
      "options": [
        { "id": "pb-fruit-banana",     "label": "Banana",     "priceModifier": 0 },
        { "id": "pb-fruit-blueberry",  "label": "Blueberry",  "priceModifier": 0 },
        { "id": "pb-fruit-kiwi",       "label": "Kiwi",       "priceModifier": 0 },
        { "id": "pb-fruit-pineapple",  "label": "Pineapple",  "priceModifier": 0 },
        { "id": "pb-fruit-strawberry", "label": "Strawberry", "priceModifier": 0 }
      ]
    },
    {
      "id": "pb-boosta-opt",
      "type": "checkbox",
      "title": "Agaves Boosta",
      "options": [
        { "id": "pb-boosta-almond",   "label": "Almond",        "priceModifier": 0.5 },
        { "id": "pb-boosta-bee",      "label": "Bee Pollen",    "priceModifier": 0.5 },
        { "id": "pb-boosta-cacao",    "label": "Cacao Nibs",    "priceModifier": 0.5 },
        { "id": "pb-boosta-caramel",  "label": "Caramel",       "priceModifier": 0.5 },
        { "id": "pb-boosta-coconut",  "label": "Coconut Flakes","priceModifier": 0.5 },
        { "id": "pb-boosta-chia",     "label": "Chia Seeds",    "priceModifier": 0.5 },
        { "id": "pb-boosta-hemp",     "label": "Hemp Seeds",    "priceModifier": 0.5 },
        { "id": "pb-boosta-honey",    "label": "Honey",         "priceModifier": 0.5 },
        { "id": "pb-boosta-nutella",  "label": "Nutella",       "priceModifier": 1.0 },
        { "id": "pb-boosta-pb",       "label": "Peanut Butter", "priceModifier": 0.5 }
      ]
    }
  ]'::jsonb,
  updated_at = NOW()
WHERE
  (LOWER(name) LIKE '%power bowl%' OR category_id = 'cat-power-bowl')
  AND (variations IS NULL OR variations = '[]'::jsonb OR jsonb_array_length(variations) = 0);


-- 4b. Build Your Own Protein Waffle
UPDATE menu_items
SET
  variations = '[
    {
      "id": "waffle-topping-opt",
      "type": "checkbox",
      "title": "Toppings",
      "options": [
        { "id": "waffle-top-nutella",  "label": "Nutella",           "priceModifier": 0.5 },
        { "id": "waffle-top-pb",       "label": "Peanut Butter",     "priceModifier": 0.5 },
        { "id": "waffle-top-syrup",    "label": "Sugar-Free Syrup",  "priceModifier": 0   },
        { "id": "waffle-top-berries",  "label": "Fresh Berries",     "priceModifier": 0.5 }
      ]
    }
  ]'::jsonb,
  updated_at = NOW()
WHERE
  (LOWER(name) LIKE '%protein waffle%' OR LOWER(name) LIKE '%waffle%')
  AND (variations IS NULL OR variations = '[]'::jsonb OR jsonb_array_length(variations) = 0);


-- STEP 5: Verify migration before dropping old tables
-- ============================================================
-- Run this SELECT to confirm all products are correct, then proceed to STEP 6.

SELECT
  mi.id,
  mi.name,
  jsonb_array_length(mi.variations) AS variation_groups,
  (
    SELECT SUM(jsonb_array_length(v -> 'options'))
    FROM jsonb_array_elements(mi.variations) v
  ) AS total_options,
  mi.variations
FROM menu_items mi
ORDER BY mi.name;


-- STEP 6: Drop old variation tables (ONLY after verifying STEP 5 looks correct)
-- ============================================================
-- Uncomment and run AFTER you are satisfied with the data above.
--
-- DROP TABLE IF EXISTS customization_choices;
-- DROP TABLE IF EXISTS customization_options;
--
-- ============================================================
-- DONE. All variations are now stored in menu_items.variations
-- ============================================================
