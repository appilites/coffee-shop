import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// Redeem: legacy `rewards` table OR menu_items with loyalty_points_cost (menuItemId)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { rewardId, menuItemId, userId } = body as {
      rewardId?: string
      menuItemId?: string
      userId?: string
    }

    const productId = menuItemId || rewardId

    if (!productId || !userId) {
      return NextResponse.json({ error: "Product/reward ID and user ID are required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const admin = getSupabaseAdminClient()

    let pointsRequired = 0
    let rewardName = ""
    let source: "menu_item" | "rewards" = "menu_item"

    const menuRes = await admin
      .from("menu_items")
      .select("id, name, loyalty_points_cost, is_available")
      .eq("id", productId)
      .single()

    if (!menuRes.error && menuRes.data && Number(menuRes.data.loyalty_points_cost) > 0) {
      if (!menuRes.data.is_available) {
        return NextResponse.json({ error: "Product is not available" }, { status: 400 })
      }
      pointsRequired = Number(menuRes.data.loyalty_points_cost)
      rewardName = menuRes.data.name
      source = "menu_item"
    } else {
      const { data: reward, error: rewardError } = await supabase
        .from("rewards")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
        .single()

      if (rewardError || !reward) {
        return NextResponse.json({ error: "Reward not found or not configured as redeemable" }, { status: 404 })
      }
      pointsRequired = reward.points_required
      rewardName = reward.name
      source = "rewards"
    }

    // Get user's current points
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("loyalty_points, total_points_redeemed")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentPoints = user.loyalty_points || 0

    if (currentPoints < pointsRequired) {
      return NextResponse.json(
        { error: "Insufficient points", required: pointsRequired, current: currentPoints },
        { status: 400 },
      )
    }

    const newPointsBalance = currentPoints - pointsRequired
    const newTotalRedeemed = (user.total_points_redeemed || 0) + pointsRequired

    const { error: updateError } = await supabase
      .from("users")
      .update({
        loyalty_points: newPointsBalance,
        total_points_redeemed: newTotalRedeemed,
      })
      .eq("id", userId)

    if (updateError) throw updateError

    const { error: transactionError } = await supabase.from("loyalty_points_transactions").insert({
      user_id: userId,
      points: -pointsRequired,
      transaction_type: "redeemed",
      description: `Redeemed ${rewardName} for ${pointsRequired} points`,
      reward_id: productId,
    })

    if (transactionError) throw transactionError

    let userReward: Record<string, unknown> | null = null

    if (source === "rewards") {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 3)
      const { data, error: userRewardError } = await supabase
        .from("user_rewards")
        .insert({
          user_id: userId,
          reward_id: productId,
          points_spent: pointsRequired,
          status: "active",
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()
      if (userRewardError) throw userRewardError
      userReward = data
    }

    return NextResponse.json({
      success: true,
      userReward,
      menuItemId: source === "menu_item" ? productId : undefined,
      newBalance: newPointsBalance,
    })
  } catch (error) {
    console.error("Error redeeming reward:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to redeem reward" },
      { status: 500 },
    )
  }
}
