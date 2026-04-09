# Shop add-ons integration (copy into coffee-shop repo)

**Full playbook (admin + DB + deploy):** [`docs/UNIFIED_ADDONS.md`](./UNIFIED_ADDONS.md)

Use this checklist when the **customer-facing** app lives in a separate repository from admin. The admin (or Supabase) owns **`menu_items.variations`**; the shop only **displays** and **prices** what the API returns.

## Environment

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or your products API base URL) must match the project where unified add-ons were applied.
- No env var is required for the add-on **list** itself — it arrives on each product payload.

## Types

Align `ProductVariation` with `docs/VARIATIONS_INTEGRATION.md`:

- `id`, `type` (`radio` | `checkbox`), `title`, `required?`, `maxIncludedSelections?`, `extraSelectionPrice?`, `options[]` with `id`, `label`, `priceModifier`.

Unified add-ons block:

- **`id`:** `addons-unified-v2`
- **`title`:** `Add-ons`
- **`type`:** `checkbox`

## Fetching products

- Prefer **`GET /api/products`** or product-by-id from your BFF, or Supabase `menu_items` with `variations` selected.
- Do **not** merge in a second add-ons list from category name (e.g. shake vs drink).

## Cart and checkout

- Persist selected option ids per variation id (checkbox → ordered `string[]` if you use extra-selection rules).
- Compute display totals with the same helper as admin expects (e.g. `calculateLineTotalFromSelections` from your shared doc).
- **Payment / create-order** should recompute totals server-side from stored line items + current variation definitions where applicable.

## QA

1. Pick a drink-line product → open customize → confirm **Add-ons** matches Supabase (`addons-unified-v2` options).
2. After admin runs bulk apply, **hard-refresh** or revalidate ISR so cached JSON is not stale.

## Related

- `docs/UNIFIED_ADDONS_SHOP_FRONTEND.md` (this monorepo)
- `docs/UNIFIED_ADDONS_DATABASE.md` — setup API + SQL
- `lib/unified-drink-shake-addons.ts` — canonical labels/prices (source of truth for bulk apply)
