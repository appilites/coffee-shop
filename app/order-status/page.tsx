"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle2, Star, Sparkles, XCircle } from "lucide-react"
import { useLoyalty } from "@/lib/context/loyalty-context"
import Link from "next/link"
import {
  ORDER_WORKFLOW_STEPS,
  cancelledMeta,
  getWorkflowStepIndex,
  normalizeOrderStatus,
  ORDER_STATUS_LABELS,
} from "@/lib/order-workflow"

type ApiOrderItem = {
  id?: string
  menu_item_id?: string | null
  item_name?: string
  quantity?: number
  total_price?: number
  customizations?: unknown
}

type ApiOrder = {
  id: string
  order_number?: string | null
  status?: string | null
  payment_status?: string | null
  updated_at?: string | null
  created_at?: string | null
  total_amount?: number | null
  tax_amount?: number | null
  customer_name?: string | null
  special_instructions?: string | null
  pickup_time?: string | null
  items?: ApiOrderItem[] | null
}

type DisplayItem = {
  name: string
  quantity: number
  price: number
  menu_item_id?: string
  is_loyalty_redemption?: boolean
  customizations?: unknown
}

type DisplayOrder = {
  id: string
  order_number?: string | null
  items: DisplayItem[]
  status: string
  payment_status?: string
  total_amount: number
  subtotal: number
  tax_amount: number
  created_at?: string
  updated_at?: string | null
  pickup_time?: string | null
  /** true if status/totals came from API (Supabase), not only localStorage */
  syncedFromServer?: boolean
}

function mapApiOrderToDisplay(o: ApiOrder): DisplayOrder {
  const tax = Number(o.tax_amount) || 0
  const total = Number(o.total_amount) || 0
  const items: DisplayItem[] = (o.items || []).map((row) => ({
    name: String(row.item_name || "Item"),
    quantity: Number(row.quantity) || 1,
    price: Number(row.total_price) || 0,
    menu_item_id: row.menu_item_id ? String(row.menu_item_id) : undefined,
    customizations: row.customizations,
  }))
  const subtotal = Math.max(0, total - tax)

  return {
    id: o.id,
    order_number: o.order_number,
    status: normalizeOrderStatus(o.status),
    payment_status: o.payment_status ?? undefined,
    updated_at: o.updated_at,
    created_at: o.created_at ?? undefined,
    pickup_time: o.pickup_time,
    total_amount: total,
    tax_amount: tax,
    subtotal: Number.isFinite(subtotal) ? subtotal : 0,
    items,
    syncedFromServer: true,
  }
}

function mergeLocalIntoDisplay(local: Record<string, unknown>, apiDisplay: DisplayOrder | null): DisplayOrder | null {
  if (apiDisplay) {
    const merged: DisplayOrder = {
      ...apiDisplay,
      items: apiDisplay.items.length > 0 ? apiDisplay.items : mapLocalItems(local),
    }
    if (!merged.subtotal && typeof local.subtotal === "number") merged.subtotal = local.subtotal as number
    return merged
  }

  const id = local.id as string | undefined
  if (!id) return null

  const items = mapLocalItems(local)
  const total = Number(local.total_amount) || 0
  const tax = Number(local.tax_amount) || 0
  const sub = typeof local.subtotal === "number" ? (local.subtotal as number) : Math.max(0, total - tax)

  return {
    id,
    order_number: (local.order_number as string) || null,
    status: normalizeOrderStatus(local.status as string),
    payment_status: local.payment_status as string | undefined,
    items,
    total_amount: total,
    tax_amount: tax,
    subtotal: sub,
    created_at: local.created_at as string | undefined,
    pickup_time: local.pickup_time as string | null | undefined,
    syncedFromServer: false,
  }
}

function mapLocalItems(local: Record<string, unknown>): DisplayItem[] {
  const raw = local.items as DisplayItem[] | undefined
  if (!Array.isArray(raw)) return []
  return raw.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: typeof item.price === "number" ? item.price : Number(item.price) || 0,
    menu_item_id: item.menu_item_id,
    is_loyalty_redemption: item.is_loyalty_redemption,
    customizations: item.customizations,
  }))
}

