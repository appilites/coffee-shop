-- Apply unified Add-ons (`addons-unified-v2`) to `menu_items.variations` without Node.
-- Mirrors `lib/unified-addons-merge.ts`: strips `addons-unified-v1`, `addons-unified-v2`, and
-- title-based “Add-ons” / “Extras” checkbox groups, then appends the canonical block.
--
-- Prefer `POST /api/setup/unify-addons-variations` when possible (category scope matches `lib/unified-addons-category-scope.ts`).
--
-- Usage after creating the function:
--   UPDATE menu_items
--   SET variations = public.merge_unified_addons_v2(variations), updated_at = now()
--   WHERE <your filter, e.g. category_id = ANY(ARRAY['cat-1','cat-2']::text[])>;
--
-- Backup first: export `menu_items` or run in a transaction with ROLLBACK to verify.

CREATE OR REPLACE FUNCTION public.merge_unified_addons_v2(p_variations jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  i int;
  n int;
  elem jsonb;
  result jsonb := '[]'::jsonb;
  v_title text;
  v_type text;
  v_unified jsonb := $json$
{
  "id": "addons-unified-v2",
  "type": "checkbox",
  "required": false,
  "title": "Add-ons",
  "options": [
    { "id": "ua-v2-extra-lift-off", "label": "Extra Lift off", "priceModifier": 2.5 },
    { "id": "ua-v2-extra-nrg", "label": "Extra NRG", "priceModifier": 1 },
    { "id": "ua-v2-extra-tea", "label": "Extra Tea", "priceModifier": 1 },
    { "id": "ua-v2-extra-protein", "label": "Extra Protein", "priceModifier": 2 },
    { "id": "ua-v2-defense-tablet", "label": "Defense Tablet", "priceModifier": 1.5 },
    { "id": "ua-v2-immunity-booster", "label": "Immunity Booster", "priceModifier": 1.5 },
    { "id": "ua-v2-probiotic", "label": "Probiotic", "priceModifier": 1 },
    { "id": "ua-v2-hibiscus-tea", "label": "Hibiscus Tea", "priceModifier": 1 },
    { "id": "ua-v2-green-tea", "label": "Green Tea", "priceModifier": 1 },
    { "id": "ua-v2-whip-cream", "label": "Whip Cream", "priceModifier": 0.5 },
    { "id": "ua-v2-prolessa", "label": "Prolessa", "priceModifier": 5 },
    { "id": "ua-v2-whipped-cream", "label": "Whipped Cream", "priceModifier": 0.5 },
    { "id": "ua-v2-caramel-drizzle", "label": "Caramel Drizzle", "priceModifier": 0.5 },
    { "id": "ua-v2-vanilla-syrup", "label": "Vanilla Syrup", "priceModifier": 0.5 },
    { "id": "ua-v2-honey", "label": "Honey", "priceModifier": 0.5 }
  ]
}
$json$::jsonb;
BEGIN
  IF p_variations IS NULL OR jsonb_typeof(p_variations) <> 'array' THEN
    RETURN jsonb_build_array(v_unified);
  END IF;

  n := coalesce(jsonb_array_length(p_variations), 0);
  FOR i IN 0..n - 1 LOOP
    elem := p_variations->i;
    IF (elem->>'id') IN ('addons-unified-v1', 'addons-unified-v2') THEN
      CONTINUE;
    END IF;

    v_type := elem->>'type';
    v_title := lower(regexp_replace(regexp_replace(trim(elem->>'title'), E'\u2013', '-', 'g'), '\s+', ' ', 'g'));

    IF v_title IN ('add-ons', 'addons', 'add ons') THEN
      CONTINUE;
    END IF;

    IF v_type = 'checkbox' AND v_title IN ('extras', 'add-ons & extras') THEN
      CONTINUE;
    END IF;

    result := result || jsonb_build_array(elem);
  END LOOP;


  result := result || jsonb_build_array(v_unified);
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.merge_unified_addons_v2(jsonb) IS
  'Strip legacy/unified add-on variation slots and append addons-unified-v2; keep in sync with lib/unified-addons-merge.ts';
