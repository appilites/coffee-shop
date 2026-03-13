"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Coffee, Clock, CreditCard, Droplet, Zap } from "lucide-react"
import { TrackOrderDialog } from "@/components/track-order-dialog"
import { LoyaltyPointsDisplay } from "@/components/loyalty-points-display"
import { useState } from "react"

export default function HomePage() {
  const [showTrackDialog, setShowTrackDialog] = useState(false)

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
      <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/hero section bg.png")' }}>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container relative z-10 mx-auto px-2 sm:px-3 md:px-4 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-32 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground text-balance">
              Your Daily Energy,
              <br />
              <span className="gradient-copper-gold-text">Perfectly Crafted</span>
            </h1>
            <p className="mx-auto mt-2 sm:mt-3 md:mt-4 lg:mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground text-pretty px-2">
              Fuel your day with our refreshing loaded teas, protein-packed drinks, quick eats and snacks- all topped off with an exceptional selection of specialty drinks
            </p>

            {/* Category Pills */}
            <div className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3 px-2">
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-coffee/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-coffee">
                <Coffee className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Coffee
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-tea/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-tea">
                <Droplet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Tea
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-protein/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-protein">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Protein
              </div>
            </div>

            <div className="mt-5 sm:mt-6 md:mt-8 lg:mt-10 flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4">
              <Link href="/menu" className="w-full sm:w-auto cursor-pointer">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gradient-copper-gold text-white hover:opacity-90 shadow-lg min-h-[48px]"
                >
                  Order Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20" style={{ backgroundColor: '#181511' }}>
        <div className="mb-8 sm:mb-12 text-center px-2">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">How It Works</h2>
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

          {/* Track Order */}
          <Card
            className="group relative overflow-hidden p-5 sm:p-6 transition-all hover:shadow-lg cursor-pointer"
            onClick={() => setShowTrackDialog(true)}
          >
            <div className="relative z-10">
              <div className="mb-2 sm:mb-3 md:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-brand/10 transition-colors group-hover:gradient-copper-gold">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-brand transition-colors group-hover:text-primary-foreground" />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-serif text-xs sm:text-sm font-semibold text-brand">Step 3</span>
              </div>
              <h3 className="mb-2 font-serif text-base sm:text-lg md:text-xl font-semibold text-foreground">Track & Pickup</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Real-time updates so you know exactly when to arrive for pickup.
              </p>
              <p className="text-xs text-brand font-medium mt-3 flex items-center gap-1">Click to track order →</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="pt-3 sm:pt-4 md:pt-6 lg:pt-8 pb-6 sm:pb-8 md:pb-12 lg:pb-16" style={{ backgroundColor: '#181511' }}>
        <div className="container mx-auto px-2 sm:px-3 md:px-4">
          <div className="mb-5 sm:mb-6 md:mb-8 lg:mb-12 text-center px-2">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">What We Serve</h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground">Explore our menu categories</p>
          </div>

          <div className="grid gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 md:grid-cols-3">
            {/* Coffee */}
            <Card className="group overflow-hidden transition-all hover:shadow-xl">
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-coffee/20 to-coffee/5">
                <Image
                  src="/latte-coffee-drink.jpg"
                  alt="Coffee"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to gradient if image doesn't exist
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-coffee mb-1.5 sm:mb-2">Coffee</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                  From classic espresso to iced lattes, we brew perfection in every cup
                </p>
                <Link href="/menu" className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px] hover:gradient-copper-gold hover:text-white"
                  >
                    View Coffee Menu
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Tea */}
            <Card className="group overflow-hidden transition-all hover:shadow-xl">
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-tea/20 to-tea/5">
                <Image
                  src="/matcha-green-tea-latte-vibrant.jpg"
                  alt="Tea"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to gradient if image doesn't exist
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-tea mb-1.5 sm:mb-2">Tea</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                  Teas are a combination of natural caffeine, B vitamins, tea grains, and aloe vera to make a highly caffeinated, sugar-free energy drink.
                </p>
                <Link href="/menu" className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px] hover:gradient-copper-gold hover:text-white"
                  >
                    View Tea Menu
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Protein */}
            <Card className="group overflow-hidden transition-all hover:shadow-xl">
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-protein/20 to-protein/5">
                <Image
                  src="/fruit-smoothie-drink.jpg"
                  alt="Protein"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to gradient if image doesn't exist
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-protein mb-1.5 sm:mb-2">Protein</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                  Nutrient-packed shakes and energy drinks to fuel your active lifestyle
                </p>
                <Link href="/menu" className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px] hover:gradient-copper-gold hover:text-white"
                  >
                    View Protein Menu
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-2 sm:px-3 md:px-4 pt-3 sm:pt-4 md:pt-6 lg:pt-8 pb-6 sm:pb-8 md:pb-12 lg:pb-16" style={{ backgroundColor: '#181511' }}>
        <div className="mb-5 sm:mb-6 md:mb-8 lg:mb-12 text-center px-2">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">New Arrivals</h2>
          <p className="mt-1.5 sm:mt-2 md:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground">
            Discover our latest additions to the menu
          </p>
        </div>

        <div className="grid gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 md:grid-cols-3">
          {/* New Arrival 1 */}
          <Card className="group overflow-hidden transition-all hover:shadow-xl">
            <div className="aspect-video relative overflow-hidden">
              <img
                src="/newarrival.jfif"
                alt="New Arrival"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
            <div className="p-3 sm:p-4 md:p-5 lg:p-6">
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">Protein Waffles</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                Build your own protein-packed waffle with your favorite toppings
              </p>
              <Link href="/menu?category=cat-17" className="cursor-pointer">
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] hover:gradient-copper-gold hover:text-white"
                >
                  Try Now
                </Button>
              </Link>
            </div>
          </Card>

          {/* New Arrival 2 */}
          <Card className="group overflow-hidden transition-all hover:shadow-xl">
            <div className="aspect-video relative overflow-hidden">
              <img
                src="/newarrival1.jfif"
                alt="New Arrival"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">Oat Milk Chai Tea Latte</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
                Slow sips, sweet moments. Protein-packed chai tea latte with oat milk
              </p>
              <Link href="/menu?category=cat-16" className="cursor-pointer">
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] hover:gradient-copper-gold hover:text-white"
                >
                  Try Now
                </Button>
              </Link>
            </div>
          </Card>

          {/* New Arrival 3 */}
          <Card className="group overflow-hidden transition-all hover:shadow-xl">
            <div className="aspect-video relative overflow-hidden">
              <img
                src="/newarrival2.jfif"
                alt="New Arrival"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">Specialty Drinks</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
                Explore our premium specialty drink collection with unique flavors
              </p>
              <Link href="/menu?category=cat-10" className="cursor-pointer">
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] hover:gradient-copper-gold hover:text-white"
                >
                  Try Now
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>


      {/* Track Order Dialog */}
      <TrackOrderDialog open={showTrackDialog} onOpenChange={setShowTrackDialog} />
    </div>
  )
}