function renderCustomizationLines(customizations: unknown) {
  if (!customizations) return null
  const list = Array.isArray(customizations) ? customizations : [customizations]
  if (list.length === 0) return null
  return (
    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
      {list.map((c: any, i: number) => {
        if (c && typeof c === "object" && "optionName" in c && Array.isArray(c.choices)) {
          return (
            <p key={i} className="line-clamp-2">
              {c.optionName}: {c.choices.map((ch: { name?: string }) => ch.name).join(", ")}
            </p>
          )
        }
        if (typeof c === "string") {
          return (
            <p key={i} className="line-clamp-2">
              {c}
            </p>
          )
        }
        return (
          <p key={i} className="line-clamp-2">
            {JSON.stringify(c)}
          </p>
        )
      })}
    </div>
  )
}

const STATUS_POLL_MS = 15_000

function OrderStatusContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const { awardPoints, refreshPoints, isLoyaltyActive, isLoading: loyaltyLoading } = useLoyalty()

  const [order, setOrder] = useState<DisplayOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pointsEarned, setPointsEarned] = useState<number | null>(null)

  const fetchOrderFromApi = useCallback(async (): Promise<DisplayOrder | null> => {
    if (!orderId) return null
    const res = await fetch(`/api/orders/${orderId}`)
    if (!res.ok) return null
    const payload = await res.json()
    const row = payload.order as ApiOrder | undefined
    if (!row?.id) return null
    return mapApiOrderToDisplay(row)
  }, [orderId])

  const persistStatusToLocal = useCallback(
    (o: DisplayOrder) => {
      if (typeof window === "undefined" || !o.id) return
      try {
        const key = `order-${o.id}`
        const prev = JSON.parse(localStorage.getItem(key) || "{}")
        localStorage.setItem(
          key,
          JSON.stringify({
            ...prev,
            id: o.id,
            status: o.status,
            payment_status: o.payment_status,
            updated_at: o.updated_at,
            order_number: o.order_number ?? prev.order_number,
          }),
        )
      } catch {
        /* ignore */
      }
    },
    [],
  )

  useEffect(() => {
    if (!orderId) {
      router.push("/")
      return
    }

    let cancelled = false

    const loadOrder = async () => {
      try {
        const apiDisplay = await fetchOrderFromApi()
        const localRaw = JSON.parse(localStorage.getItem(`order-${orderId}`) || "{}") as Record<string, unknown>
        const merged = mergeLocalIntoDisplay(localRaw, apiDisplay)

        if (!merged) {
          if (!cancelled) {
            setError("Order not found")
            setLoading(false)
          }
          return
        }

        if (apiDisplay) persistStatusToLocal(merged)

        if (!cancelled) {
          setOrder(merged)
          setLoading(false)
        }

        try {
          const pendingRaw = localStorage.getItem("pending_loyalty_points")
          if (pendingRaw) {
            const pending = JSON.parse(pendingRaw) as {
              orderId?: string
              lineItems?: { menu_item_id: string; quantity: number }[]
              points?: number
              description?: string
              total_amount?: number
            }
            if (pending.orderId === orderId) {
              let points = 0
              if (pending.lineItems && pending.lineItems.length > 0) {
                const res = await fetch("/api/loyalty/compute-earn", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ items: pending.lineItems }),
                })
                const data = await res.json()
                points = typeof data.pointsEarned === "number" ? data.pointsEarned : 0
              }
              if (points <= 0 && typeof pending.points === "number") {
                points = pending.points
              }
              if (points <= 0 && pending.total_amount != null) {
                points = Math.floor(Number(pending.total_amount) || 0)
              }
              if (points > 0) {
                await awardPoints(points, `Earned ${points} points from your order`, orderId)
                if (!cancelled) setPointsEarned(points)
              }
              localStorage.removeItem("pending_loyalty_points")
              await refreshPoints()
            }
          } else {
            const orderData = merged
            const lineItems = (orderData.items || [])
              .filter((i) => i.menu_item_id && !i.is_loyalty_redemption)
              .map((i) => ({
                menu_item_id: i.menu_item_id!,
                quantity: i.quantity,
              }))
            let calculatedPoints = 0
            if (lineItems.length > 0) {
              const res = await fetch("/api/loyalty/compute-earn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: lineItems }),
              })
              const data = await res.json()
              calculatedPoints = typeof data.pointsEarned === "number" ? data.pointsEarned : 0
            }
            if (calculatedPoints <= 0) {
              calculatedPoints = Math.floor(orderData.total_amount || 0)
            }
            if (calculatedPoints > 0) {
              await awardPoints(calculatedPoints, `Earned from order #${orderId}`, orderId)
              if (!cancelled) setPointsEarned(calculatedPoints)
            }
          }
        } catch (pointsError) {
          console.error("Error awarding points:", pointsError)
        }
      } catch (err) {
        console.error("Error loading order:", err)
        if (!cancelled) {
          setError("Failed to load order")
          setLoading(false)
        }
      }
    }

    loadOrder()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  useEffect(() => {
    if (!orderId) return

    const tick = async () => {
      const fresh = await fetchOrderFromApi()
      if (!fresh) return
      setOrder((prev) => {
        if (!prev) return fresh
        persistStatusToLocal(fresh)
        return {
          ...prev,
          status: fresh.status,
          payment_status: fresh.payment_status,
          updated_at: fresh.updated_at,
          order_number: fresh.order_number ?? prev.order_number,
          total_amount: fresh.total_amount,
          tax_amount: fresh.tax_amount,
          subtotal: fresh.subtotal,
          items: fresh.items.length > 0 ? fresh.items : prev.items,
          pickup_time: fresh.pickup_time ?? prev.pickup_time,
          syncedFromServer: true,
        }
      })
    }

    const id = window.setInterval(tick, STATUS_POLL_MS)
    return () => window.clearInterval(id)
  }, [orderId, fetchOrderFromApi, persistStatusToLocal])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-6 max-w-md w-full text-center">
          <p className="text-destructive mb-4">{error || "Order not found"}</p>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </Card>
      </div>
    )
  }

  const status = normalizeOrderStatus(order.status)
  const workflowIndex = getWorkflowStepIndex(status)
  const isCancelled = status === "cancelled"
  const labelFromDb = ORDER_STATUS_LABELS[status] || ORDER_STATUS_LABELS.pending
  const bannerStep = isCancelled
    ? { label: cancelledMeta.label, icon: cancelledMeta.icon }
    : ORDER_WORKFLOW_STEPS[Math.max(0, workflowIndex)] || ORDER_WORKFLOW_STEPS[0]

  const BannerIcon = bannerStep.icon
  const pickupAt = order.pickup_time ? new Date(order.pickup_time) : null

  const paymentNorm = (order.payment_status || "").toLowerCase()
  const isPaid = paymentNorm === "paid" || paymentNorm === "succeeded"

  const bannerSubtitle = isCancelled
    ? "This order was cancelled. If you were charged, contact us for help."
    : status === "pending" && isPaid
      ? "Payment received. Waiting for the store to confirm your order."
      : status === "ready"
        ? "Your order is ready for pickup!"
        : status === "completed"
          ? "Thank you for your order!"
          : status === "delivered"
            ? "Your order has been delivered."
            : "We're working on your order"

  const orderRef =
    order.order_number || (order.id.length > 14 ? order.id.substring(0, 8) + "…" : order.id)

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-3 sm:mb-4 -ml-2 text-sm sm:text-base">
            ← Back to Home
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Order Status</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Order #{orderRef}</p>
          {order.updated_at ? (
            <p className="text-[10px] sm:text-xs text-muted-foreground/80 mt-0.5">
              Last updated {new Date(order.updated_at).toLocaleString()}
            </p>
          ) : null}
          {!order.syncedFromServer ? (
            <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-300/90 mt-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1">
              Live status could not be loaded. Showing saved details from this device — ensure{" "}
              <code className="text-[10px]">SUPABASE_SERVICE_ROLE_KEY</code> is set on the server for tracking.
            </p>
          ) : null}
          {!loyaltyLoading && !isLoyaltyActive ? (
            <p className="text-xs text-muted-foreground mt-2 rounded-md border border-border/60 bg-muted/20 px-2 py-1.5">
              Loyalty points are credited when you&apos;re signed in.{" "}
              <Link href="/login?redirect=/order-status" className="text-primary font-medium underline-offset-2 hover:underline">
                Sign in
              </Link>{" "}
              on your next order to earn points.
            </p>
          ) : null}
        </div>

        {/* Status Banner */}
        <Card
          className={`p-4 sm:p-6 mb-4 sm:mb-6 border ${
            isCancelled
              ? "bg-destructive/10 border-destructive/30"
              : "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1 truncate">{labelFromDb}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{bannerSubtitle}</p>
            </div>
            <div
              className={`p-2.5 sm:p-3 rounded-full flex-shrink-0 ${
                isCancelled ? "bg-destructive/20" : "bg-primary/20"
              }`}
            >
              <BannerIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${isCancelled ? "text-destructive" : "text-primary"}`} />
            </div>
          </div>
        </Card>

        {/* Loyalty Points Earned Banner */}
        {pointsEarned && pointsEarned > 0 && (
          <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-300 dark:border-amber-700 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-3 rounded-full flex-shrink-0 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-2">
                  🎉 Loyalty Points Earned!
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You earned <span className="font-bold text-lg">{pointsEarned}</span> loyalty{" "}
                  {pointsEarned === 1 ? "point" : "points"} with this order. They are added to your balance for Rewards.
                </p>
                <p className="text-xs text-amber-700/85 dark:text-amber-300/90 mt-1.5">
                  Open Rewards from the menu to redeem points for free items.
                </p>
              </div>
              <div className="flex flex-col items-center bg-white dark:bg-amber-950 rounded-lg px-4 py-2 shadow-sm">
                <Star className="h-8 w-8 fill-amber-500 text-amber-500 mb-1" />
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">+{pointsEarned}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Steps */}
        {!isCancelled ? (
          <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Order Progress</h3>
            <div className="space-y-3 sm:space-y-4">
              {ORDER_WORKFLOW_STEPS.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index <= workflowIndex
                const isCurrent = index === workflowIndex

                return (
                  <div key={step.id} className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-border text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm sm:text-base font-medium truncate ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && pickupAt && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Pickup by {pickupAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                    {isCompleted && <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />}
                  </div>
                )
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-destructive/25 bg-destructive/5">
            <div className="flex items-start gap-3">
              <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-foreground">Order cancelled</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This order will not be prepared. Status is set from the store system.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Order Items */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-start justify-between gap-2 py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    {item.quantity}x {item.name}
                  </p>
                  {renderCustomizationLines(item.customizations)}
                </div>
                <p className="text-sm sm:text-base font-medium text-foreground whitespace-nowrap">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">${order.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm sm:text-base font-semibold text-foreground">Total</span>
              <span className="text-lg sm:text-xl font-bold text-foreground">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {status === "ready" && (
            <Card className="p-3 sm:p-4 bg-success/10 border-success/20">
              <p className="text-xs sm:text-sm text-foreground font-medium text-center">
                Your order is ready! Head to the drive-through to pick it up.
              </p>
            </Card>
          )}

          <Link href="/menu">
            <Button className="w-full bg-brand hover:bg-brand-dark min-h-[48px] sm:min-h-[44px]" size="lg">
              Order Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OrderStatusContent />
    </Suspense>
  )
}
