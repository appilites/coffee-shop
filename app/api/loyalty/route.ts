import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { MENU_ITEMS_LOYALTY_COLUMNS_SQL as SETUP_SQL } from "@/lib/sql/menu-items-loyalty-columns"

function normalizeCategory(cat: unknown): { id: string; name: string } | null {
  if (!cat) return null
  if (Array.isArray(cat)) {
    const first = cat[0] as { id?: string; name?: string } | undefined
    return first?.id != null ? { id: String(first.id), name: String(first.name ?? "") } : null
  }
  if (typeof cat === "object" && cat !== null && "id" in cat) {
    const o = cat as { id: string; name?: string }
    return { id: String(o.id), name: String(o.name ?? "") }
  }
  return null
}

function mapRewardRow(row: Record<string, unknown>) {
  const category = normalizeCategory(row.category)

  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    base_price: Number(row.base_price ?? 0),
    image_url: (row.image_url as string) ?? null,
    loyalty_points_earn: Number(row.loyalty_points_earn ?? 0),
    loyalty_points_cost: Number(row.loyalty_points_cost ?? 0),
    is_available: Boolean(row.is_available),
    category,
  }
}

/** Public catalog: rewards from menu_items (loyalty_points_cost > 0) + products that earn points */
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()

    const rewardsRes = await supabase
      .from("menu_items")
      .select(
        `
        id,
        name,
        description,
        base_price,
        image_url,
        is_available,
        loyalty_points_earn,
        loyalty_points_cost,
        category:menu_categories ( id, name )
      `,
      )
      .gt("loyalty_points_cost", 0)
      .eq("is_available", true)
      .order("loyalty_points_cost", { ascending: true })

    if (rewardsRes.error) {
      const msg = rewardsRes.error.message || ""
      if (msg.includes("loyalty_points") || rewardsRes.error.code === "42703") {
        return NextResponse.json({
          rewards: [],
          productsEarningPoints: [],
          columnsExist: false,
          sql: SETUP_SQL,
        })
      }
      throw rewardsRes.error
    }

    const earnersRes = await supabase
      .from("menu_items")
      .select(
        `
        id,
        name,
        description,
        base_price,
        image_url,
        is_available,
        loyalty_points_earn,
        loyalty_points_cost,
        category:menu_categories ( id, name )
      `,
      )
      .gt("loyalty_points_earn", 0)
      .eq("is_available", true)
      .order("name", { ascending: true })

    const productsEarningPoints =
      earnersRes.error || !earnersRes.data ? [] : earnersRes.data.map((row) => mapRewardRow(row as Record<string, unknown>))

    const rewards = (rewardsRes.data || []).map((row) => mapRewardRow(row as Record<string, unknown>))

    return NextResponse.json({
      rewards,
      productsEarningPoints,
      columnsExist: true,
      allProducts: [...rewards, ...productsEarningPoints.filter((p) => !rewards.some((r) => r.id === p.id))],
    })
  } catch (e) {
    console.error("GET /api/loyalty:", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load loyalty data", rewards: [], productsEarningPoints: [] },
      { status: 500 },
    )
  }
}
