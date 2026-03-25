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
import { useAuth } from "@/lib/context/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"

interface LoyaltyContextType {
  pointsBalance: LoyaltyPointsBalance | null
  /** Logged-in users only; null when guest */
  isLoyaltyActive: boolean
  programRewards: LoyaltyProgramReward[]
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

function userRewardsKey(userId: string) {
  return `loyalty_user_rewards_${userId}`
}

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
  const { user, loading: authLoading } = useAuth()
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

  const refreshPoints = useCallback(async () => {
    if (!user) {
      setPointsBalance(null)
      return
    }
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("customer_loyalty_points")
        .select("total_points, total_points_earned, total_points_redeemed")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("refreshPoints:", error.message)
        return
      }
      if (!data) {
        setPointsBalance({
          current_points: 0,
          total_points_earned: 0,
          total_points_redeemed: 0,
        })
        return
      }
      setPointsBalance({
        current_points: data.total_points ?? 0,
        total_points_earned: data.total_points_earned ?? 0,
        total_points_redeemed: data.total_points_redeemed ?? 0,
      })
    } catch (e) {
      console.error("refreshPoints:", e)
    }
  }, [user])

  const refreshTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([])
      return
    }
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("user_loyalty_transactions")
        .select("id, user_id, points, transaction_type, description, order_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) {
        console.error("refreshTransactions:", error.message)
        return
      }
      const rows = (data || []).map((r: Record<string, unknown>) => ({
        id: String(r.id),
        user_id: String(r.user_id),
        order_id: r.order_id ? String(r.order_id) : null,
        points: Number(r.points),
        transaction_type: r.transaction_type as LoyaltyPointsTransaction["transaction_type"],
        description: r.description ? String(r.description) : null,
        reward_id: null,
        created_at: String(r.created_at),
      }))
      setTransactions(rows)
    } catch (e) {
      console.error("refreshTransactions:", e)
    }
  }, [user])

  const refreshUserRewards = useCallback(async () => {
    if (!user) {
      setUserRewards([])
      return
    }
    try {
      const raw = localStorage.getItem(userRewardsKey(user.id))
      setUserRewards(raw ? JSON.parse(raw) : [])
    } catch {
      setUserRewards([])
    }
  }, [user])

  useEffect(() => {
    void refreshRewards()
  }, [refreshRewards])

  useEffect(() => {
    if (authLoading) return

    const run = async () => {
      if (!user) {
        setPointsBalance(null)
        setTransactions([])
        setUserRewards([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      await Promise.all([refreshPoints(), refreshTransactions(), refreshUserRewards()])
      setIsLoading(false)
    }
    void run()
  }, [user, authLoading, refreshPoints, refreshTransactions, refreshUserRewards])

  const awardPoints = async (points: number, description: string, orderId?: string) => {
    if (points <= 0) return
    if (!user) {
      console.info("Loyalty: skipped award — user not logged in")
      return
    }
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.rpc("apply_loyalty_delta", {
        p_delta: points,
        p_description: description,
        p_order_id: orderId ?? null,
      })
      if (error) {
        console.error("Loyalty award error:", error.message)
        return
      }
      await Promise.all([refreshPoints(), refreshTransactions()])
    } catch (error) {
      console.error("Error awarding points:", error)
    }
  }

  const redeemReward = async (menuItemId: string) => {
    if (!user) {
      throw new Error("Please log in to redeem rewards.")
    }
    const reward = programRewards.find((r) => r.id === menuItemId)
    if (!reward) throw new Error("Reward not found")

    const cost = reward.loyalty_points_cost
    if (cost <= 0) throw new Error("This product is not a reward")

    const current = pointsBalance?.current_points ?? 0
    if (current < cost) {
      throw new Error("Insufficient points")
    }

    const supabase = createBrowserClient()
    const { error } = await supabase.rpc("apply_loyalty_delta", {
      p_delta: -cost,
      p_description: `Redeemed ${reward.name} for ${cost} points`,
      p_order_id: null,
    })
    if (error) {
      throw new Error(error.message)
    }

    await Promise.all([refreshPoints(), refreshTransactions()])

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 3)

    const newUserReward: UserReward = {
      id: `user-reward-${Date.now()}`,
      user_id: user.id,
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
      localStorage.setItem(userRewardsKey(user.id), JSON.stringify(next))
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
        isLoyaltyActive: Boolean(user),
        programRewards,
        productsEarningPoints,
        columnsExist,
        setupSql,
        userRewards,
        transactions,
        isLoading: isLoading || authLoading,
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
