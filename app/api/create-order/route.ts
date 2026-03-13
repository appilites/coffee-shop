import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("[v0] Received order data:", JSON.stringify(body, null, 2))

    const {
      items,
      location_id,
      customer_name,
      customer_email,
      customer_phone,
      user_id,
      special_instructions,
      is_guest_order = true,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }
    if (!location_id) {
      return NextResponse.json({ error: "Location ID is required" }, { status: 400 })
    }
    if (!customer_name || !customer_email) {
      return NextResponse.json({ error: "Customer name and email are required" }, { status: 400 })
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

    const supabase = await createServerClient()

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const orderData = {
      user_id: user_id || null,
      location_id: location_id,
      total_amount: Number.parseFloat(total.toFixed(2)),
      tax_amount: Number.parseFloat(tax.toFixed(2)),
      status: "pending",
      payment_status: "pending",
      customer_name: customer_name,
      customer_email: customer_email,
      customer_phone: customer_phone || null,
      special_instructions: special_instructions || null,
      is_guest_order: is_guest_order,
      order_number: orderNumber,
    }

    console.log("[v0] Inserting order:", JSON.stringify(orderData, null, 2))

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) {
      console.error("[v0] Error creating order:", orderError)
      return NextResponse.json({ error: "Failed to create order", details: orderError.message }, { status: 500 })
    }

    console.log("[v0] Order created successfully:", order.id)

    // and calculate unit_price from totalPrice / quantity
    const orderItems = items.map((item: any) => {
      // Extract the menu_item UUID from the cart item ID (remove the timestamp suffix)
      const menuItemId = item.id.includes("-") ? item.id.substring(0, item.id.lastIndexOf("-")) : item.id

      const quantity = Number.parseInt(item.quantity) || 1
      const unitPrice = Number.parseFloat((item.totalPrice / quantity).toFixed(2))

      return {
        order_id: order.id,
        menu_item_id: menuItemId, // Clean UUID without timestamp
        item_name: item.name,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: Number.parseFloat(item.totalPrice.toFixed(2)),
        customizations: item.customizations || {},
      }
    })

    console.log("[v0] Inserting order items:", JSON.stringify(orderItems, null, 2))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] Error creating order items:", itemsError)
      // Try to delete the order if items failed
      await supabase.from("orders").delete().eq("id", order.id)
      return NextResponse.json({ error: "Failed to create order items", details: itemsError.message }, { status: 500 })
    }

    console.log("[v0] Order items created successfully")

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error("[v0] Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 })
  }
}
