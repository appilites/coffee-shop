"use client"

import { useState, useMemo, useEffect } from "react"
import type { MenuItem, CustomizationOption, CustomizationChoice, ComboOption } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Minus, Plus, Loader2 } from "lucide-react"
import { useCart } from "@/lib/context/cart-context"
import { LoyaltyPointsEarnBadge } from "@/components/loyalty-points-earn-badge"
import { comboService } from "@/lib/supabase/database"
import { productVariationsToCustomizations } from "@/lib/product-variations"

interface CustomizeDialogProps {
  item: MenuItem
  customizations: (CustomizationOption & { choices: CustomizationChoice[] })[]
  categoryName?: string
  menuItems?: MenuItem[]
  open: boolean
  onClose: () => void
}

const ADD_TO_CART_FEEDBACK_MS = 450

export default function CustomizeDialog({ item, customizations: propCustomizations, categoryName, menuItems = [], open, onClose }: CustomizeDialogProps) {
  const { addItem } = useCart()
  const [addingToCart, setAddingToCart] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string[]>>(new Map())
  const [selectedCombos, setSelectedCombos] = useState<Set<string>>(new Set())
  const [customizations, setCustomizations] = useState<(CustomizationOption & { choices: CustomizationChoice[] })[]>(propCustomizations || [])
  const [loadingCustomizations, setLoadingCustomizations] = useState(false)
  const [availableCombos, setAvailableCombos] = useState<ComboOption[]>([])
  const [loadingCombos, setLoadingCombos] = useState(false)

  // All variations live in menu_items.variations (JSONB) – no separate table lookup needed
  useEffect(() => {
    if (!open) {
      setCustomizations([])
      return
    }
    setCustomizations(productVariationsToCustomizations(item.variations))
    setLoadingCustomizations(false)
  }, [open, item.variations])

  // Fetch combos from database
  useEffect(() => {
    if (open) {
      setLoadingCombos(true)
      comboService.getByMenuItem(item.id)
        .then((dbCombos) => {
          setAvailableCombos(dbCombos || [])
        })
        .catch((error) => {
          console.error('❌ Error fetching combos:', error)
          setAvailableCombos([])
        })
        .finally(() => {
          setLoadingCombos(false)
        })
      } else {
      setAvailableCombos([])
    }
  }, [open, item.id])

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      setQuantity(1)
      setSelectedOptions(new Map())
      setSelectedCombos(new Set())
      setSlideDirection("right")
      setAddingToCart(false)
    }
  }, [open, item.id])

  // Get all steps (customizations + combos + quantity)
  const allSteps = useMemo(() => {
    const steps: Array<{ type: 'customization' | 'combo' | 'quantity', data?: any }> = []
    
    // Add customization steps
    customizations.forEach((option) => {
      steps.push({ type: 'customization', data: option })
    })
    
    // Add combo step if available
    if (availableCombos.length > 0) {
      steps.push({ type: 'combo', data: availableCombos })
    }
    
    // Add quantity step
    steps.push({ type: 'quantity' })
    
    return steps
  }, [customizations, availableCombos])

  const totalSteps = allSteps.length

  const handleNext = () => {
    if (currentStep < totalSteps) {
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

  const handleOptionChange = (optionId: string, choiceId: string, isMultiple: boolean) => {
    const newSelections = new Map(selectedOptions)
    if (isMultiple) {
      const current = newSelections.get(optionId) || []
      if (current.includes(choiceId)) {
        newSelections.set(optionId, current.filter((id) => id !== choiceId))
      } else {
        newSelections.set(optionId, [...current, choiceId])
      }
    } else {
      newSelections.set(optionId, [choiceId])
    }
    setSelectedOptions(newSelections)
  }

  const handleComboToggle = (comboId: string) => {
    const newSelectedCombos = new Set(selectedCombos)
    if (newSelectedCombos.has(comboId)) {
      newSelectedCombos.delete(comboId)
    } else {
      newSelectedCombos.add(comboId)
    }
    setSelectedCombos(newSelectedCombos)
  }

  const canProceed = () => {
    const currentStepData = allSteps[currentStep - 1]
    if (!currentStepData) return false

    if (currentStepData.type === 'customization') {
      const option = currentStepData.data as CustomizationOption & { choices: CustomizationChoice[] }
      if (option.is_required) {
        const selections = selectedOptions.get(option.id)
        return selections && selections.length > 0
      }
      return true
    }

    if (currentStepData.type === 'combo' || currentStepData.type === 'quantity') {
      return true
    }

    return false
  }

  const calculateTotalPrice = () => {
    let price = item.base_price || 0

    // Add customization prices
    selectedOptions.forEach((choiceIds, optionId) => {
      const option = customizations.find((c) => c.id === optionId)
      if (option) {
        choiceIds.forEach((choiceId) => {
          const choice = option.choices.find((ch) => ch.id === choiceId)
          if (choice) {
            price += choice.price_modifier || 0
          }
        })
      }
    })

    // Add combo prices
    selectedCombos.forEach((comboId) => {
      const combo = availableCombos.find(c => c.id === comboId)
      if (combo && combo.items) {
        combo.items.forEach((comboItem: any) => {
          const comboMenuItem = comboItem.menu_item || menuItems.find(m => m.id === comboItem.menu_item_id)
          if (comboMenuItem) {
            let itemPrice = comboMenuItem.base_price || 0
            if (combo.combo_price !== null) {
              itemPrice = combo.combo_price / combo.items.length
            } else if (combo.discount_type === "percentage" && combo.discount_value) {
              itemPrice = itemPrice * (1 - combo.discount_value / 100)
            } else if (combo.discount_type === "fixed" && combo.discount_value) {
              itemPrice = Math.max(0, itemPrice - combo.discount_value)
            }
            price += itemPrice * (comboItem.quantity || 1)
          }
        })
      }
    })

    return price * quantity
  }

  const handleAddToCart = async () => {
    if (addingToCart) return
    setAddingToCart(true)
    try {
    const customizationData = Array.from(selectedOptions.entries())
      .map(([optionId, choiceIds]) => {
        const option = customizations.find((c) => c.id === optionId)
        if (!option) return null
        return {
          optionId,
          optionName: option.option_name,
          choices: choiceIds
            .map((choiceId) => {
              const choice = option.choices.find((ch) => ch.id === choiceId)
              if (!choice) return null
              return {
                id: choice.id,
                name: choice.choice_name,
                priceModifier: choice.price_modifier,
              }
            })
            .filter((choice) => choice !== null) as Array<{ id: string; name: string; priceModifier: number }>,
        }
      })
      .filter((customization) => customization !== null) as Array<{
        optionId: string
        optionName: string
        choices: Array<{ id: string; name: string; priceModifier: number }>
      }>

    // Add main item
    addItem({
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity: quantity,
      selectedCustomizations: customizationData,
      totalPrice: calculateTotalPrice(),
    })

    // Add combo items
    selectedCombos.forEach((comboId) => {
      const combo = availableCombos.find((c) => c.id === comboId)
      if (combo && combo.items) {
        combo.items.forEach((comboItem: any) => {
          const comboMenuItem = comboItem.menu_item || menuItems.find((m) => m.id === comboItem.menu_item_id)
          if (comboMenuItem) {
            let itemPrice = comboMenuItem.base_price || 0
            if (combo.combo_price !== null) {
              itemPrice = combo.combo_price / combo.items.length
            } else if (combo.discount_type === "percentage" && combo.discount_value) {
              itemPrice = itemPrice * (1 - combo.discount_value / 100)
            } else if (combo.discount_type === "fixed" && combo.discount_value) {
              itemPrice = Math.max(0, itemPrice - combo.discount_value)
            }
            addItem({
              id: `${comboMenuItem.id}-combo-${comboId}-${Date.now()}`,
              menuItem: comboMenuItem,
              quantity: (comboItem.quantity || 1) * quantity,
              selectedCustomizations: [],
              totalPrice: itemPrice * (comboItem.quantity || 1) * quantity,
            })
          }
        })
      }
    })

      await new Promise((r) => setTimeout(r, ADD_TO_CART_FEEDBACK_MS))
      onClose()
    } finally {
      setAddingToCart(false)
    }
  }

  const getStepTitle = () => {
    const currentStepData = allSteps[currentStep - 1]
    if (!currentStepData) return ""

    if (currentStepData.type === 'customization') {
      const option = currentStepData.data as CustomizationOption & { choices: CustomizationChoice[] }
      return option.option_name
    }

    if (currentStepData.type === 'combo') {
      return "Combo Options"
    }

    if (currentStepData.type === 'quantity') {
      return "Quantity"
    }

    return ""
  }

  const getStepSubtitle = () => {
    const currentStepData = allSteps[currentStep - 1]
    if (!currentStepData) return ""

    if (currentStepData.type === 'customization') {
      const option = currentStepData.data as CustomizationOption & { choices: CustomizationChoice[] }
      if (option.is_required) {
        return "Please select an option (required)"
      }
      return "Select your preferences (optional)"
    }

    if (currentStepData.type === 'combo') {
      return "Add combo items to your order"
    }

    if (currentStepData.type === 'quantity') {
      return "Select quantity"
    }

    return ""
  }

  const renderStepContent = () => {
    const currentStepData = allSteps[currentStep - 1]
    if (!currentStepData) return null

    if (currentStepData.type === 'customization') {
      const option = currentStepData.data as CustomizationOption & { choices: CustomizationChoice[] }
      
      // Validate option structure - prevent invalid data from being displayed
      if (!option || !option.id || !option.option_name || !option.choices || !Array.isArray(option.choices)) {
        console.error('❌ Invalid customization option structure:', option)
        return (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Invalid variation data</p>
          </div>
        )
      }

      const selected = selectedOptions.get(option.id) || []
      // Filter out invalid choices
      const validChoices = option.choices.filter((choice: any) => 
        choice && choice.id && choice.choice_name
      )

      if (validChoices.length === 0) {
        return (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No options available for this variation</p>
          </div>
        )
      }

      return (
        <div className="space-y-3">
          {option.option_type === "single" ? (
            <div className="space-y-3">
              {validChoices.map((choice: CustomizationChoice) => {
                const isSelected = selected[0] === choice.id
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleOptionChange(option.id, choice.id, false)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                        : "border-border hover:border-brand/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{choice.choice_name}</span>
                      {choice.price_modifier > 0 && (
                        <span className="text-sm text-muted-foreground">
                          +${choice.price_modifier.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {validChoices.map((choice: CustomizationChoice) => {
                const isSelected = selected.includes(choice.id)
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleOptionChange(option.id, choice.id, true)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                        : "border-border hover:border-brand/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="text-brand text-sm">✓</span>
                        )}
                        <span className="text-lg font-semibold">{choice.choice_name}</span>
                      </div>
                      {choice.price_modifier > 0 && (
                        <span className="text-sm text-muted-foreground">
                          +${choice.price_modifier.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    if (currentStepData.type === 'combo') {
      const combos = currentStepData.data as ComboOption[]
      return (
        <div className="space-y-3">
          {combos.map((combo) => {
            const comboItems = combo.items || []
            const comboMenuItem = comboItems.length > 0 
              ? (comboItems[0].menu_item || menuItems.find(m => m.id === comboItems[0].menu_item_id))
              : null
                  
            let comboPrice = 0
            if (comboMenuItem) {
              comboPrice = comboMenuItem.base_price || 0
              if (combo.combo_price !== null) {
                comboPrice = combo.combo_price / comboItems.length
              } else if (combo.discount_type === "percentage" && combo.discount_value) {
                comboPrice = comboPrice * (1 - combo.discount_value / 100)
              } else if (combo.discount_type === "fixed" && combo.discount_value) {
                comboPrice = Math.max(0, comboPrice - combo.discount_value)
              }
            }
                  
            const isSelected = selectedCombos.has(combo.id)
                  
            return (
              <button
                key={combo.id}
                onClick={() => handleComboToggle(combo.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                    : "border-border hover:border-brand/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isSelected && (
                        <span className="text-brand text-sm">✓</span>
                      )}
                      <span className="text-lg font-semibold">{combo.name}</span>
                    </div>
                    {combo.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {combo.description}
                      </p>
                    )}
                    {comboMenuItem && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Includes: {comboMenuItem.name}
                      </p>
                    )}
                  </div>
                  {comboMenuItem && (
                    <span className="text-base font-semibold whitespace-nowrap">
                      +${comboPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )
    }

    if (currentStepData.type === 'quantity') {
      return (
        <div className="flex items-center justify-center gap-4 py-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
            className="h-12 w-12"
              >
            <Minus className="h-5 w-5" />
              </Button>
          <span className="w-16 text-center text-2xl font-bold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
            className="h-12 w-12"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      )
    }

    return null
  }

  if (loadingCustomizations) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Customize {item.name}</DialogTitle>
          </DialogHeader>
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-amber-950/40 to-stone-900/90 dark:from-[#2a241c] dark:to-[#181511]">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              {item.name}
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading variations...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (allSteps.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Customize {item.name}</DialogTitle>
          </DialogHeader>
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-amber-950/40 to-stone-900/90 dark:from-[#2a241c] dark:to-[#181511]">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              {item.name}
            </h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 sm:px-6">
            <p className="text-sm text-muted-foreground mb-4">No variations available for this product.</p>
            <Button
              disabled={addingToCart}
              onClick={async () => {
                if (addingToCart) return
                setAddingToCart(true)
                try {
                  addItem({
                    id: `${item.id}-${Date.now()}`,
                    menuItem: item,
                    quantity: 1,
                    selectedCustomizations: [],
                    totalPrice: item.base_price || 0,
                  })
                  await new Promise((r) => setTimeout(r, ADD_TO_CART_FEEDBACK_MS))
                  onClose()
                } finally {
                  setAddingToCart(false)
                }
              }}
              className="w-full gradient-copper-gold text-white hover:opacity-90"
              size="lg"
            >
              {addingToCart ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `Add to Cart - $${(item.base_price || 0).toFixed(2)}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Customize {item.name}</DialogTitle>
        </DialogHeader>

        {/* Header - Same style as Power Bowl */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-amber-950/40 to-stone-900/90 dark:from-[#2a241c] dark:to-[#181511] shrink-0">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
            {item.name}
          </h2>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
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
                points={(item.loyalty_points_earn ?? 0) * quantity}
                size="sm"
                variant="compact"
                context="product"
              />
            </div>
          </div>
        </div>

        {/* Step Progress Indicator - Same style as Power Bowl */}
        <div className="flex gap-1 px-4 sm:px-6 py-2 sm:py-3 bg-muted/30 shrink-0">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index + 1}
              className={`h-2 flex-1 rounded-full transition-all ${
                index + 1 <= currentStep ? "gradient-copper-gold" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content with slide animation */}
        <div className="relative overflow-y-auto flex-1 px-4 sm:px-6 py-4">
          <div
            className={`transition-all duration-300 ease-in-out ${
              slideDirection === "right"
                ? "translate-x-0 opacity-100"
                : "translate-x-0 opacity-100"
            }`}
          >
            {renderStepContent()}
          </div>
        </div>

        {/* Footer Navigation - Same style as Power Bowl */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-muted/30 shrink-0">
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

            {currentStep < totalSteps ? (
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
                disabled={!canProceed() || addingToCart}
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
