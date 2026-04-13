import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("[v0] Received order data:", JSON.stringify(body, null, 2))

    const {
      items,
      customer_name,
      customer_email,
      customer_phone,
      user_id,
      special_instructions,
      pickup_time: rawPickup,
      is_guest_order = true,
    } = body

    let pickup_time: string | null = null
    if (rawPickup != null && String(rawPickup).trim() !== "") {
      const t = new Date(String(rawPickup))
      pickup_time = Number.isNaN(t.getTime()) ? null : t.toISOString()
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }
    if (!customer_name || !customer_email) {
      return NextResponse.json({ error: "Customer name and email are required" }, { status: 400 })
    }

    for (const line of items) {
      if (!(line as any).menu_item_id && !(line as any).menuItemId) {
        return NextResponse.json({ error: "Each cart line must include menu_item_id" }, { status: 400 })
      }
    }

    // Calculate totals from cart items (items contain totalPrice already calculated with customizations)
    const subtotal = items.reduce((sum: number, item: any) => {
      // Cart items have totalPrice which includes base price + customizations * quantity
      const itemTotal = Number.parseFloat(item.totalPrice) || 0
      return sum + itemTotal
    }, 0)

    const tax = subtotal * 0.0875 // 8.75% tax to match checkout page
    const total = subtotal + tax

    console.log("[v0] Calculated totals - Subtotal:", subtotal, "Tax:", tax, "Total:", total)

    const supabase = getSupabaseAdminClient()
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn(
        "[create-order] SUPABASE_SERVICE_ROLE_KEY is not set — using anon key. Inserts may fail if RLS blocks anon. Add the service role key or run scripts/supabase-orders-rls.sql in Supabase.",
      )
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const orderData = {
      user_id: user_id || null,
      total_amount: Number.parseFloat(total.toFixed(2)),
      tax_amount: Number.parseFloat(tax.toFixed(2)),
      status: "pending",
      payment_status: "pending",
      customer_name: customer_name,
      customer_email: customer_email,
      customer_phone: customer_phone || null,
      special_instructions: special_instructions || null,
      pickup_time: pickup_time || null,
      is_guest_order: is_guest_order,
      order_number: orderNumber,
    }

    console.log("[v0] Inserting order:", JSON.stringify(orderData, null, 2))

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) {
      console.error("[v0] Error creating order:", orderError)
      const hint =
        orderError.message?.includes("permission denied") ||
        orderError.message?.includes("row-level security") ||
        orderError.code === "42501"
          ? "Add SUPABASE_SERVICE_ROLE_KEY to .env or run scripts/supabase-orders-rls.sql in Supabase SQL Editor."
          : undefined
      return NextResponse.json(
        { error: "Failed to create order", details: orderError.message, hint },
        { status: 500 },
      )
    }

    console.log("[v0] Order created successfully:", order.id)

    // and calculate unit_price from totalPrice / quantity
    const orderItems = items.map((item: any) => {
      const menuItemId = item.menu_item_id || item.menuItemId

      const quantity = Number.parseInt(String(item.quantity), 10) || 1
      const lineTotal = Number.parseFloat(String(item.totalPrice)) || 0
      const unitPrice = Number.parseFloat((lineTotal / quantity).toFixed(2))

      const rawCustom = item.customizations ?? item.selectedCustomizations
      const customizations = Array.isArray(rawCustom)
        ? rawCustom
        : rawCustom != null && typeof rawCustom === "object"
          ? [rawCustom]
          : []

      return {
        order_id: order.id,
        menu_item_id: String(menuItemId),
        item_name: String(item.name || "Item"),
        quantity,
        unit_price: unitPrice,
        total_price: Number.parseFloat(lineTotal.toFixed(2)),
        customizations,
      }
    })

    console.log("[v0] Inserting order items:", JSON.stringify(orderItems, null, 2))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] Error creating order items:", itemsError)
      await supabase.from("orders").delete().eq("id", order.id)
      const isFk =
        itemsError.code === "23503" ||
        itemsError.message?.includes("foreign key") ||
        itemsError.message?.includes("violates foreign key")
      const hint = isFk
        ? "Each cart line must reference a real menu_items.id in Supabase. Mock-only products or wrong IDs will fail. Sync products or use items from your live menu."
        : itemsError.message?.includes("permission denied") ||
            itemsError.message?.includes("row-level security")
          ? "Add SUPABASE_SERVICE_ROLE_KEY or run scripts/supabase-orders-rls.sql."
          : undefined
      return NextResponse.json(
        {
          error: "Failed to create order items",
          details: itemsError.message,
          hint,
        },
        { status: isFk ? 400 : 500 },
      )
    }

    console.log("[v0] Order items created successfully")

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error("[v0] Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 })
  }
}
