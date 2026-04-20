"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Coffee, CreditCard, Smartphone, Zap } from "lucide-react"
import { LoyaltyPointsDisplay } from "@/components/loyalty-points-display"
import { PromotionsSection } from "@/components/promotions-section"
import { NewArrivalsSection } from "@/components/new-arrivals-section"
import { ApothecarySection } from "@/components/apothecary-section"
import { requestPwaInstallPrompt } from "@/components/pwa-install-manager"

export default function HomePage() {
  const handleInstallApp = () => {
    requestPwaInstallPrompt()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50" style={{ backgroundColor: '#181511' }}>
        <div className="container mx-auto flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 lg:py-4">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16">
              <Image
                src="/logo.png"
                alt="Druids Nutrition Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-serif text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-foreground">Druids Nutrition</span>
          </div>
          <div className="flex items-center gap-2">
            <LoyaltyPointsDisplay />
            <Link href="/menu" className="cursor-pointer">
              <Button size="sm" className="gradient-copper-gold text-white hover:opacity-90 text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 px-2 sm:px-3">
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("/DN%20banner.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
        ></div>
        {/* Black overlay for readability */}
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#181511]"></div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto min-h-screen px-4 flex flex-col items-center justify-center text-center">
          <p className="text-brand font-semibold tracking-wide uppercase text-xs sm:text-sm mb-3">
            Fresh • Energizing • Protein-Packed
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white max-w-4xl leading-tight">
            Crafted Drinks for Every Mood
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/90 max-w-2xl">
            Explore loaded teas, specialty blends, and meal replacement favorites made to fuel your day.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/menu" className="cursor-pointer">
              <Button className="gradient-copper-gold text-white hover:opacity-90 min-w-[150px]">
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Apothecary Section - Curated Selection */}
      <ApothecarySection />

      {/* New Arrivals - Dynamic from Database */}
      <NewArrivalsSection />

      {/* Promotions — directly under hero, card grid in PromotionsSection */}
      <PromotionsSection />

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20" style={{ backgroundColor: '#181511' }}>
        <div className="mb-8 sm:mb-12 text-center px-2">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground">How It Works</h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground">
            Three simple steps to your perfect drink
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {/* Customize Drinks */}
          <Card className="group relative overflow-hidden p-3 sm:p-4 md:p-5 lg:p-6 transition-all hover:shadow-lg">
            <div className="relative z-10">
              <div className="mb-2 sm:mb-3 md:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-brand/10 transition-colors group-hover:gradient-copper-gold">
                <Coffee className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-brand transition-colors group-hover:text-primary-foreground" />
              </div>
              <div className="mb-1 sm:mb-1.5 md:mb-2 flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif text-xs sm:text-sm font-semibold text-brand">Step 1</span>
              </div>
              <h3 className="mb-1 sm:mb-1.5 md:mb-2 font-serif text-base sm:text-lg md:text-xl font-semibold text-foreground">Customize Order</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Make it yours with size options, milk alternatives, and premium add-ons.
              </p>
            </div>
          </Card>

          {/* Pay Securely */}
          <Card className="group relative overflow-hidden p-3 sm:p-4 md:p-5 lg:p-6 transition-all hover:shadow-lg">
            <div className="relative z-10">
              <div className="mb-2 sm:mb-3 md:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-brand/10 transition-colors group-hover:gradient-copper-gold">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-brand transition-colors group-hover:text-primary-foreground" />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-serif text-xs sm:text-sm font-semibold text-brand">Step 2</span>
              </div>
              <h3 className="mb-2 font-serif text-base sm:text-lg md:text-xl font-semibold text-foreground">Pay Securely</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Fast, secure checkout with your favorite payment method. No cash needed.
              </p>
            </div>
          </Card>

          {/* Earn Rewards */}
          <Card className="group relative overflow-hidden p-3 sm:p-4 md:p-5 lg:p-6 transition-all hover:shadow-lg">
            <div className="relative z-10">
              <div className="mb-2 sm:mb-3 md:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-brand/10 transition-colors group-hover:gradient-copper-gold">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-brand transition-colors group-hover:text-primary-foreground" />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-serif text-xs sm:text-sm font-semibold text-brand">Step 3</span>
              </div>
              <h3 className="mb-2 font-serif text-base sm:text-lg md:text-xl font-semibold text-foreground">Earn Rewards</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Collect loyalty points on every order and redeem them for your favorite menu items.
              </p>
            </div>
          </Card>

        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 pb-8 sm:mb-5 md:pb-16 lg:pb-20" style={{ backgroundColor: "#181511" }}>
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/90 px-5 py-8 sm:px-8 sm:py-14 md:px-12 md:py-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand/10 via-transparent to-brand/10" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight">
                Ready to Transform
                <br />
                Your Routine?
              </h2>
              <p className="mt-4 text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Join the Druids community today. Order seamlessly, earn rewards, and enjoy your favorites faster.
              </p>

              <div className="mt-6 flex flex-row items-center justify-center gap-2 sm:gap-4">
                <Link href="/menu" className="cursor-pointer w-[48%] sm:w-auto">
                  <Button className="w-full sm:w-[200px] h-11 sm:h-12 gradient-copper-gold text-white hover:opacity-90 uppercase tracking-[0.18em] text-[10px] sm:text-xs font-semibold">
                    Begin Order
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-[48%] sm:w-[200px] h-11 sm:h-12 border-white/20 bg-black/30 text-foreground hover:bg-black/50 uppercase tracking-[0.18em] text-[10px] sm:text-xs font-semibold"
                  onClick={handleInstallApp}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Install App
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
