"use client"

import { useRouter } from "next/navigation"
import { useLoyalty } from "@/lib/context/loyalty-context"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LoyaltyPointsDisplay() {
  const router = useRouter()
  const { pointsBalance, isLoading } = useLoyalty()

  if (isLoading) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push("/rewards")}
      className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 px-2 sm:px-3 cursor-pointer"
    >
      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
      <span className="font-semibold">{pointsBalance?.current_points || 0}</span>
      <span className="hidden sm:inline">Points</span>
    </Button>
  )
}
