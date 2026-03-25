"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLoyalty } from "@/lib/context/loyalty-context"
import { useAuth } from "@/lib/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Gift, Star, History, CheckCircle2, XCircle, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { getProductImage } from "@/lib/product-images"
import { loyaltyCopy } from "@/lib/loyalty-copy"

export default function RewardsPage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const {
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
    refreshUserRewards,
    redeemReward,
  } = useLoyalty()
  const [redeeming, setRedeeming] = useState<string | null>(null)

  const handleRedeem = async (menuItemId: string, pointsRequired: number) => {
    if (pointsBalance && pointsBalance.current_points < pointsRequired) {
      toast({
        title: "Insufficient Points",
        description: `You need ${pointsRequired} points but only have ${pointsBalance.current_points}.`,
        variant: "destructive",
      })
      return
    }

    setRedeeming(menuItemId)

    try {
      await redeemReward(menuItemId)
      const r = programRewards.find((x) => x.id === menuItemId)
      toast({
        title: "Reward added to cart",
        description: `${r?.name ?? "Item"} was added at $0. Open your cart to checkout.`,
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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button size="sm" variant="ghost" asChild className="text-[10px] sm:text-xs h-7 sm:h-8 px-2">
              <Link href="/auth/change-password">Password</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-[10px] sm:text-xs h-7 sm:h-8 px-2"
              onClick={async () => {
                await signOut()
                router.push("/menu")
              }}
            >
              Sign out
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/menu")}
              className="text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9"
            >
              Menu
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8">
        <Card className="mb-6 p-4 sm:p-6 gradient-copper-gold text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">Your loyalty balance</h1>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums">
                {pointsBalance?.current_points ?? 0}{" "}
                <span className="text-lg sm:text-xl md:text-2xl font-semibold opacity-95">loyalty points</span>
              </p>
              <p className="text-xs sm:text-sm opacity-90 mt-1">
                Lifetime earned: {pointsBalance?.total_points_earned ?? 0} · Total redeemed:{" "}
                {pointsBalance?.total_points_redeemed ?? 0}
              </p>
              <p className="text-[10px] sm:text-xs opacity-85 mt-2 max-w-md leading-relaxed">
                {loyaltyCopy.rewardsHowItWorks}
              </p>
            </div>
            <Star className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 opacity-80 shrink-0" />
          </div>
        </Card>

        {columnsExist === false && setupSql && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-950/30">
            <AlertTitle className="text-amber-200">Loyalty columns not found</AlertTitle>
            <AlertDescription className="text-amber-100/90 text-sm space-y-2">
              <p>Run this in the Supabase SQL editor, then refresh this page.</p>
              <pre className="text-[10px] sm:text-xs whitespace-pre-wrap break-all bg-black/40 p-3 rounded-md overflow-x-auto">
                {setupSql}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Rewards</span>
              <span className="sm:hidden">Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="earn" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Earn points</span>
              <span className="sm:hidden">Earn</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">Hist</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="space-y-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Redeem with points</h2>
              {rewardsLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Products your admin marked with a points cost appear here, sorted by cost (lowest first).
            </p>

            {!rewardsLoading && programRewards.length === 0 && (
              <Card className="p-8 text-center border-dashed">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-foreground font-medium">No rewards yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  When the dashboard sets <code className="text-xs">loyalty_points_cost</code> on a product, it will show up
                  here.
                </p>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {programRewards.map((reward) => {
                const cost = reward.loyalty_points_cost
                const canRedeem = pointsBalance != null && pointsBalance.current_points >= cost
                const img =
                  reward.image_url && (reward.image_url.startsWith("http") || reward.image_url.startsWith("/"))
                    ? reward.image_url
                    : getProductImage(reward.name, reward.category?.id ?? null, reward.category?.name)
                return (
                  <Card key={reward.id} className="overflow-hidden flex flex-col">
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
                      <Image src={img} alt={reward.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-foreground leading-tight">{reward.name}</h3>
                        <Badge variant="secondary" className="gradient-copper-gold text-white shrink-0">
                          {cost} pts
                        </Badge>
                      </div>
                      {reward.category && (
                        <p className="text-xs text-muted-foreground mb-1">{reward.category.name}</p>
                      )}
                      {reward.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{reward.description}</p>
                      )}
                      {reward.loyalty_points_earn > 0 && (
                        <p className="text-xs text-amber-600/90 dark:text-amber-400 mb-3">
                          Also earns {reward.loyalty_points_earn} pts when purchased normally
                        </p>
                      )}
                      <div className="mt-auto">
                        <Button
                          className={`w-full ${
                            canRedeem
                              ? "gradient-copper-gold text-white hover:opacity-90"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                          disabled={!canRedeem || redeeming === reward.id}
                          onClick={() => handleRedeem(reward.id, cost)}
                        >
                          {redeeming === reward.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Redeeming…
                            </>
                          ) : canRedeem ? (
                            "Redeem — add to cart ($0)"
                          ) : (
                            "Not enough points"
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <section className="mt-10">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Recently redeemed
              </h3>
              {userRewards.length === 0 ? (
                <Card className="p-8 text-center">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No redemptions yet.</p>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {userRewards.map((ur) => (
                    <Card key={ur.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-foreground">{ur.product_name || ur.reward?.name || "Reward"}</h4>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {ur.points_spent} pts · Expires {ur.expires_at ? new Date(ur.expires_at).toLocaleDateString() : "—"}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="earn" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Products that earn points</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Buy these items to earn the listed points per unit (set in admin as <code className="text-xs">loyalty_points_earn</code>
              ).
            </p>
            {!rewardsLoading && productsEarningPoints.length === 0 && (
              <Card className="p-8 text-center border-dashed">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No products are configured to earn points yet.</p>
              </Card>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {productsEarningPoints.map((p) => (
                <Card key={p.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{p.name}</p>
                    {p.category && <p className="text-xs text-muted-foreground">{p.category.name}</p>}
                  </div>
                  <Badge className="gradient-copper-gold text-white shrink-0">+{p.loyalty_points_earn} pts / unit</Badge>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Points history</h2>
            {transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No transactions yet.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {transaction.transaction_type === "earned" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {transaction.description || "Transaction"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-bold shrink-0 ${transaction.points > 0 ? "text-green-500" : "text-red-500"}`}
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
