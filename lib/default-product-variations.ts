import type { ProductVariation } from "@/lib/types"

/**
 * Generate a deterministic UUID-like id from a seed (same seed = same id for DB consistency).
 */
function seedUuid(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  const a = Math.abs(h).toString(16).padStart(8, "0").slice(-8)
  const b = Math.abs((h * 31) >>> 0).toString(16).padStart(4, "0").slice(-4)
  const c = Math.abs((h * 17) >>> 0).toString(16).padStart(4, "0").slice(-4)
  const d = Math.abs((h * 7) >>> 0).toString(16).padStart(4, "0").slice(-4)
  const e = Math.abs((h * 3) >>> 0).toString(16).padStart(12, "0").slice(-12)
  return `${a}-${b}-4${c.slice(1)}-a${d}-${e}`
}

/** Default variations for "Build Your Own Power Bowl" (product API shape) */
function getPowerBowlVariations(productId: string): ProductVariation[] {
  const s = (opt: string, i: number) => seedUuid(`${productId}-${opt}-${i}`)
  return [
    {
      id: s("base", 0),
      type: "radio",
      required: true,
      title: "Pick your Base",
      options: [
        { id: s("base-acai", 0), label: "Açaí", priceModifier: 0 },
        { id: s("base-pitaya", 1), label: "Pitaya", priceModifier: 0 },
        { id: s("base-oatmeal", 2), label: "Oatmeal", priceModifier: 0 },
      ],
    },
    {
      id: s("granola", 0),
      type: "radio",
      title: "Add Granola or Not",
      options: [
        { id: s("granola-yes", 0), label: "Granola", priceModifier: 0 },
        { id: s("granola-no", 1), label: "No Granola", priceModifier: 0 },
        { id: s("granola-blueberry", 2), label: "Blueberry Flax", priceModifier: 0.5 },
      ],
    },
    {
      id: s("fruits", 0),
      type: "checkbox",
      required: true,
      title: "Pick 3 Fruits",
      options: [
        { id: s("fruit-banana", 0), label: "Banana", priceModifier: 0 },
        { id: s("fruit-blueberry", 1), label: "Blueberry", priceModifier: 0 },
        { id: s("fruit-kiwi", 2), label: "Kiwi", priceModifier: 0 },
        { id: s("fruit-pineapple", 3), label: "Pineapple", priceModifier: 0 },
        { id: s("fruit-strawberry", 4), label: "Strawberry", priceModifier: 0 },
      ],
    },
    {
      id: s("boosta", 0),
      type: "checkbox",
      required: false,
      title: "Agaves Boosta",
      options: [
        { id: s("boosta-almond", 0), label: "Almond", priceModifier: 0.5 },
        { id: s("boosta-bee", 1), label: "Bee Pollen", priceModifier: 0.5 },
        { id: s("boosta-cacao", 2), label: "Cacao Nibs", priceModifier: 0.5 },
        { id: s("boosta-caramel", 3), label: "Caramel", priceModifier: 0.5 },
        { id: s("boosta-coconut", 4), label: "Coconut Flakes", priceModifier: 0.5 },
        { id: s("boosta-chia", 5), label: "Chia Seeds", priceModifier: 0.5 },
        { id: s("boosta-hemp", 6), label: "Hemp Seeds", priceModifier: 0.5 },
        { id: s("boosta-honey", 7), label: "Honey", priceModifier: 0.5 },
        { id: s("boosta-nutella", 8), label: "Nutella", priceModifier: 1 },
        { id: s("boosta-pb", 9), label: "Peanut Butter", priceModifier: 0.5 },
      ],
    },
  ]
}

/** Default variations for "Build Your Own Protein Waffle" (product API shape) */
function getProteinWaffleVariations(productId: string): ProductVariation[] {
  const s = (opt: string, i: number) => seedUuid(`${productId}-${opt}-${i}`)
  return [
    {
      id: s("topping", 0),
      type: "checkbox",
      required: false,
      title: "Toppings",
      options: [
        { id: s("top-nutella", 0), label: "Nutella", priceModifier: 0.5 },
        { id: s("top-pb", 1), label: "Peanut Butter", priceModifier: 0.5 },
        { id: s("top-syrup", 2), label: "Sugar-Free Syrup", priceModifier: 0 },
        { id: s("top-berries", 3), label: "Fresh Berries", priceModifier: 0.5 },
      ],
    },
  ]
}

/**
 * Return default variations when the API returns empty for known "build your own" products.
 * Used during sync so the DB has variations for dashboard and shop.
 */
export function getDefaultVariationsForProduct(
  productId: string,
  productName: string
): ProductVariation[] | null {
  const name = (productName || "").toLowerCase()
  if (name.includes("power bowl")) return getPowerBowlVariations(productId)
  if (name.includes("protein waffle") || name.includes("waffle")) return getProteinWaffleVariations(productId)
  return null
}
