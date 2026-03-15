"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, Package, CheckCircle2 } from "lucide-react"
import type { Order } from "@/lib/types"

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    const supabase = createBrowserClient()

    const fetchOrders = async () => {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          location:locations(*),
          user:users(email, full_name)
        `,
        )
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error fetching orders:", error)
      } else {
        setOrders(data || [])
      }
      setLoading(false)
    }

    fetchOrders()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [filter])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const supabase = createBrowserClient()

    const updates: any = { status: newStatus }

    if (newStatus === "preparing") {
      // Set estimated ready time to 15 minutes from now
      const readyTime = new Date()
      readyTime.setMinutes(readyTime.getMinutes() + 15)
      updates.estimated_ready_time = readyTime.toISOString()
    }

    const { error } = await supabase.from("orders").update(updates).eq("id", orderId)

    if (error) {
      console.error("[v0] Error updating order:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      confirmed: { variant: "default", icon: CheckCircle2 },
      preparing: { variant: "default", icon: Package },
      ready: { variant: "default", icon: CheckCircle2 },
      completed: { variant: "outline", icon: CheckCircle2 },
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "confirmed", "preparing", "ready", "completed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No orders found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">Order #{order.id.substring(0, 8)}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                  {order.user && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Customer: {order.user.full_name || order.user.email}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">${order.total_amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground capitalize">{order.order_type}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 py-4 border-y">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-start justify-between text-sm">
                    <div>
                      <span className="font-medium text-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      {item.customizations && item.customizations.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.customizations.map((c: any) => c.value).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {order.status === "pending" && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, "confirmed")}>
                    Confirm Order
                  </Button>
                )}
                {order.status === "confirmed" && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, "preparing")}>
                    Start Preparing
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, "ready")}>
                    Mark Ready
                  </Button>
                )}
                {order.status === "ready" && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, "completed")}>
                    Complete Order
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
