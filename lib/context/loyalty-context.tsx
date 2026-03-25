"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type {
  LoyaltyProgramReward,
  LoyaltyPointsBalance,
  LoyaltyPointsTransaction,
  UserReward,
  MenuItem,
} from "@/lib/types"
import { useCart } from "@/lib/context/cart-context"

interface LoyaltyContextType {
  pointsBalance: LoyaltyPointsBalance | null
  /** Redeemable products from menu (loyalty_points_cost > 0) */
  programRewards: LoyaltyProgramReward[]
  /** Products that earn points on purchase (for display) */
  productsEarningPoints: LoyaltyProgramReward[]
  columnsExist: boolean | null
  setupSql: string | null
  userRewards: UserReward[]
  transactions: LoyaltyPointsTransaction[]
  isLoading: boolean
  rewardsLoading: boolean
  refreshPoints: () => Promise<void>
  refreshRewards: () => Promise<void>
  refreshUserRewards: () => Promise<void>
  refreshTransactions: () => Promise<void>
  awardPoints: (points: number, description: string, orderId?: string) => Promise<void>
  redeemReward: (menuItemId: string) => Promise<void>
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined)

const BALANCE_KEY = "loyalty_points_balance"
const USER_REWARDS_KEY = "loyalty_user_rewards"
const TX_KEY = "loyalty_transactions"

