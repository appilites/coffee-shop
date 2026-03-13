"use client"

import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoyaltyPointsEarnBadge } from "@/components/loyalty-points-earn-badge"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()

  const subtotal = getTotal()
  const tax = subtotal * 0.0875 // 8.75% tax
  const total = subtotal + tax

  const handlePayNow = () => {
    console.log("[v0] Pay Now clicked, navigating to checkout")
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-16">
        <header className="border-b border-border" style={{ backgroundColor: '#181511' }}>
          <div className="container mx-auto flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
            <Link href="/menu">
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 shrink-0">
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
              </Button>
            </Link>
            <h1 className="font-serif text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground truncate">Your Cart</h1>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-2 sm:px-3 md:px-4">
          <div className="text-center max-w-md w-full">
            <ShoppingBag className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-muted-foreground/50" />
            <h2 className="mb-1.5 sm:mb-2 font-serif text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Your cart is empty</h2>
            <p className="mb-4 sm:mb-5 md:mb-6 text-xs sm:text-sm md:text-base text-muted-foreground">Add some delicious drinks to get started</p>
            <Link href="/menu" className="inline-block">
              <Button className="bg-brand text-white hover:bg-brand-dark text-sm sm:text-base h-10 sm:h-11 px-6 sm:px-8">
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <header className="shrink-0 border-b border-border" style={{ backgroundColor: '#181511' }}>
        <div className="container mx-auto flex items-center justify-between px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 min-w-0 flex-1">
            <Link href="/menu">
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 shrink-0">
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
              </Button>
            </Link>
            <h1 className="font-serif text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground truncate">Your Cart</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-error shrink-0 text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 px-1.5 sm:px-2 md:px-3">
            Clear All
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-6">
          <div className="mx-auto max-w-2xl space-y-2.5 sm:space-y-3 md:space-y-4">
            {/* Cart Items */}
            {items.map((item) => (
              <Card key={item.id} className="p-2.5 sm:p-3 md:p-4">
                <div className="flex gap-2 sm:gap-2.5 md:gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm sm:text-base md:text-lg font-semibold text-foreground truncate">
                      {item.menuItem.name}
                    </h3>

                    {item.selectedCustomizations.length > 0 && (
                      <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
                        {item.selectedCustomizations.map((custom) => (
                          <p key={custom.optionId} className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                            <span className="font-medium">{custom.optionName}:</span>{" "}
                            {custom.choices.map((c) => c.name).join(", ")}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 sm:mt-2.5 md:mt-3 flex items-center justify-between gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold text-brand text-xs sm:text-sm md:text-base">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 text-error h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {/* Order Summary Card - Now in page content */}
            <Card className="p-4 sm:p-5 md:p-6 mt-4 sm:mt-5 md:mt-6 border-2 border-border">
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-5">
                Order Summary
              </h2>
              
              <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Tax (8.75%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 sm:pt-3.5 md:pt-4">
                  <span className="font-bold text-base sm:text-lg md:text-xl">Total</span>
                  <span className="font-bold text-base sm:text-lg md:text-xl text-brand">${total.toFixed(2)}</span>
                </div>
                
                {/* Loyalty Points Earning Preview */}
                <div className="flex justify-center pt-2 sm:pt-3">
                  <LoyaltyPointsEarnBadge amount={total} size="md" variant="full" />
                </div>

                <Button
                  onClick={handlePayNow}
                  className="w-full bg-brand text-white hover:bg-brand-dark text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 font-semibold h-12 sm:h-14 md:h-16 mt-4"
                  size="lg"
                >
                  Pay Now - ${total.toFixed(2)}
                </Button>

                <p className="text-center text-xs sm:text-sm text-muted-foreground">
                  Demo mode - No actual payment required
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
