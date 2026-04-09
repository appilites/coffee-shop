import type { ProductVariation } from "@/lib/types"

export type SelectedOptions = Record<string, string | string[]>

/**
 * Computes one unit line total from product base price + selected variations.
 * Checkbox selections keep user pick order for extra-selection charging rules.
 */
export function calculateLineTotalFromSelections(
  basePrice: number,
  variations: ProductVariation[] | undefined,
  selectedOptions: SelectedOptions,
): number {
  let total = Number(basePrice) || 0
  if (!Array.isArray(variations) || variations.length === 0) {
    return round2(total)
  }

  for (const variation of variations) {
    const selection = selectedOptions[variation.id]
    if (!selection) continue

    if (variation.type === "radio") {
      const selectedId = typeof selection === "string" ? selection : selection[0]
      if (!selectedId) continue
      const chosen = variation.options?.find((o) => o.id === selectedId)
      if (chosen) total += Number(chosen.priceModifier) || 0
      continue
    }

    const selectedIds = Array.isArray(selection) ? selection : [selection]
    const isPick3Fruits =
      variation.title?.toLowerCase().includes("pick 3") || variation.title?.toLowerCase().includes("3 fruits")
    const maxIncluded =
      typeof variation.maxIncludedSelections === "number"
        ? variation.maxIncludedSelections
        : isPick3Fruits
          ? 3
          : undefined
    const extra =
      variation.extraSelectionPrice != null ? Number(variation.extraSelectionPrice) : isPick3Fruits ? 1 : 0

    selectedIds.forEach((optionId, index) => {
      const opt = variation.options?.find((o) => o.id === optionId)
      if (opt) total += Number(opt.priceModifier) || 0

      if (typeof maxIncluded === "number" && maxIncluded >= 0 && extra > 0 && index >= maxIncluded) {
        total += extra
      }
    })
  }

  return round2(total)
}

function round2(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100
}

