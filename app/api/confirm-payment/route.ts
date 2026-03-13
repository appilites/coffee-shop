import { type NextRequest, NextResponse } from "next"

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, orderId } = await req.json()

    console.log("[v0] Confirming payment for order:", orderId)

    // Simulate payment confirmation
    // In production with Stripe: const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    const simulatedPayment = {
      id: paymentIntentId,
      status: "succeeded",
      amount: 0,
      currency: "usd",
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration")
    }

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        payment_status: "paid",
        status: "confirmed",
      }),
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error("[v0] Order update error:", errorText)
      throw new Error("Failed to update order")
    }

    const orders = await updateResponse.json()
    const updatedOrder = orders[0]

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
