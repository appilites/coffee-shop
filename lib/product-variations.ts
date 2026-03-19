import type { ProductVariation } from "@/lib/types"
import type { CustomizationOption, CustomizationChoice } from "@/lib/types"

/**
 * Convert product API variations (on menu_items.variations) into the same shape
 * as customization_options + choices, so the rest of the app can use one code path.
 */
export function productVariationsToCustomizations(
  variations: ProductVariation[] | undefined
): (CustomizationOption & { choices: CustomizationChoice[] })[] {
  if (!Array.isArray(variations) || variations.length === 0) return []

  return variations.map((v) => ({
    id: v.id,
    menu_item_id: "", // not needed when from product
    option_name: v.title,
    option_type: v.type === "checkbox" ? "multiple" : "single",
    is_required: true,
    created_at: "",
    choices: (v.options || []).map((opt) => ({
      id: opt.id,
      option_id: v.id,
      choice_name: opt.label,
      price_modifier: opt.priceModifier ?? 0,
      is_default: false,
      created_at: "",
    })),
  }))
}
