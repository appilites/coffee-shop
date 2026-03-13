"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLoyalty } from "@/lib/context/loyalty-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Gift, Star, History, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"

export default function RewardsPage() {
  const router = useRouter()
  const { pointsBalance, rewards, userRewards, transactions, isLoading, refreshPoints, refreshUserRewards, redeemReward } = useLoyalty()
  const [redeeming, setRedeeming] = useState<string | null>(null)

  const handleRedeem = async (rewardId: string, pointsRequired: number) => {
    if (pointsBalance && pointsBalance.current_points < pointsRequired) {
      toast({
        title: "Insufficient Points",
        description: `You need ${pointsRequired} points but only have ${pointsBalance.current_points}.`,
        variant: "destructive",
      })
      return
    }

    setRedeeming(rewardId)

    try {
      await redeemReward(rewardId)

      const reward = rewards.find((r) => r.id === rewardId)
      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${reward?.name || "this reward"}.`,
      })

      await Promise.all([refreshPoints(), refreshUserRewards()])
    } catch (error) {
      console.error("Error redeeming reward:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to redeem reward",
        variant: "destructive",
      })
    } finally {
      setRedeeming(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-background" style={{ backgroundColor: "#181511" }}>
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50" style={{ backgroundColor: "#181511" }}>
        <div className="container mx-auto flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 lg:py-4">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
            </div>
            <span className="font-serif text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-foreground">
              Druids Nutrition
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/menu")}
            className="text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9"
          >
            Back to Menu
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8">
        {/* Points Balance Card */}
        <Card className="mb-6 p-4 sm:p-6 gradient-copper-gold text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">Your Loyalty Points</h1>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{pointsBalance?.current_points || 0}</p>
              <p className="text-xs sm:text-sm opacity-90 mt-1">
                Total Earned: {pointsBalance?.total_points_earned || 0} • Redeemed:{" "}
                {pointsBalance?.total_points_redeemed || 0}
              </p>
            </div>
            <Star className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 opacity-80" />
          </div>
        </Card>

        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Available Rewards</span>
              <span className="sm:hidden">Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="my-rewards" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">My Rewards</span>
              <span className="sm:hidden">My</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Available Rewards</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rewards.map((reward) => {
                const canRedeem = pointsBalance && pointsBalance.current_points >= reward.points_required
                return (
                  <Card key={reward.id} className="overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {reward.image_url ? (
                        <Image src={reward.image_url} alt={reward.name} fill className="object-cover" />
                      ) : (
                        <Gift className="h-16 w-16 text-primary opacity-50" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-foreground">{reward.name}</h3>
                        <Badge variant="secondary" className="gradient-copper-gold text-white">
                          {reward.points_required} pts
                        </Badge>
                      </div>
                      {reward.description && (
                        <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                      )}
                      <Button
                        className={`w-full ${
                          canRedeem
                            ? "gradient-copper-gold text-white hover:opacity-90"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                        disabled={!canRedeem || redeeming === reward.id}
                        onClick={() => handleRedeem(reward.id, reward.points_required)}
                      >
                        {redeeming === reward.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redeeming...
                          </>
                        ) : canRedeem ? (
                          "Redeem Now"
                        ) : (
                          "Not Enough Points"
                        )}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-rewards" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">My Active Rewards</h2>
            {userRewards.length === 0 ? (
              <Card className="p-8 text-center">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">You don't have any active rewards yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Redeem rewards to see them here!</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userRewards.map((userReward) => (
                  <Card key={userReward.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-foreground">
                        {userReward.reward?.name || "Reward"}
                      </h3>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    </div>
                    {userReward.reward?.description && (
                      <p className="text-sm text-muted-foreground mb-2">{userReward.reward.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Expires: {userReward.expires_at ? new Date(userReward.expires_at).toLocaleDateString() : "Never"}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Points History</h2>
            {transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No transaction history yet.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {transaction.transaction_type === "earned" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{transaction.description || "Transaction"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-bold ${
                          transaction.points > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points} pts
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
