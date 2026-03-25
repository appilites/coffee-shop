import type { CartItemData } from "@/lib/context/cart-context"

export function pointsEarnedForCartLine(item: CartItemData): number {
  const earn = item.menuItem.loyalty_points_earn ?? 0
  return Math.max(0, earn) * item.quantity
}

export function sumCartLoyaltyPointsEarn(items: CartItemData[]): number {
  return items.reduce((sum, item) => sum + pointsEarnedForCartLine(item), 0)
}
