"use client"

import { useState, useEffect } from "react"
import type { MenuItem } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useCart } from "@/lib/context/cart-context"
import { LoyaltyPointsEarnBadge } from "@/components/loyalty-points-earn-badge"
import { toast } from "@/hooks/use-toast"

interface PowerBowlCustomizeDialogProps {
  item: MenuItem
  open: boolean
  onClose: () => void
}

// Step 1: Base options
const BASE_OPTIONS = [
  { id: "acai", name: "Açaí", priceModifier: 0 },
  { id: "pitaya", name: "Pitaya", priceModifier: 0 },
  { id: "oatmeal", name: "Oatmeal", priceModifier: 0 },
]

// Step 2: Granola options
const GRANOLA_OPTIONS = [
  { id: "granola", name: "Granola", priceModifier: 0 },
  { id: "no-granola", name: "No Granola", priceModifier: 0 },
  { id: "blueberry-flax", name: "Blueberry Flax", priceModifier: 0.5 },
]

// Step 3: Fruits (pick 3)
const FRUIT_OPTIONS = [
  { id: "banana", name: "Banana", priceModifier: 0 },
  { id: "blueberry", name: "Blueberry", priceModifier: 0 },
  { id: "kiwi", name: "Kiwi", priceModifier: 0 },
  { id: "pineapple", name: "Pineapple", priceModifier: 0 },
  { id: "strawberry", name: "Strawberry", priceModifier: 0 },
]
const FRUIT_INCLUDED_SELECTIONS = 3
const FRUIT_EXTRA_SELECTION_PRICE = 1

// Step 4: Agaves Boosta
const BOOSTA_OPTIONS = [
  { id: "almond", name: "Almond", priceModifier: 0.5 },
  { id: "bee-pollen", name: "Bee Pollen", priceModifier: 0.5 },
  { id: "cacao-nibs", name: "Cacao Nibs", priceModifier: 0.5 },
  { id: "caramel", name: "Caramel", priceModifier: 0.5 },
  { id: "coconut-flakes", name: "Coconut Flakes", priceModifier: 0.5 },
  { id: "chia-seeds", name: "Chia Seeds", priceModifier: 0.5 },
  { id: "hemp-seeds", name: "Hemp Seeds", priceModifier: 0.5 },
  { id: "honey", name: "Honey", priceModifier: 0.5 },
  { id: "nutella", name: "Nutella", priceModifier: 1.0 },
  { id: "peanut-butter", name: "Peanut Butter", priceModifier: 0.5 },
]

const ADD_TO_CART_FEEDBACK_MS = 450
const MOBILE_FULLSCREEN_DIALOG_CLASS =
  "!inset-0 !top-0 !left-0 !w-screen !h-[100dvh] !max-w-none !rounded-none !border-0 !translate-x-0 !translate-y-0 !p-0 overflow-hidden flex flex-col sm:!inset-auto sm:!top-[50%] sm:!left-[50%] sm:!w-full sm:!h-auto sm:!max-w-2xl sm:!max-h-[90vh] sm:!rounded-lg sm:!border sm:!translate-x-[-50%] sm:!translate-y-[-50%]"

