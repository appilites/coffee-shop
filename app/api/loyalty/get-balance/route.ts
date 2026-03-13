import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Get user's loyalty points balance
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("loyalty_points, total_points_earned, total_points_redeemed")
      .eq("id", userId)
      .single()

    if (error) throw error

    return NextResponse.json({
      current_points: user.loyalty_points || 0,
      total_points_earned: user.total_points_earned || 0,
      total_points_redeemed: user.total_points_redeemed || 0,
    })
  } catch (error) {
    console.error("Error fetching points balance:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch balance" },
      { status: 500 },
    )
  }
}
