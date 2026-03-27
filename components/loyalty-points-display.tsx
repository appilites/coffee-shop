"use client"

import { useRouter } from "next/navigation"
import { useLoyalty } from "@/lib/context/loyalty-context"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { loyaltyCopy } from "@/lib/loyalty-copy"

export function LoyaltyPointsDisplay() {
  const router = useRouter()
  const { pointsBalance, isLoading, isLoyaltyActive } = useLoyalty()

  if (isLoading) {
    return null
  }

  if (!isLoyaltyActive) {
    return (
      <Button
        variant="outline"
        size="sm"
        title="Sign in to earn and track loyalty points"
        onClick={() => router.push("/login?redirect=/rewards")}
        className="h-auto min-h-7 sm:min-h-8 py-0.5 px-2 sm:px-2.5 md:px-3 text-[10px] sm:text-xs"
      >
        Log in for Rewards
      </Button>
    )
  }

  const pointBalance = pointsBalance?.current_points ?? 0

  return (
    <Button
      variant="outline"
      size="sm"
      title={loyaltyCopy.balanceTitle}
      onClick={() => router.push("/rewards")}
      className="flex flex-col items-center justify-center gap-0 h-auto min-h-7 sm:min-h-8 py-0.5 px-2 sm:px-2.5 md:px-3 cursor-pointer"
    >
      <span className="flex items-center gap-1 sm:gap-1.5 leading-none">
        <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 fill-yellow-400 text-yellow-400 shrink-0" />
        <span className="font-semibold tabular-nums text-[10px] sm:text-xs md:text-sm">{pointBalance}</span>
        <span className="sm:hidden text-[9px] text-muted-foreground font-normal">points</span>
        <span className="hidden sm:inline text-[10px] md:text-xs text-muted-foreground font-normal">
          {loyaltyCopy.balanceHint}
        </span>
      </span>
      <span className="text-[9px] sm:text-[10px] text-muted-foreground font-normal leading-tight hidden sm:block">
        {loyaltyCopy.balanceSub}
      </span>
    </Button>
  )
}
