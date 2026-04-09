import type { ProductVariation } from "@/lib/types"

/** Current bulk-apply id. Re-running setup strips this and any `addons-unified-v1` before appending fresh JSON. */
export const UNIFIED_ADDONS_VARIATION_ID = "addons-unified-v2"

/** Previous bulk-apply id — still stripped in `lib/unified-addons-merge.ts` when migrating. */
export const UNIFIED_ADDONS_VARIATION_ID_V1 = "addons-unified-v1"

/**
 * Canonical Add-ons list for covered drink lines (same for all products in scope).
 * Edit labels/prices here, then re-run `POST /api/setup/unify-addons-variations`, or override per product in Admin.
 */
export const UNIFIED_ADDONS_VARIATION: ProductVariation = {
  id: UNIFIED_ADDONS_VARIATION_ID,
  type: "checkbox",
  required: false,
  title: "Add-ons",
  options: [
    { id: "ua-v2-extra-lift-off", label: "Extra Lift off", priceModifier: 2.5 },
    { id: "ua-v2-extra-nrg", label: "Extra NRG", priceModifier: 1 },
    { id: "ua-v2-extra-tea", label: "Extra Tea", priceModifier: 1 },
    { id: "ua-v2-extra-protein", label: "Extra Protein", priceModifier: 2 },
    { id: "ua-v2-defense-tablet", label: "Defense Tablet", priceModifier: 1.5 },
    { id: "ua-v2-immunity-booster", label: "Immunity Booster", priceModifier: 1.5 },
    { id: "ua-v2-probiotic", label: "Probiotic", priceModifier: 1 },
    { id: "ua-v2-hibiscus-tea", label: "Hibiscus Tea", priceModifier: 1 },
    { id: "ua-v2-green-tea", label: "Green Tea", priceModifier: 1 },
    { id: "ua-v2-whip-cream", label: "Whip Cream", priceModifier: 0.5 },
    { id: "ua-v2-prolessa", label: "Prolessa", priceModifier: 5 },
    { id: "ua-v2-whipped-cream", label: "Whipped Cream", priceModifier: 0.5 },
    { id: "ua-v2-caramel-drizzle", label: "Caramel Drizzle", priceModifier: 0.5 },
    { id: "ua-v2-vanilla-syrup", label: "Vanilla Syrup", priceModifier: 0.5 },
    { id: "ua-v2-honey", label: "Honey", priceModifier: 0.5 },
  ],
}

export function cloneUnifiedAddonsVariation(): ProductVariation {
  return JSON.parse(JSON.stringify(UNIFIED_ADDONS_VARIATION)) as ProductVariation
}
