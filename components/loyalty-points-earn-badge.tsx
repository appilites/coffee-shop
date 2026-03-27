"use client"

import { Star, Sparkles } from "lucide-react"
import { loyaltyCopy } from "@/lib/loyalty-copy"

interface LoyaltyPointsEarnBadgeProps {
  /** Points from product loyalty_points_earn (per line / total as you pass) */
  points?: number
  /**
   * @deprecated Prefer `points` from menu_items.loyalty_points_earn. Falls back to floor(amount) when `points` omitted.
   */
  amount?: number
  size?: "sm" | "md" | "lg"
  variant?: "compact" | "full"
  /**
   * Where this badge appears — picks default subtext.
   * `order` = cart/checkout (credit after payment). `product` = menu item / dialog.
   */
  context?: "order" | "product"
  /** Override default subtext; pass "" to hide */
  subtext?: string
}

export function LoyaltyPointsEarnBadge({
  points,
  amount,
  size = "md",
  variant = "full",
  context = "order",
  subtext,
}: LoyaltyPointsEarnBadgeProps) {
  const hasExplicitPoints = points != null && !Number.isNaN(Number(points))
  const resolved = hasExplicitPoints
    ? Math.max(0, Math.floor(Number(points)))
    : Math.floor(amount ?? 0)

  if (resolved <= 0) return null

  const defaultSub =
    context === "product" ? loyaltyCopy.withPurchase : loyaltyCopy.afterCheckout
  const showSub = subtext !== ""
  const line2 = subtext !== undefined ? subtext : defaultSub

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const subtextClass =
    "block text-[10px] sm:text-xs font-normal text-amber-800/80 dark:text-amber-200/80 leading-snug mt-0.5 max-w-[220px] sm:max-w-none"

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex flex-col items-start gap-0.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/35 ${sizeClasses[size]}`}
      >
        <div className="inline-flex items-center gap-1.5">
          <Star className={`${iconSizes[size]} fill-amber-500 text-amber-500 shrink-0`} />
          <span className="font-semibold text-amber-700 dark:text-amber-300">
            +{resolved} loyalty {resolved === 1 ? "point" : "points"}
          </span>
        </div>
        {showSub && line2 ? <span className={subtextClass}>{line2}</span> : null}
      </div>
    )
  }

  return (
    <div
      className={`inline-flex flex-col items-start gap-0.5 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 ${sizeClasses[size]}`}
    >
      <div className="inline-flex items-center gap-2">
        <Sparkles className={`${iconSizes[size]} text-amber-500 shrink-0`} />
        <span className="font-semibold text-amber-800 dark:text-amber-200">
          Earn {resolved} loyalty {resolved === 1 ? "point" : "points"}
        </span>
      </div>
      {showSub && line2 ? <span className={subtextClass}>{line2}</span> : null}
    </div>
  )
}
