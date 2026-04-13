import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { MENU_ITEMS_LOYALTY_COLUMNS_SQL as SQL } from "@/lib/sql/menu-items-loyalty-columns"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase.from("menu_items").select("loyalty_points_earn, loyalty_points_cost").limit(1)

    if (error) {
      if (error.message?.includes("loyalty_points") || error.code === "42703") {
        return NextResponse.json({ columnsExist: false, sql: SQL })
      }
      throw error
    }

    return NextResponse.json({ columnsExist: true, sample: data })
  } catch (e) {
    return NextResponse.json(
      { columnsExist: false, sql: SQL, error: e instanceof Error ? e.message : "check failed" },
      { status: 200 },
    )
  }
}

export async function POST(_req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase.rpc("exec_sql", { query: SQL })
    if (error) {
      return NextResponse.json({
        success: false,
        sql: SQL,
        message: "Run this SQL in the Supabase SQL editor (exec_sql RPC not available or failed).",
        detail: error.message,
      })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({
      success: false,
      sql: SQL,
      message: e instanceof Error ? e.message : "Failed",
    })
  }
}
