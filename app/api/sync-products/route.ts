import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getDefaultVariationsForProduct } from "@/lib/default-product-variations"

/** Product shape from your products API response */
interface ApiProduct {
  id: string
  category_id: string
  name: string
  description?: string | null
  base_price: number
  image_url?: string | null
  is_available?: boolean
  is_featured?: boolean
  prep_time_minutes?: number
  created_at?: string
  updated_at?: string
  variations?: Array<{
    id: string
    type: "radio" | "checkbox"
    title: string
    required?: boolean
    options?: Array<{ id: string; label: string; priceModifier: number }>
  }>
  category?: { id: string; name: string; parent_id?: string | null }
  calculatedTotalPrice?: number
  priceRange?: { minPrice: number; maxPrice: number }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const products: ApiProduct[] = Array.isArray(body.products) ? body.products : Array.isArray(body) ? body : []

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty products array. Send { products: [...] } or [...]" },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    const results: { id: string; name: string; variationsCount: number; error?: string }[] = []

    for (const p of products) {
      if (!p.id || !p.name) {
        results.push({ id: p.id || "?", name: p.name || "?", variationsCount: 0, error: "Missing id or name" })
        continue
      }

      let variations = Array.isArray(p.variations) ? p.variations : []
      if (variations.length === 0) {
        const defaults = getDefaultVariationsForProduct(p.id, p.name)
        if (defaults) variations = defaults
      }

      const row = {
        id: String(p.id),
        category_id: p.category_id ?? null,
        name: String(p.name),
        description: p.description ?? null,
        base_price: Number(p.base_price) ?? 0,
        image_url: p.image_url ?? null,
        is_available: p.is_available !== false,
        is_featured: p.is_featured === true,
        prep_time_minutes: Number(p.prep_time_minutes) ?? 5,
        variations: variations,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("menu_items").upsert(row, {
        onConflict: "id",
      })

      if (error) {
        results.push({
          id: p.id,
          name: p.name,
          variationsCount: variations.length,
          error: error.message,
        })
      } else {
        results.push({ id: p.id, name: p.name, variationsCount: variations.length })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${products.length} products to menu_items`,
      results,
    })
  } catch (e) {
    console.error("[sync-products]", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    )
  }
}
