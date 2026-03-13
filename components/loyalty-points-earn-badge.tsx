"use client"

import { Star, Sparkles } from "lucide-react"

interface LoyaltyPointsEarnBadgeProps {
  amount: number
  size?: "sm" | "md" | "lg"
  variant?: "compact" | "full"
}

export function LoyaltyPointsEarnBadge({ amount, size = "md", variant = "full" }: LoyaltyPointsEarnBadgeProps) {
  const pointsToEarn = Math.floor(amount)
  
  if (pointsToEarn <= 0) return null

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

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 ${sizeClasses[size]}`}>
        <Star className={`${iconSizes[size]} fill-amber-500 text-amber-500`} />
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          +{pointsToEarn}
        </span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 ${sizeClasses[size]}`}>
      <Sparkles className={`${iconSizes[size]} text-amber-500`} />
      <span className="font-semibold text-amber-700 dark:text-amber-300">
        Earn {pointsToEarn} {pointsToEarn === 1 ? "point" : "points"}
      </span>
    </div>
  )
}
