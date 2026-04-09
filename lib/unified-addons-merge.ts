import type { ProductVariation } from "@/lib/types"
import {
  UNIFIED_ADDONS_VARIATION_ID,
  UNIFIED_ADDONS_VARIATION_ID_V1,
  cloneUnifiedAddonsVariation,
} from "@/lib/unified-drink-shake-addons"

function normTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\u2013/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

function isUnifiedAddonVariationId(id: string | undefined): boolean {
  if (!id) return false
  return id === UNIFIED_ADDONS_VARIATION_ID_V1 || id === UNIFIED_ADDONS_VARIATION_ID
}

/**
 * True if this variation is a legacy or previous bulk “Add-ons” block we replace with the current unified list.
 * Intentionally narrow so we do not strip unrelated checkbox groups (e.g. fruits, boostas).
 */
export function isLegacyUnifiedAddonSlot(v: ProductVariation): boolean {
  if (!v || typeof v.title !== "string") return false
  if (isUnifiedAddonVariationId(v.id)) return true
  const t = normTitle(v.title)
  if (t === "add-ons" || t === "addons" || t === "add ons") return true
  if (v.type === "checkbox" && (t === "extras" || t === "add-ons & extras")) return true
  return false
}

export function stripLegacyAddonVariations(
  variations: ProductVariation[] | undefined | null,
): ProductVariation[] {
  if (!Array.isArray(variations)) return []
  return variations.filter((v) => !isLegacyUnifiedAddonSlot(v))
}

/** Strip v1/v2 and title-based add-on slots, then append one current `addons-unified-v2` block. */
export function mergeUnifiedAddonsIntoVariations(
  variations: ProductVariation[] | undefined | null,
): ProductVariation[] {
  const base = stripLegacyAddonVariations(variations)
  return [...base, cloneUnifiedAddonsVariation()]
}