export default function PowerBowlCustomizeDialog({ item, open, onClose }: PowerBowlCustomizeDialogProps) {
  const { addItem } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  
  // Selections
  const [selectedBase, setSelectedBase] = useState<string>("")
  const [selectedGranola, setSelectedGranola] = useState<string>("")
  const [selectedFruits, setSelectedFruits] = useState<string[]>([])
  const [selectedBoostas, setSelectedBoostas] = useState<string[]>([])

  // Reset selections when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      setSelectedBase("")
      setSelectedGranola("")
      setSelectedFruits([])
      setSelectedBoostas([])
      setSlideDirection("right")
      setAddingToCart(false)
    }
  }, [open])

  const handleNext = () => {
    if (currentStep < 4) {
      setSlideDirection("right")
      setTimeout(() => setCurrentStep(currentStep + 1), 10)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setSlideDirection("left")
      setTimeout(() => setCurrentStep(currentStep - 1), 10)
    }
  }

  const handleFruitToggle = (fruitId: string) => {
    if (selectedFruits.includes(fruitId)) {
      setSelectedFruits(selectedFruits.filter(f => f !== fruitId))
    } else {
      setSelectedFruits([...selectedFruits, fruitId])
    }
  }

  const handleBoostaToggle = (boostaId: string) => {
    if (selectedBoostas.includes(boostaId)) {
      setSelectedBoostas(selectedBoostas.filter(b => b !== boostaId))
    } else {
      setSelectedBoostas([...selectedBoostas, boostaId])
    }
  }

  const calculateTotalPrice = () => {
    let price = item.base_price

    // Add base price modifier
    const base = BASE_OPTIONS.find(b => b.id === selectedBase)
    if (base) price += base.priceModifier

    // Add granola price modifier
    const granola = GRANOLA_OPTIONS.find(g => g.id === selectedGranola)
    if (granola) price += granola.priceModifier

    // Add fruits price modifiers
    selectedFruits.forEach(fruitId => {
      const fruit = FRUIT_OPTIONS.find(f => f.id === fruitId)
      if (fruit) price += fruit.priceModifier
    })
    const extraFruitCount = Math.max(0, selectedFruits.length - FRUIT_INCLUDED_SELECTIONS)
    if (extraFruitCount > 0) {
      price += extraFruitCount * FRUIT_EXTRA_SELECTION_PRICE
    }

    // Add boosta price modifiers
    selectedBoostas.forEach(boostaId => {
      const boosta = BOOSTA_OPTIONS.find(b => b.id === boostaId)
      if (boosta) price += boosta.priceModifier
    })

    return price
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedBase !== ""
      case 2:
        return selectedGranola !== ""
      case 3:
        return selectedFruits.length >= FRUIT_INCLUDED_SELECTIONS
      case 4:
        return true
      default:
        return false
    }
  }

  const handleAddToCart = async () => {
    if (addingToCart) return
    setAddingToCart(true)
    try {
    const customizations = [
      {
        optionId: "base",
        optionName: "Base",
        choices: [{
          id: selectedBase,
          name: BASE_OPTIONS.find(b => b.id === selectedBase)?.name || "",
          priceModifier: BASE_OPTIONS.find(b => b.id === selectedBase)?.priceModifier || 0,
        }],
      },
      {
        optionId: "granola",
        optionName: "Granola",
        choices: [{
          id: selectedGranola,
          name: GRANOLA_OPTIONS.find(g => g.id === selectedGranola)?.name || "",
          priceModifier: GRANOLA_OPTIONS.find(g => g.id === selectedGranola)?.priceModifier || 0,
        }],
      },
      {
        optionId: "fruits",
        optionName: "Fruits",
        choices: selectedFruits.map(fruitId => {
          const fruit = FRUIT_OPTIONS.find(f => f.id === fruitId)!
          return {
            id: fruitId,
            name: fruit.name,
            priceModifier: fruit.priceModifier,
          }
        }),
      },
      ...(selectedBoostas.length > 0 ? [{
        optionId: "boostas",
        optionName: "Agaves Boosta",
        choices: selectedBoostas.map(boostaId => {
          const boosta = BOOSTA_OPTIONS.find(b => b.id === boostaId)!
          return {
            id: boostaId,
            name: boosta.name,
            priceModifier: boosta.priceModifier,
          }
        }),
      }] : []),
    ]

    addItem({
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity: 1,
      selectedCustomizations: customizations,
      totalPrice: calculateTotalPrice(),
    })
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    })

      await new Promise((r) => setTimeout(r, ADD_TO_CART_FEEDBACK_MS))
      onClose()
    } finally {
      setAddingToCart(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Pick your Base"
      case 2:
        return "Add Granola or Not"
      case 3:
        return "Pick 3+ Fruits"
      case 4:
        return "Agaves Boosta"
      default:
        return ""
    }
  }

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Choose your bowl base"
      case 2:
        return "Select your granola option"
      case 3:
        return selectedFruits.length > FRUIT_INCLUDED_SELECTIONS
          ? `Select at least 3 fruits (${selectedFruits.length} selected) • Extra fruit charge +$${(
              (selectedFruits.length - FRUIT_INCLUDED_SELECTIONS) * FRUIT_EXTRA_SELECTION_PRICE
            ).toFixed(2)}`
          : `Select at least 3 fruits (${selectedFruits.length}/${FRUIT_INCLUDED_SELECTIONS} selected)`
      case 4:
        return "Add optional boosts (multiple selections allowed)"
      default:
        return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={MOBILE_FULLSCREEN_DIALOG_CLASS}>
        <DialogHeader className="sr-only">
          <DialogTitle>Customize {item.name}</DialogTitle>
        </DialogHeader>
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-amber-950/40 to-stone-900/90 dark:from-[#2a241c] dark:to-[#181511] shrink-0 border-b border-border">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
            Build your own POWER BOWL
          </h2>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Step {currentStep} of 4
              </p>
              <p className="text-base sm:text-lg font-semibold text-brand mt-1">
                {getStepTitle()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {getStepSubtitle()}
              </p>
            </div>
            <div className="text-right space-y-1 shrink-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-brand">
                ${calculateTotalPrice().toFixed(2)}
              </p>
              <LoyaltyPointsEarnBadge
                points={item.loyalty_points_earn ?? 0}
                size="sm"
                variant="compact"
                context="product"
              />
            </div>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="flex gap-1 px-4 sm:px-6 py-2 sm:py-3 bg-muted/30 shrink-0">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all ${
                step <= currentStep ? "gradient-copper-gold" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content with slide animation - Scrollable */}
        <div className="relative overflow-y-auto flex-1 px-4 sm:px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div
            className={`transition-all duration-300 ease-in-out ${
              slideDirection === "right"
                ? currentStep === 1 ? "translate-x-0 opacity-100" : currentStep === 2 ? "animate-slide-in-right" : currentStep === 3 ? "animate-slide-in-right" : "animate-slide-in-right"
                : currentStep === 4 ? "translate-x-0 opacity-100" : currentStep === 3 ? "animate-slide-in-left" : currentStep === 2 ? "animate-slide-in-left" : "animate-slide-in-left"
            }`}
          >
            {/* Step 1: Base */}
            {currentStep === 1 && (
              <div className="space-y-3">
                {BASE_OPTIONS.map((base) => (
                  <button
                    key={base.id}
                    onClick={() => setSelectedBase(base.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedBase === base.id
                        ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                        : "border-border hover:border-brand/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{base.name}</span>
                      {base.priceModifier > 0 && (
                        <span className="text-sm text-muted-foreground">
                          +${base.priceModifier.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Granola */}
            {currentStep === 2 && (
              <div className="space-y-3">
                {GRANOLA_OPTIONS.map((granola) => (
                  <button
                    key={granola.id}
                    onClick={() => setSelectedGranola(granola.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedGranola === granola.id
                        ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                        : "border-border hover:border-brand/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{granola.name}</span>
                      {granola.priceModifier > 0 && (
                        <span className="text-sm text-muted-foreground">
                          +${granola.priceModifier.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Fruits */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  First {FRUIT_INCLUDED_SELECTIONS} fruits included. Each extra fruit +$
                  {FRUIT_EXTRA_SELECTION_PRICE.toFixed(2)}.
                </p>
                {Math.max(0, selectedFruits.length - FRUIT_INCLUDED_SELECTIONS) > 0 ? (
                  <p className="text-xs sm:text-sm font-medium text-brand">
                    Extra fruit charges: +$
                    {(
                      Math.max(0, selectedFruits.length - FRUIT_INCLUDED_SELECTIONS) * FRUIT_EXTRA_SELECTION_PRICE
                    ).toFixed(2)}
                  </p>
                ) : null}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {FRUIT_OPTIONS.map((fruit) => {
                    const isSelected = selectedFruits.includes(fruit.id)
                    
                    return (
                      <button
                        key={fruit.id}
                        onClick={() => handleFruitToggle(fruit.id)}
                        className={`p-3 sm:p-4 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                            : "border-border hover:border-brand/50 hover:bg-muted/50"
                        }`}
                      >
                        <span className="text-base sm:text-lg font-semibold">{fruit.name}</span>
                        {isSelected && (
                          <div className="mt-1 text-brand text-sm">
                            ✓ Selected
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Boostas */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {BOOSTA_OPTIONS.map((boosta) => {
                    const isSelected = selectedBoostas.includes(boosta.id)
                    
                    return (
                      <button
                        key={boosta.id}
                        onClick={() => handleBoostaToggle(boosta.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                            : "border-border hover:border-brand/50 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">{boosta.name}</span>
                          {isSelected && (
                            <span className="text-brand text-sm">✓</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          +${boosta.priceModifier.toFixed(2)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation - Always visible */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] border-t bg-muted/30 shrink-0">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="outline"
              size="lg"
              className="flex-1 h-11 sm:h-12"
            >
              <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Back</span>
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                size="lg"
                className="flex-1 gradient-copper-gold text-white hover:opacity-90 h-11 sm:h-12"
              >
                <span className="text-sm sm:text-base">Next</span>
                <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => void handleAddToCart()}
                disabled={addingToCart}
                size="lg"
                className="flex-1 gradient-copper-gold text-white hover:opacity-90 h-11 sm:h-12"
              >
                {addingToCart ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="text-sm sm:text-base">Add to Cart - ${calculateTotalPrice().toFixed(2)}</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
