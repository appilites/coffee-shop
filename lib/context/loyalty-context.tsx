"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Reward, LoyaltyPointsBalance, LoyaltyPointsTransaction, UserReward } from "@/lib/types"

interface LoyaltyContextType {
  pointsBalance: LoyaltyPointsBalance | null
  rewards: Reward[]
  userRewards: UserReward[]
  transactions: LoyaltyPointsTransaction[]
  isLoading: boolean
  refreshPoints: () => Promise<void>
  refreshRewards: () => Promise<void>
  refreshUserRewards: () => Promise<void>
  refreshTransactions: () => Promise<void>
  awardPoints: (points: number, description: string, orderId?: string) => Promise<void>
  redeemReward: (rewardId: string) => Promise<void>
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined)

// Mock rewards data
const mockRewards: Reward[] = [
  {
    id: "reward-1",
    name: "Free Coffee",
    description: "Redeem for any coffee drink",
    points_required: 100,
    reward_type: "free_drink",
    discount_percentage: null,
    discount_amount: null,
    is_active: true,
    image_url: null,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reward-2",
    name: "Free Tea",
    description: "Redeem for any tea drink",
    points_required: 100,
    reward_type: "free_tea",
    discount_percentage: null,
    discount_amount: null,
    is_active: true,
    image_url: null,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reward-3",
    name: "Free Protein Drink",
    description: "Redeem for any protein drink",
    points_required: 120,
    reward_type: "free_drink",
    discount_percentage: null,
    discount_amount: null,
    is_active: true,
    image_url: null,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reward-4",
    name: "10% Off",
    description: "Get 10% off your next order",
    points_required: 50,
    reward_type: "discount",
    discount_percentage: 10,
    discount_amount: null,
    is_active: true,
    image_url: null,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reward-5",
    name: "20% Off",
    description: "Get 20% off your next order",
    points_required: 100,
    reward_type: "discount",
    discount_percentage: 20,
    discount_amount: null,
    is_active: true,
    image_url: null,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reward-6",
    name: "Free Drink (Any)",
    description: "Redeem for any drink of your choice",
    points_required: 150,
    reward_type: "free_drink",
    discount_percentage: null,
    discount_amount: null,
    is_active: true,
    image_url: null,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const [pointsBalance, setPointsBalance] = useState<LoyaltyPointsBalance | null>(null)
  const [rewards] = useState<Reward[]>(mockRewards)
  const [userRewards, setUserRewards] = useState<UserReward[]>([])
  const [transactions, setTransactions] = useState<LoyaltyPointsTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedBalance = localStorage.getItem("loyalty_points_balance")
        const storedRewards = localStorage.getItem("loyalty_user_rewards")
        const storedTransactions = localStorage.getItem("loyalty_transactions")

        if (storedBalance) {
          setPointsBalance(JSON.parse(storedBalance))
        } else {
          // Initialize with 0 points
          const initialBalance: LoyaltyPointsBalance = {
            current_points: 0,
            total_points_earned: 0,
            total_points_redeemed: 0,
          }
          setPointsBalance(initialBalance)
          localStorage.setItem("loyalty_points_balance", JSON.stringify(initialBalance))
        }

        if (storedRewards) {
          setUserRewards(JSON.parse(storedRewards))
        }

        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions))
        }
      } catch (error) {
        console.error("Error loading loyalty data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFromStorage()
  }, [])

  const refreshPoints = async () => {
    try {
      const storedBalance = localStorage.getItem("loyalty_points_balance")
      if (storedBalance) {
        setPointsBalance(JSON.parse(storedBalance))
      }
    } catch (error) {
      console.error("Error refreshing points:", error)
    }
  }

  const refreshRewards = async () => {
    // Rewards are static, no need to refresh
  }

  const refreshUserRewards = async () => {
    try {
      const storedRewards = localStorage.getItem("loyalty_user_rewards")
      if (storedRewards) {
        setUserRewards(JSON.parse(storedRewards))
      }
    } catch (error) {
      console.error("Error refreshing user rewards:", error)
    }
  }

  const refreshTransactions = async () => {
    try {
      const storedTransactions = localStorage.getItem("loyalty_transactions")
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions))
      }
    } catch (error) {
      console.error("Error refreshing transactions:", error)
    }
  }

  const awardPoints = async (points: number, description: string, orderId?: string) => {
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
      localStorage.setItem("loyalty_points_balance", JSON.stringify(newBalance))

      // Add transaction
      const newTransaction: LoyaltyPointsTransaction = {
        id: `txn-${Date.now()}`,
        user_id: "user-mock",
        order_id: orderId || null,
        points: points,
        transaction_type: "earned",
        description: description,
        reward_id: null,
        created_at: new Date().toISOString(),
      }

      const updatedTransactions = [newTransaction, ...transactions]
      setTransactions(updatedTransactions)
      localStorage.setItem("loyalty_transactions", JSON.stringify(updatedTransactions))
    } catch (error) {
      console.error("Error awarding points:", error)
    }
  }

  const redeemReward = async (rewardId: string) => {
    try {
      const reward = rewards.find((r) => r.id === rewardId)
      if (!reward) throw new Error("Reward not found")

      const currentBalance = pointsBalance || {
        current_points: 0,
        total_points_earned: 0,
        total_points_redeemed: 0,
      }

      if (currentBalance.current_points < reward.points_required) {
        throw new Error("Insufficient points")
      }

      const newBalance: LoyaltyPointsBalance = {
        current_points: currentBalance.current_points - reward.points_required,
        total_points_earned: currentBalance.total_points_earned,
        total_points_redeemed: currentBalance.total_points_redeemed + reward.points_required,
      }

      setPointsBalance(newBalance)
      localStorage.setItem("loyalty_points_balance", JSON.stringify(newBalance))

      // Add transaction
      const newTransaction: LoyaltyPointsTransaction = {
        id: `txn-${Date.now()}`,
        user_id: "user-mock",
        order_id: null,
        points: -reward.points_required,
        transaction_type: "redeemed",
        description: `Redeemed ${reward.name} for ${reward.points_required} points`,
        reward_id: rewardId,
        created_at: new Date().toISOString(),
      }

      const updatedTransactions = [newTransaction, ...transactions]
      setTransactions(updatedTransactions)
      localStorage.setItem("loyalty_transactions", JSON.stringify(updatedTransactions))

      // Add user reward
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 3)

      const newUserReward: UserReward = {
        id: `user-reward-${Date.now()}`,
        user_id: "user-mock",
        reward_id: rewardId,
        order_id: null,
        points_spent: reward.points_required,
        status: "active",
        expires_at: expiresAt.toISOString(),
        used_at: null,
        created_at: new Date().toISOString(),
        reward: reward,
      }

      const updatedUserRewards = [newUserReward, ...userRewards]
      setUserRewards(updatedUserRewards)
      localStorage.setItem("loyalty_user_rewards", JSON.stringify(updatedUserRewards))
    } catch (error) {
      console.error("Error redeeming reward:", error)
      throw error
    }
  }

  return (
    <LoyaltyContext.Provider
      value={{
        pointsBalance,
        rewards,
        userRewards,
        transactions,
        isLoading,
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
