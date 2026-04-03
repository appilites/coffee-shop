import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, orderId } = await req.json()

    console.log("[v0] Confirming payment for order:", orderId)

    const simulatedPayment = {
      id: paymentIntentId,
      status: "succeeded",
      amount: 0,
      currency: "usd",
    }

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    // Payment captured — workflow status stays `pending` until kitchen/admin confirms in dashboard.
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_intent_id: paymentIntentId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Order update error:", updateError)
      return NextResponse.json({ error: "Failed to update order", details: updateError.message }, { status: 500 })
    }

    console.log("[v0] Payment confirmed and order updated successfully")

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      payment: simulatedPayment,
    })
  } catch (error) {
    console.error("[v0] Payment confirmation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to confirm payment" },
      { status: 500 },
    )
  }
}
