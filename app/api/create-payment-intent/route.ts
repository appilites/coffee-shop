import { type NextRequest, NextResponse } from "next"

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "usd" } = await req.json()

    // Simulate payment intent creation
    // In production with Stripe integration, use:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    // const paymentIntent = await stripe.paymentIntents.create({ amount, currency })

    const simulatedPaymentIntent = {
      id: `pi_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      client_secret: `pi_sim_secret_${Date.now()}`,
      amount,
      currency,
      status: "requires_payment_method",
    }

    return NextResponse.json({
      clientSecret: simulatedPaymentIntent.client_secret,
      paymentIntentId: simulatedPaymentIntent.id,
    })
  } catch (error) {
    console.error("[v0] Payment intent creation error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
