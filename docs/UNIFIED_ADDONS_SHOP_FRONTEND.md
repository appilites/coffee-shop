# Unified add-ons — coffee shop (customer app)

**Full playbook:** [`docs/UNIFIED_ADDONS.md`](./UNIFIED_ADDONS.md)

The storefront must **not** branch on category or product name to pick shake vs drink add-ons. Use **only** `menu_items.variations` (or `GET /api/products` / product-by-id payloads that include the same JSON).

## Rules

1. Render checkbox/radio groups by mapping **`product.variations`** (after normalizing with `productVariationsToCustomizations` if needed).
2. The unified block uses **`id: "addons-unified-v2"`** and **`title: "Add-ons"`** — it is still just another variation; no special-case list swapping. Older rows may still show **`addons-unified-v1`** until bulk apply is re-run; treat any variation from the API as authoritative.
3. Line totals: **`calculateLineTotalFromSelections`** from `lib/calculate-variation-selection-price.ts` with `base_price`, full `variations`, and the customer’s selection map.
4. Do not add duplicate fees in the UI when an option already carries a `priceModifier`.

## Related code (this repo)

- `components/menu/customize-dialog.tsx` — driven by `item.variations` only.
- `lib/product-variations.ts` — API → customization UI shape.
- `lib/unified-drink-shake-addons.ts` — template used by the bulk setup route (shop reads from DB/API, not this file at runtime).

## Separate shop repo

Copy **`docs/SHOP_ADDONS_INTEGRATION.md`** into the customer app for env, types, cart, and API expectations.

## Cache

After a bulk DB update, clear ISR / CDN cache or redeploy so old `variations` JSON is not served indefinitely.

See: `docs/UNIFIED_ADDONS_DATABASE.md`, `docs/VARIATIONS_INTEGRATION.md`.
