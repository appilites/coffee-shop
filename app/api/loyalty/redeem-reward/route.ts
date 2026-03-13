import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Redeem a reward using loyalty points
export async function POST(req: NextRequest) {
  try {
    const { rewardId, userId } = await req.json()

    if (!rewardId || !userId) {
      return NextResponse.json({ error: "Reward ID and user ID are required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from("rewards")
      .select("*")
      .eq("id", rewardId)
      .eq("is_active", true)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json({ error: "Reward not found or inactive" }, { status: 404 })
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

    // Check if user has enough points
    if (currentPoints < reward.points_required) {
      return NextResponse.json(
        {
          error: "Insufficient points",
          required: reward.points_required,
          current: currentPoints,
        },
        { status: 400 },
      )
    }

    // Deduct points
    const newPointsBalance = currentPoints - reward.points_required
    const newTotalRedeemed = (user.total_points_redeemed || 0) + reward.points_required

    const { error: updateError } = await supabase
      .from("users")
      .update({
        loyalty_points: newPointsBalance,
        total_points_redeemed: newTotalRedeemed,
      })
      .eq("id", userId)

    if (updateError) throw updateError

    // Create transaction record
    const { error: transactionError } = await supabase.from("loyalty_points_transactions").insert({
      user_id: userId,
      points: -reward.points_required,
      transaction_type: "redeemed",
      description: `Redeemed ${reward.name} for ${reward.points_required} points`,
      reward_id: rewardId,
    })

    if (transactionError) throw transactionError

    // Create user reward record
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 3) // Rewards expire in 3 months

    const { data: userReward, error: userRewardError } = await supabase
      .from("user_rewards")
      .insert({
        user_id: userId,
        reward_id: rewardId,
        points_spent: reward.points_required,
        status: "active",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (userRewardError) throw userRewardError

    return NextResponse.json({
      success: true,
      userReward,
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
