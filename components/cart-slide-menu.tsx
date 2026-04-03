"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ImageIcon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { pointsEarnedForCartLine } from "@/lib/loyalty-utils"

interface CartSlideMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CartSlideMenu({ children, open: controlledOpen, onOpenChange }: CartSlideMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [pageFlags, setPageFlags] = useState({ cart: false, checkout: false })
  const router = useRouter()
  const pathname = usePathname()
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCart()

  // Check if we're on cart page - only on client side to avoid hydration mismatch
  useEffect(() => {
    setPageFlags({ cart: pathname === "/cart", checkout: pathname === "/checkout" })
  }, [pathname])

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen

  const subtotal = getTotal()
  const tax = subtotal * 0.0875 // 8.75% tax
  const total = subtotal + tax

  const handleCheckout = () => {
    setOpen(false)
    router.push("/checkout")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[90vw] md:w-[400px] lg:w-[450px] max-w-[450px] overflow-y-auto flex flex-col p-0" 
        style={{ backgroundColor: '#181511' }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="border-b border-border px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 shrink-0">
            <SheetTitle className="font-serif text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Your Cart</span>
              {getItemCount() > 0 && (
                <Badge className="gradient-copper-gold text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                  {getItemCount()}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-5 py-3 sm:py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center px-4">
                <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold text-foreground mb-1.5 sm:mb-2">
                  Your cart is empty
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 px-2">
                  Add some items to get started!
                </p>
                <Link href="/menu">
                  <Button className="gradient-copper-gold text-white hover:opacity-90 text-xs sm:text-sm h-8 sm:h-9 md:h-10 px-4 sm:px-6">
                    Browse Menu
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 pb-4">
                {items.map((item) => {
                  const linePoints = pointsEarnedForCartLine(item)
                  return (
                  <Card key={item.id} className="p-2.5 sm:p-3 md:p-4">
                    <div className="flex gap-2.5 sm:gap-3">
                      <div className="relative h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 overflow-hidden rounded-md border border-border/40 bg-muted">
                        {item.menuItem.image_url ? (
                          <Image
                            src={item.menuItem.image_url}
                            alt={item.menuItem.name}
                            fill
                            className="object-cover"
                            sizes="72px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6 sm:h-7 sm:w-7 opacity-50" aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
                          <h3 className="font-serif text-xs sm:text-sm md:text-base font-semibold text-foreground truncate min-w-0">
                            {item.menuItem.name}
                          </h3>
                          {linePoints > 0 && (
                            <span className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap shrink-0">
                              +{linePoints} points
                            </span>
                          )}
                        </div>

                        {item.selectedCustomizations.length > 0 && (
                          <div className="mt-1 sm:mt-1.5 space-y-0.5">
                            {item.selectedCustomizations.map((custom) => (
                              <p key={custom.optionId} className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                                <span className="font-medium">{custom.optionName}:</span>{" "}
                                {custom.choices.map((c) => c.name).join(", ")}
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 sm:mt-2.5 flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 bg-transparent shrink-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                            <span className="w-6 sm:w-8 text-center font-semibold text-xs sm:text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 bg-transparent shrink-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-semibold text-brand text-xs sm:text-sm md:text-base whitespace-nowrap">
                              ${item.totalPrice.toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-destructive hover:text-destructive shrink-0"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  )
                })}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-border px-3 sm:px-4 md:px-5 py-3 sm:py-4 space-y-2 sm:space-y-3 shrink-0 bg-[#181511]">
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8.75%)</span>
                  <span className="text-foreground font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-sm sm:text-base md:text-lg pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-brand">${total.toFixed(2)}</span>
                </div>
              </div>

              {!pageFlags.cart && !pageFlags.checkout && (
                <Button
                  className="w-full gradient-copper-gold text-white z-10 hover:opacity-90 h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base font-semibold"
                  onClick={handleCheckout}
                >
                  Checkout
                  <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
