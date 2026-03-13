"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, CreditCard, Lock, AlertCircle } from "lucide-react"

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart, getTotal } = useCart()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const orderId = searchParams.get("orderId")
  const totalAmount = getTotal()

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })

  useEffect(() => {
    if (!orderId) {
      router.push("/checkout")
    }
  }, [orderId, router])

  const handlePayment = async () => {
    if (!orderId) return

    setProcessing(true)
    setError("")

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const orderKey = `order-${orderId}`
      const orderData = JSON.parse(localStorage.getItem(orderKey) || "{}")

      if (!orderData.id) {
        throw new Error("Order not found")
      }

      orderData.payment_status = "paid"
      orderData.status = "confirmed"
      orderData.payment_intent_id = `demo_pi_${Date.now()}`

      // Calculate estimated ready time (15 minutes from now)
      const readyTime = new Date(Date.now() + 15 * 60 * 1000)
      orderData.estimated_ready_time = readyTime.toISOString()

      localStorage.setItem(orderKey, JSON.stringify(orderData))

      // Update in orders list
      const orders = JSON.parse(localStorage.getItem("all-orders") || "[]")
      const orderIndex = orders.findIndex((o: any) => o.id === orderId)
      if (orderIndex !== -1) {
        orders[orderIndex] = orderData
        localStorage.setItem("all-orders", JSON.stringify(orders))
      }

      // Award loyalty points
      try {
        const { useLoyalty } = await import("@/lib/context/loyalty-context")
        // Note: We can't use hooks here, so we'll award points via localStorage directly
        // Points will be awarded when the order status page loads
        const pointsEarned = Math.floor(orderData.total_amount || 0)
        if (pointsEarned > 0) {
          // Store pending points to be awarded
          localStorage.setItem("pending_loyalty_points", JSON.stringify({
            points: pointsEarned,
            description: `Earned ${pointsEarned} points from order`,
            orderId: orderId,
          }))
        }
      } catch (pointsError) {
        console.error("Error preparing loyalty points:", pointsError)
        // Don't fail payment if points awarding fails
      }

      clearCart()
      router.push(`/order-status?orderId=${orderId}`)
    } catch (err) {
      console.error("Payment error:", err)
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const isFormValid =
    cardDetails.number.replace(/\s/g, "").length === 16 &&
    cardDetails.expiry.length === 5 &&
    cardDetails.cvc.length === 3 &&
    cardDetails.name.length > 0

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 pb-24">
      <div className="mx-auto max-w-md">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Payment</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Complete your order</p>
        </div>

        <Card className="p-3 sm:p-4 mb-3 sm:mb-4 bg-accent/20 border-accent">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-foreground">Demo Mode Active</p>
              <p className="text-xs text-muted-foreground mt-1">
                This is a demonstration payment screen. No actual payment will be processed. Use any valid card format
                to continue.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm text-muted-foreground">Order Total</span>
            <span className="text-xl sm:text-2xl font-bold text-foreground">${totalAmount.toFixed(2)}</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Card Details</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground block mb-2">Card Number</label>
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) =>
                  setCardDetails((prev) => ({
                    ...prev,
                    number: formatCardNumber(e.target.value),
                  }))
                }
                maxLength={19}
                className="font-mono h-11 sm:h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground block mb-2">Expiry Date</label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      expiry: formatExpiry(e.target.value),
                    }))
                  }
                  maxLength={5}
                  className="font-mono h-11 sm:h-10"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground block mb-2">CVC</label>
                <Input
                  type="text"
                  placeholder="123"
                  value={cardDetails.cvc}
                  onChange={(e) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      cvc: e.target.value.replace(/\D/g, "").substring(0, 3),
                    }))
                  }
                  maxLength={3}
                  className="font-mono h-11 sm:h-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground block mb-2">Cardholder Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) =>
                  setCardDetails((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="h-11 sm:h-10"
              />
            </div>
          </div>

          {error && (
            <div className="mt-3 sm:mt-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-xs sm:text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3 sm:mb-4">
            <Lock className="h-3 w-3" />
            <span>Your payment information is secure</span>
          </div>

          <Button
            onClick={handlePayment}
            disabled={!isFormValid || processing}
            className="w-full bg-brand hover:bg-brand-dark min-h-[48px] sm:min-h-[44px]"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>Complete Payment - ${totalAmount.toFixed(2)}</>
            )}
          </Button>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-3 sm:mt-4 px-2">
          Test card: 4242 4242 4242 4242 | Any future expiry | Any 3-digit CVC
        </p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
