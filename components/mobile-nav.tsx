"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, ShoppingCart, MapPin, Gift } from "lucide-react"
import { useCart } from "@/lib/context/cart-context"
import { CartSlideMenu } from "@/components/cart-slide-menu"

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCart()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: MapPin, label: "Menu", href: "/menu" },
    { icon: Gift, label: "Rewards", href: "/rewards" },
    { icon: ShoppingCart, label: "Cart", href: "/cart", badge: itemCount },
  ]

  // Don't show nav on certain pages
  if (pathname?.includes("/admin") || pathname?.includes("/payment") || pathname?.includes("/order-status")) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border z-50" style={{ backgroundColor: '#181511' }}>
      <nav className="flex items-center justify-around h-12 sm:h-14 md:h-16 max-w-screen-xl mx-auto px-2 sm:px-3 md:px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isCart = item.href === "/cart"

          if (isCart) {
            return (
              <CartSlideMenu key={item.href}>
                <button
                  className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 h-full relative transition-all rounded-md sm:rounded-lg px-1 sm:px-2 py-1 sm:py-1.5 border-0 outline-none ${
                    isActive
                      ? "text-brand font-semibold !bg-transparent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  style={isActive ? { backgroundColor: 'transparent' } : undefined}
                >
                  <div className="relative">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 gradient-copper-gold text-white text-[9px] sm:text-[10px] md:text-xs rounded-full h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 flex items-center justify-center font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium leading-tight">{item.label}</span>
                </button>
              </CartSlideMenu>
            )
          }

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 h-full relative transition-all rounded-md sm:rounded-lg px-1 sm:px-2 py-1 sm:py-1.5 border-0 outline-none ${
                isActive
                  ? "text-brand font-semibold !bg-transparent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              style={isActive ? { backgroundColor: 'transparent' } : undefined}
            >
              <div className="relative">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 gradient-copper-gold text-white text-[9px] sm:text-[10px] md:text-xs rounded-full h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 flex items-center justify-center font-semibold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-medium leading-tight">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
