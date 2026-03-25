"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle2, Clock, Package, Car, Star, Sparkles } from "lucide-react"
import { useLoyalty } from "@/lib/context/loyalty-context"
import Link from "next/link"

const orderSteps = [
  { id: "pending", label: "Order Placed", icon: Clock },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "preparing", label: "Preparing", icon: Package },
  { id: "ready", label: "Ready for Pickup", icon: Car },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
]

function OrderStatusContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const { awardPoints, refreshPoints } = useLoyalty()

  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pointsEarned, setPointsEarned] = useState<number | null>(null)

  useEffect(() => {
    if (!orderId) {
      router.push("/")
      return
    }

    // Load order from localStorage
    const loadOrder = async () => {
      try {
        const orderKey = `order-${orderId}`
        const orderData = JSON.parse(localStorage.getItem(orderKey) || "{}")

        if (!orderData.id) {
          setError("Order not found")
          setLoading(false)
          return
        }

        setOrder(orderData)
        setLoading(false)

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
                setPointsEarned(points)
              }
              localStorage.removeItem("pending_loyalty_points")
              await refreshPoints()
            }
          } else {
            const lineItems = (orderData.items || [])
              .filter((i: { menu_item_id?: string; is_loyalty_redemption?: boolean }) => i.menu_item_id && !i.is_loyalty_redemption)
              .map((i: { menu_item_id: string; quantity: number }) => ({
                menu_item_id: i.menu_item_id,
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
              setPointsEarned(calculatedPoints)
            }
          }
        } catch (pointsError) {
          console.error("Error awarding points:", pointsError)
        }
      } catch (err) {
        console.error("Error loading order:", err)
        setError("Failed to load order")
        setLoading(false)
      }
    }

    loadOrder()

    const statusProgression = ["confirmed", "preparing", "ready"]
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < statusProgression.length) {
        const orderKey = `order-${orderId}`
        const orderData = JSON.parse(localStorage.getItem(orderKey) || "{}")

        if (orderData.id && orderData.status !== "ready") {
          orderData.status = statusProgression[currentIndex]
          localStorage.setItem(orderKey, JSON.stringify(orderData))
          setOrder({ ...orderData })
          currentIndex++
        }
      } else {
        clearInterval(interval)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]) // Only depend on orderId to avoid infinite loops

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

  const currentStepIndex = orderSteps.findIndex((step) => step.id === order.status)
  const estimatedTime = order.estimated_ready_time ? new Date(order.estimated_ready_time) : null

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-3 sm:mb-4 -ml-2 text-sm sm:text-base">
            ← Back to Home
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Order Status</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Order #{order.id.substring(6, 14)}</p>
        </div>

        {/* Status Banner */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1 truncate">
                {orderSteps[currentStepIndex]?.label || "Processing"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {order.status === "ready"
                  ? "Your order is ready for pickup!"
                  : order.status === "completed"
                    ? "Thank you for your order!"
                    : "We're working on your order"}
              </p>
            </div>
            {orderSteps[currentStepIndex] && (
              <div className="bg-primary/20 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                {(() => {
                  const Icon = orderSteps[currentStepIndex].icon
                  return <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                })()}
              </div>
            )}
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
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Order Progress</h3>
          <div className="space-y-3 sm:space-y-4">
            {orderSteps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

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
                    {isCurrent && estimatedTime && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Ready by {estimatedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  {isCompleted && <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />}
                </div>
              )
            })}
          </div>
        </Card>


        {/* Order Items */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex items-start justify-between gap-2 py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    {item.quantity}x {item.name}
                  </p>
                  {item.customizations && item.customizations.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {item.customizations.map((c: any, i: number) => (
                        <p key={i} className="line-clamp-2">
                          {c.optionName}: {c.choices.map((ch: any) => ch.name).join(", ")}
                        </p>
                      ))}
                    </div>
                  )}
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
          {order.status === "ready" && (
            <Card className="p-3 sm:p-4 bg-success/10 border-success/20">
              <p className="text-xs sm:text-sm text-foreground font-medium text-center">
                Your order is ready! Head to the drive-through to pick it up.
              </p>
            </Card>
          )}

          <Link href="/menu">
            <Button
              className="w-full bg-brand hover:bg-brand-dark min-h-[48px] sm:min-h-[44px]"
              size="lg"
            >
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
