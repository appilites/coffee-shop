import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

/**
 * Customer-facing order read (same DB as admin dashboard).
 * Uses service role so guests can track by order ID link without broad RLS on anon.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      payment_status,
      updated_at,
      created_at,
      total_amount,
      tax_amount,
      customer_name,
      special_instructions,
      pickup_time,
      items:order_items (
        id,
        menu_item_id,
        item_name,
        quantity,
        unit_price,
        total_price,
        customizations
      )
    `,
    )
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[orders/[id]] GET:", error)
    return NextResponse.json({ error: "Failed to load order", details: error.message }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({ order })
}
