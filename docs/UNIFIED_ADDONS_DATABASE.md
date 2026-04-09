# Unified add-ons (database)

**Full playbook:** [`docs/UNIFIED_ADDONS.md`](./UNIFIED_ADDONS.md)

Bulk-apply one checkbox variation (**`id: addons-unified-v2`**) to drink-line products by updating `menu_items.variations` in Supabase. Running apply **removes** prior unified blocks (**`addons-unified-v1`**, **`addons-unified-v2`**) and title-based “Add-ons” / “Extras” groups, then **appends** the current canonical list.

## Source files

| File | Purpose |
|------|---------|
| `lib/unified-drink-shake-addons.ts` | Master `UNIFIED_ADDONS_VARIATION` (labels + `priceModifier` values) |
| `lib/unified-addons-category-scope.ts` | Which `menu_categories.id` rows are in scope (+ seed id aliases) |
| `lib/unified-addons-merge.ts` | Strips legacy slots and appends `addons-unified-v2` |
| `app/api/setup/unify-addons-variations/route.ts` | `GET` preview + `POST` dry-run / apply |
| `docs/sql/apply_unified_addons_to_menu_items.sql` | Optional Postgres `merge_unified_addons_v2()` without Node |

## Requirements

- `menu_items.variations` JSONB column exists.
- **Apply** (`dryRun: false`) requires **`SUPABASE_SERVICE_ROLE_KEY`** or **`SUPABASE_SECRET_KEY`** on the server so updates bypass RLS.

## API

**Preview categories + count (no writes)**

`GET /api/setup/unify-addons-variations`

**Preview rows (no writes)**

```http
POST /api/setup/unify-addons-variations
Content-Type: application/json

{ "dryRun": true }
```

**Apply**

```http
POST /api/setup/unify-addons-variations
Content-Type: application/json

{ "dryRun": false }
```

**Limit to explicit categories**

```json
{ "dryRun": false, "categoryIds": ["cat-kids-berry", "cat-loaded-tea-berry"] }
```

## Category resolution (auto)

When `categoryIds` is omitted, scope includes:

1. Subtrees under **`cat-hot-beverages`**, **`cat-cold-beverages`**, and **`cat-coffee-bar`** (plus parents whose name contains “hot beverage” / “cold beverage”).
2. Categories whose names or ancestor names match (case-insensitive): **Kids Drinks**, **Meal Replacement**, **Specialty Drinks**, **Cold Drinks**, **Beauty Drinks**, **Loaded Tea**.
3. IDs from `UNIFIED_ADDONS_MOCK_CATEGORY_IDS` in `lib/unified-addons-category-scope.ts` when present (includes mock ids such as `cat-1`, `cat-2`, … and aliases like **`cat-meal-replacement`**, **`cat-loaded-tea-berry`**, **`cat-kids-berry`**, **`cat-cold-drinks`**).

**Excluded:** `cat-power-bowl` and `cat-quick-snacks` subtrees (food / bowls).

## After apply

- Confirm in Supabase Table Editor: `variations` contains **`id: "addons-unified-v2"`** and the 15 canonical options.
- Admin → product → Variations should match.
- Revalidate or hard-refresh the shop so clients load fresh JSON.

See also: `docs/VARIATIONS_INTEGRATION.md`, `docs/SHOP_ADDONS_INTEGRATION.md`.