function menuItemFromReward(r: LoyaltyProgramReward): MenuItem {
  const now = new Date().toISOString()
  return {
    id: r.id,
    category_id: r.category?.id ?? null,
    name: r.name,
    description: r.description,
    base_price: 0,
    image_url: r.image_url,
    is_available: true,
    is_featured: false,
    prep_time_minutes: 5,
    created_at: now,
    updated_at: now,
    loyalty_points_earn: 0,
    loyalty_points_cost: r.loyalty_points_cost,
  }
}

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const { addItem } = useCart()
  const [pointsBalance, setPointsBalance] = useState<LoyaltyPointsBalance | null>(null)
  const [programRewards, setProgramRewards] = useState<LoyaltyProgramReward[]>([])
  const [productsEarningPoints, setProductsEarningPoints] = useState<LoyaltyProgramReward[]>([])
  const [columnsExist, setColumnsExist] = useState<boolean | null>(null)
  const [setupSql, setSetupSql] = useState<string | null>(null)
  const [userRewards, setUserRewards] = useState<UserReward[]>([])
  const [transactions, setTransactions] = useState<LoyaltyPointsTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rewardsLoading, setRewardsLoading] = useState(true)

  const refreshRewards = useCallback(async () => {
    setRewardsLoading(true)
    try {
      const res = await fetch("/api/loyalty", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        setProgramRewards([])
        setProductsEarningPoints([])
        setColumnsExist(false)
        return
      }
      setProgramRewards(Array.isArray(data.rewards) ? data.rewards : [])
      setProductsEarningPoints(Array.isArray(data.productsEarningPoints) ? data.productsEarningPoints : [])
      setColumnsExist(data.columnsExist !== false)
      setSetupSql(typeof data.sql === "string" ? data.sql : null)
    } catch (e) {
      console.error("refreshRewards:", e)
      setProgramRewards([])
      setProductsEarningPoints([])
    } finally {
      setRewardsLoading(false)
    }
  }, [])

  useEffect(() => {
    const load = () => {
      try {
        const storedBalance = localStorage.getItem(BALANCE_KEY)
        const storedRewards = localStorage.getItem(USER_REWARDS_KEY)
        const storedTransactions = localStorage.getItem(TX_KEY)

        if (storedBalance) {
          setPointsBalance(JSON.parse(storedBalance))
        } else {
          const initial: LoyaltyPointsBalance = {
            current_points: 0,
            total_points_earned: 0,
            total_points_redeemed: 0,
          }
          setPointsBalance(initial)
          localStorage.setItem(BALANCE_KEY, JSON.stringify(initial))
        }

        if (storedRewards) setUserRewards(JSON.parse(storedRewards))
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions))
      } catch (error) {
        console.error("Error loading loyalty data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
    void refreshRewards()
  }, [refreshRewards])

  const refreshPoints = async () => {
    try {
      const stored = localStorage.getItem(BALANCE_KEY)
      if (stored) setPointsBalance(JSON.parse(stored))
    } catch (e) {
      console.error("refreshPoints:", e)
    }
  }

  const refreshUserRewards = async () => {
    try {
      const stored = localStorage.getItem(USER_REWARDS_KEY)
      if (stored) setUserRewards(JSON.parse(stored))
    } catch (e) {
      console.error("refreshUserRewards:", e)
    }
  }

  const refreshTransactions = async () => {
    try {
      const stored = localStorage.getItem(TX_KEY)
      if (stored) setTransactions(JSON.parse(stored))
    } catch (e) {
      console.error("refreshTransactions:", e)
    }
  }

  const awardPoints = async (points: number, description: string, orderId?: string) => {
    if (points <= 0) return
    try {
      const currentBalance = pointsBalance || {
        current_points: 0,
        total_points_earned: 0,
        total_points_redeemed: 0,
      }

      const newBalance: LoyaltyPointsBalance = {
        current_points: currentBalance.current_points + points,
        total_points_earned: currentBalance.total_points_earned + points,
        total_points_redeemed: currentBalance.total_points_redeemed,
      }

      setPointsBalance(newBalance)
      localStorage.setItem(BALANCE_KEY, JSON.stringify(newBalance))

      const newTransaction: LoyaltyPointsTransaction = {
        id: `txn-${Date.now()}`,
        user_id: "guest",
        order_id: orderId || null,
        points,
        transaction_type: "earned",
        description,
        reward_id: null,
        created_at: new Date().toISOString(),
      }

      setTransactions((prev) => {
        const next = [newTransaction, ...prev]
        localStorage.setItem(TX_KEY, JSON.stringify(next))
        return next
      })
    } catch (error) {
      console.error("Error awarding points:", error)
    }
  }

  const redeemReward = async (menuItemId: string) => {
    const reward = programRewards.find((r) => r.id === menuItemId)
    if (!reward) throw new Error("Reward not found")

    const cost = reward.loyalty_points_cost
    if (cost <= 0) throw new Error("This product is not a reward")

    const currentBalance = pointsBalance || {
      current_points: 0,
      total_points_earned: 0,
      total_points_redeemed: 0,
    }

    if (currentBalance.current_points < cost) {
      throw new Error("Insufficient points")
    }

    const newBalance: LoyaltyPointsBalance = {
      current_points: currentBalance.current_points - cost,
      total_points_earned: currentBalance.total_points_earned,
      total_points_redeemed: currentBalance.total_points_redeemed + cost,
    }

    setPointsBalance(newBalance)
    localStorage.setItem(BALANCE_KEY, JSON.stringify(newBalance))

    const newTransaction: LoyaltyPointsTransaction = {
      id: `txn-${Date.now()}`,
      user_id: "guest",
      order_id: null,
      points: -cost,
      transaction_type: "redeemed",
      description: `Redeemed ${reward.name} for ${cost} points`,
      reward_id: menuItemId,
      created_at: new Date().toISOString(),
    }

    setTransactions((prev) => {
      const next = [newTransaction, ...prev]
      localStorage.setItem(TX_KEY, JSON.stringify(next))
      return next
    })

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 3)

    const newUserReward: UserReward = {
      id: `user-reward-${Date.now()}`,
      user_id: "guest",
      reward_id: menuItemId,
      menu_item_id: menuItemId,
      product_name: reward.name,
      order_id: null,
      points_spent: cost,
      status: "active",
      expires_at: expiresAt.toISOString(),
      used_at: null,
      created_at: new Date().toISOString(),
    }

    setUserRewards((prev) => {
      const next = [newUserReward, ...prev]
      localStorage.setItem(USER_REWARDS_KEY, JSON.stringify(next))
      return next
    })

    const lineId = `loyalty-${menuItemId}-${Date.now()}`
    addItem({
      id: lineId,
      menuItem: menuItemFromReward(reward),
      quantity: 1,
      selectedCustomizations: [],
      totalPrice: 0,
      isLoyaltyRedemption: true,
    })
  }

  return (
    <LoyaltyContext.Provider
      value={{
        pointsBalance,
        programRewards,
        productsEarningPoints,
        columnsExist,
        setupSql,
        userRewards,
        transactions,
        isLoading,
        rewardsLoading,
        refreshPoints,
        refreshRewards,
        refreshUserRewards,
        refreshTransactions,
        awardPoints,
        redeemReward,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  )
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext)
  if (context === undefined) {
    throw new Error("useLoyalty must be used within a LoyaltyProvider")
  }
  return context
}
