import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"

type LineItem = { menu_item_id: string; quantity: number }

async function pointsFromLineItems(items: LineItem[]): Promise<number> {
  if (!items.length) return 0
  const supabase = getSupabaseAdminClient()
  const ids = [...new Set(items.map((i) => i.menu_item_id).filter(Boolean))]
  const { data, error } = await supabase.from("menu_items").select("id, loyalty_points_earn").in("id", ids)
  if (error || !data) return 0
  const byId = new Map(data.map((r) => [r.id, Math.max(0, Number(r.loyalty_points_earn ?? 0))]))
  let sum = 0
  for (const line of items) {
    const each = byId.get(line.menu_item_id) ?? 0
    sum += each * Math.max(0, Math.floor(Number(line.quantity) || 0))
  }
  return sum
}

// Award loyalty points after successful payment (registered users + users table).
// Prefers per-product loyalty_points_earn when lineItems are sent; else 1 pt / $1 from totalAmount.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, userId, totalAmount, lineItems } = body as {
      orderId?: string
      userId?: string
      totalAmount?: number
      lineItems?: LineItem[]
    }

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
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

    let pointsEarned = 0
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      pointsEarned = await pointsFromLineItems(lineItems)
    }
    if (pointsEarned <= 0 && totalAmount != null) {
      pointsEarned = Math.floor(Number(totalAmount) || 0)
    }

    if (pointsEarned <= 0) {
      return NextResponse.json({ success: true, pointsEarned: 0, message: "No points to award" })
    }

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
