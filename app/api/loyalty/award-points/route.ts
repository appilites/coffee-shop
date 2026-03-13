import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Award loyalty points after successful payment
// Points calculation: 1 point per $1 spent (rounded down)
export async function POST(req: NextRequest) {
  try {
    const { orderId, userId, totalAmount } = await req.json()

    if (!orderId || !totalAmount) {
      return NextResponse.json({ error: "Order ID and total amount are required" }, { status: 400 })
    }

    // Only award points to registered users
    if (!userId) {
      return NextResponse.json({ success: true, message: "Points only awarded to registered users" })
    }

    const supabase = await createServerClient()

    // Verify user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate points: 1 point per $1 spent
    const pointsEarned = Math.floor(totalAmount)

    // Update user's loyalty points
    const { data: currentUser, error: updateError } = await supabase
      .from("users")
      .select("loyalty_points, total_points_earned")
      .eq("id", userId)
      .single()

    if (updateError) throw updateError

    const newPointsBalance = (currentUser.loyalty_points || 0) + pointsEarned
    const newTotalEarned = (currentUser.total_points_earned || 0) + pointsEarned

    const { error: pointsError } = await supabase
      .from("users")
      .update({
        loyalty_points: newPointsBalance,
        total_points_earned: newTotalEarned,
      })
      .eq("id", userId)

    if (pointsError) throw pointsError

    // Create transaction record
    const { error: transactionError } = await supabase.from("loyalty_points_transactions").insert({
      user_id: userId,
      order_id: orderId,
      points: pointsEarned,
      transaction_type: "earned",
      description: `Earned ${pointsEarned} points from order #${orderId}`,
    })

    if (transactionError) throw transactionError

    return NextResponse.json({
      success: true,
      pointsEarned,
      newBalance: newPointsBalance,
    })
  } catch (error) {
    console.error("Error awarding loyalty points:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to award points" },
      { status: 500 },
    )
  }
}
