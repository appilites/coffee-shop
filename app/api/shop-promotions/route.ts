import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { promotionRowToShop, type PromotionRow } from "@/lib/promotions"

/**
 * Active promotions for the shop (same Supabase as admin).
 * Uses anon key + RLS (`is_active = true`). Do not expose service role to the client.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return NextResponse.json([], {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    })
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from("promotions")
    .select("id, name, image_url, description, menu_item_id, external_url, is_active, sort_order, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[shop-promotions]", error.message)
    return NextResponse.json([], { status: 200 })
  }

  const rows = (data ?? []) as PromotionRow[]
  const promotions = rows.map(promotionRowToShop)

  return NextResponse.json(promotions, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  })
}
