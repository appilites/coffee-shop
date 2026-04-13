import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type LineItem = { menu_item_id: string; quantity: number }

/** Sum loyalty_points_earn × quantity for cart / order lines (guest checkout). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items: LineItem[] = Array.isArray(body.items) ? body.items : []

    if (items.length === 0) {
      return NextResponse.json({ pointsEarned: 0, breakdown: [] })
    }

    const supabase = getSupabaseAdminClient()
    const ids = [...new Set(items.map((i) => i.menu_item_id).filter(Boolean))]
    if (ids.length === 0) {
      return NextResponse.json({ pointsEarned: 0, breakdown: [] })
    }

    const { data, error } = await supabase
      .from("menu_items")
      .select("id, loyalty_points_earn, name")
      .in("id", ids)

    if (error) {
      if (error.message?.includes("loyalty_points") || error.code === "42703") {
        return NextResponse.json({
          pointsEarned: 0,
          breakdown: [],
          columnsExist: false,
          message: "loyalty_points_earn column missing on menu_items",
        })
      }
      throw error
    }

    const byId = new Map((data || []).map((r) => [r.id, r]))
    let pointsEarned = 0
    const breakdown: { menu_item_id: string; quantity: number; earn_each: number; subtotal: number }[] = []

    for (const line of items) {
      const row = byId.get(line.menu_item_id)
      const earnEach = Math.max(0, Number(row?.loyalty_points_earn ?? 0))
      const qty = Math.max(0, Math.floor(Number(line.quantity) || 0))
      const subtotal = earnEach * qty
      pointsEarned += subtotal
      breakdown.push({ menu_item_id: line.menu_item_id, quantity: qty, earn_each: earnEach, subtotal })
    }

    return NextResponse.json({ pointsEarned, breakdown, columnsExist: true })
  } catch (e) {
    console.error("POST /api/loyalty/compute-earn:", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to compute points", pointsEarned: 0 },
      { status: 500 },
    )
  }
}
