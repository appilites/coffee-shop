"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Mail, Phone, Clock, ShoppingBag, MapPin } from "lucide-react"
import Link from "next/link"
import { LoyaltyPointsEarnBadge } from "@/components/loyalty-points-earn-badge"
import { sumCartLoyaltyPointsEarn } from "@/lib/loyalty-utils"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal } = useCart()
  const [authMode, setAuthMode] = useState<"guest" | "login" | "signup">("guest")
  const [isLoading, setIsLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [guestData, setGuestData] = useState({ name: "", email: "", phone: "" })
  const [orderDetails, setOrderDetails] = useState({ pickupTime: "", specialInstructions: "" })

  const subtotal = getTotal()
  const tax = subtotal * 0.0875
  const total = subtotal + tax
  const loyaltyPointsThisOrder = sumCartLoyaltyPointsEarn(items)

  useEffect(() => {
    if (items.length === 0) {
      router.push("/menu")
    }
  }, [items, router])

  const handleGuestCheckout = async () => {
    if (!guestData.name || !guestData.email || !guestData.phone) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    const orderId = `order-${Date.now()}`
    const orderData = {
      id: orderId,
      items: items.map((item) => ({
        id: item.id,
        menu_item_id: item.menuItem.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.totalPrice,
        is_loyalty_redemption: Boolean(item.isLoyaltyRedemption),
        customizations: item.selectedCustomizations,
      })),
      order_type: "drive-through",
      customer_name: guestData.name,
      customer_email: guestData.email,
      customer_phone: guestData.phone,
      special_instructions: orderDetails.specialInstructions || null,
      pickup_time: orderDetails.pickupTime || null,
      status: "pending",
      payment_status: "pending",
      total_amount: total,
      subtotal: subtotal,
      tax_amount: tax,
      created_at: new Date().toISOString(),
    }

    try {
      // Store order in localStorage
      localStorage.setItem(`order-${orderId}`, JSON.stringify(orderData))

      // Store in orders list
      const orders = JSON.parse(localStorage.getItem("all-orders") || "[]")
      orders.push(orderData)
      localStorage.setItem("all-orders", JSON.stringify(orders))

      setTimeout(() => {
        router.push(`/payment?orderId=${orderId}`)
      }, 500)
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to create order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen bg-secondary/30 pb-24">
      <header className="sticky top-0 z-20 border-b border-border shadow-sm" style={{ backgroundColor: '#181511' }}>
        <div className="container mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex items-center justify-between h-10 sm:h-12 md:h-14 lg:h-16 py-1 sm:py-1.5 md:py-2">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 hover:bg-accent/10">
                  <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground">Checkout</h1>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground hidden sm:block">{items.length} items in cart</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden h-7 sm:h-8 md:h-9 lg:h-10 bg-brand text-white border-brand hover:bg-brand-dark hover:text-white font-semibold px-2 sm:px-2.5 md:px-3"
              onClick={() => setShowSummary(!showSummary)}
            >
              <ShoppingBag className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="text-xs sm:text-sm">${total.toFixed(2)}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-6">
        <div className="mx-auto max-w-6xl">
          {showSummary && (
            <Card className="mb-3 sm:mb-4 overflow-hidden border-brand/20 lg:hidden">
              <div className="bg-gradient-to-r from-brand/10 to-accent/10 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 flex items-center justify-between border-b border-border">
                <h3 className="font-serif text-base font-semibold text-foreground">Order Summary</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSummary(false)}
                  className="h-8 text-xs hover:bg-white/50"
                >
                  Close
                </Button>
              </div>

              <div className="p-3 sm:p-4">
                <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-2.5 md:space-y-3 max-h-[40vh] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-2 sm:gap-2.5 md:gap-3 pb-2 sm:pb-2.5 md:pb-3 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-foreground mb-1">
                          <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand/10 text-brand text-[10px] sm:text-xs font-bold mr-1.5 sm:mr-2">
                            {item.quantity}
                          </span>
                          {item.menuItem.name}
                        </p>
                        {item.selectedCustomizations.length > 0 && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 ml-5 sm:ml-7">
                            {item.selectedCustomizations
                              .map((c) => c.choices.map((ch) => ch.name).join(", "))
                              .join(" • ")}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-xs sm:text-sm whitespace-nowrap text-foreground">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                  <div className="space-y-2 sm:space-y-2.5 pt-3 border-t-2 border-dashed border-border">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground font-medium">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground font-medium">Tax (8.75%)</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 sm:pt-2.5 mt-2 sm:mt-2.5 border-t border-border">
                      <span className="text-sm sm:text-base font-bold text-foreground">Total</span>
                      <span className="text-base sm:text-lg font-bold text-brand">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-center pt-3">
                      <LoyaltyPointsEarnBadge points={loyaltyPointsThisOrder} size="sm" variant="full" context="order" />
                    </div>
                  </div>
              </div>
            </Card>
          )}

          <div className="grid gap-3 sm:gap-4 md:gap-6 lg:grid-cols-[1fr_420px]">
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              {/* Progress indicator */}
              <div className="hidden sm:flex items-center justify-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <span className="text-sm font-semibold text-brand">Details</span>
                </div>
                <div className="w-12 sm:w-16 h-0.5 bg-border"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <span className="text-sm text-muted-foreground">Payment</span>
                </div>
                <div className="w-12 sm:w-16 h-0.5 bg-border"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <span className="text-sm text-muted-foreground">Complete</span>
                </div>
              </div>

              <Card className="overflow-hidden border-border shadow-sm">
                <div className="bg-gradient-to-r from-brand/5 to-accent/5 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b border-border">
                  <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
                    Customer Information
                  </h2>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    Enter your details to complete the order
                  </p>
                </div>

                <div className="p-3 sm:p-4 md:p-6">
                  <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10 md:h-11 mb-4 sm:mb-5 md:mb-6 bg-muted/50">
                      <TabsTrigger
                        value="guest"
                        className="text-[10px] sm:text-xs md:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-brand"
                      >
                        Guest
                      </TabsTrigger>
                      <TabsTrigger
                        value="login"
                        className="text-[10px] sm:text-xs md:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-brand"
                      >
                        Login
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="text-[10px] sm:text-xs md:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-brand"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="guest" className="space-y-3 sm:space-y-4 md:space-y-5 mt-0">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="guest-name"
                          className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/70" />
                          <Input
                            id="guest-name"
                            placeholder="John Doe"
                            className="pl-9 sm:pl-11 h-10 sm:h-11 md:h-12 text-sm sm:text-base border-2 focus-visible:border-brand focus-visible:ring-brand/20"
                            value={guestData.name}
                            onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="guest-email"
                          className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/70" />
                          <Input
                            id="guest-email"
                            type="email"
                            placeholder="john@example.com"
                            className="pl-9 sm:pl-11 h-10 sm:h-11 md:h-12 text-sm sm:text-base border-2 focus-visible:border-brand focus-visible:ring-brand/20"
                            value={guestData.email}
                            onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="guest-phone"
                          className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1"
                        >
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/70" />
                          <Input
                            id="guest-phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            className="pl-9 sm:pl-11 h-10 sm:h-11 md:h-12 text-sm sm:text-base border-2 focus-visible:border-brand focus-visible:ring-brand/20"
                            value={guestData.phone}
                            onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="login" className="space-y-4 mt-0">
                      <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-xl border border-accent/20">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-lg">ℹ️</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">Demo Mode</p>
                          <p className="text-sm text-muted-foreground">
                            Login functionality is disabled in the prototype. Please use Guest checkout to continue.
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4 mt-0">
                      <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-xl border border-accent/20">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-lg">ℹ️</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">Demo Mode</p>
                          <p className="text-sm text-muted-foreground">
                            Sign up functionality is disabled in the prototype. Please use Guest checkout to continue.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>

              <Card className="overflow-hidden border-border shadow-sm">
                <div className="bg-gradient-to-r from-brand/5 to-accent/5 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b border-border">
                  <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
                    Order Details
                  </h2>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">Customize your pickup preferences</p>
                </div>

                <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="pickup-time" className="text-xs sm:text-sm font-semibold text-foreground">
                      Preferred Pickup Time <span className="text-muted-foreground text-[10px] sm:text-xs">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/70 pointer-events-none z-10" />
                      <Input
                        id="pickup-time"
                        type="datetime-local"
                        className="pl-9 sm:pl-11 h-10 sm:h-11 md:h-12 text-sm sm:text-base border-2 focus-visible:border-brand focus-visible:ring-brand/20"
                        value={orderDetails.pickupTime}
                        onChange={(e) => setOrderDetails({ ...orderDetails, pickupTime: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">We'll have your order ready at this time</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="special-instructions" className="text-xs sm:text-sm font-semibold text-foreground">
                      Special Instructions <span className="text-muted-foreground text-[10px] sm:text-xs">(Optional)</span>
                    </Label>
                    <Textarea
                      id="special-instructions"
                      placeholder="Any special requests? (e.g., extra hot, no ice, allergies...)"
                      rows={4}
                      className="resize-none min-h-[80px] sm:min-h-[100px] text-sm sm:text-base border-2 focus-visible:border-brand focus-visible:ring-brand/20"
                      value={orderDetails.specialInstructions}
                      onChange={(e) => setOrderDetails({ ...orderDetails, specialInstructions: e.target.value })}
                    />
                  </div>
                </div>
              </Card>

              {authMode === "guest" && (
                <Button
                  onClick={handleGuestCheckout}
                  disabled={isLoading}
                  className="w-full bg-brand text-white hover:bg-brand-dark h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Creating Order...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue to Payment
                      <ArrowLeft className="h-5 w-5 rotate-180" />
                    </span>
                  )}
                </Button>
              )}
            </div>

            <div className="hidden lg:block">
              <Card className="sticky top-20 overflow-hidden border-border shadow-lg">
                <div className="bg-gradient-to-r from-brand/10 to-accent/10 px-4 md:px-6 py-3 md:py-4 border-b border-border">
                  <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
                    Order Summary
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{items.length} items</p>
                </div>

                <div className="p-4 md:p-6">
                  <div className="mb-3 md:mb-4 space-y-2 sm:space-y-2.5 md:space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-2 md:gap-3 pb-2 md:pb-3 border-b border-border last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-foreground mb-1">
                            <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand/10 text-brand text-[10px] sm:text-xs font-bold mr-1.5 sm:mr-2">
                              {item.quantity}
                            </span>
                            {item.menuItem.name}
                          </p>
                          {item.selectedCustomizations.length > 0 && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 ml-5 sm:ml-7">
                              {item.selectedCustomizations
                                .map((c) => c.choices.map((ch) => ch.name).join(", "))
                                .join(" • ")}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-sm whitespace-nowrap text-foreground">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t-2 border-dashed border-border">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground font-medium">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground font-medium">Tax (8.75%)</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-border">
                      <span className="text-base sm:text-lg font-bold text-foreground">Total</span>
                      <span className="text-lg sm:text-xl font-bold text-brand">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-center pt-4">
                      <LoyaltyPointsEarnBadge points={loyaltyPointsThisOrder} size="md" variant="full" context="order" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
