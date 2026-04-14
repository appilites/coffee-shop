"use client"

import { useState, useMemo, useEffect, type ReactNode } from "react"
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
import { productVariationsToCustomizations, defaultSelectionsForVariations } from "@/lib/product-variations"
import { toast } from "@/hooks/use-toast"
import { calculateLineTotalFromSelections } from "@/lib/calculate-variation-selection-price"

interface CustomizeDialogProps {
  item: MenuItem
  categoryName?: string
  menuItems?: MenuItem[]
  open: boolean
  onClose: () => void
}

const ADD_TO_CART_FEEDBACK_MS = 450
const PICK3_INCLUDED_SELECTIONS = 3
const PICK3_EXTRA_SELECTION_PRICE = 1
const MOBILE_FULLSCREEN_DIALOG_CLASS =
  "!inset-0 !top-0 !left-0 !w-screen !h-[100dvh] !max-w-none !rounded-none !border-0 !translate-x-0 !translate-y-0 !p-0 overflow-hidden flex flex-col sm:!inset-auto sm:!top-[50%] sm:!left-[50%] sm:!w-full sm:!h-auto sm:!max-w-2xl sm:!max-h-[90vh] sm:!rounded-lg sm:!border sm:!translate-x-[-50%] sm:!translate-y-[-50%]"

export default function CustomizeDialog({ item, categoryName, menuItems = [], open, onClose }: CustomizeDialogProps) {
  const { addItem } = useCart()
  const [addingToCart, setAddingToCart] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string[]>>(new Map())
  const [selectedCombos, setSelectedCombos] = useState<Set<string>>(new Set())
  const [availableCombos, setAvailableCombos] = useState<ComboOption[]>([])
  const [loadingCombos, setLoadingCombos] = useState(false)

  /** Single source of truth: `menu_items.variations` only (no legacy customization_options table). */
  const customizations = useMemo(
    () => productVariationsToCustomizations(item.variations),
    [item.id, item.variations],
  )

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

  // Reset when dialog opens; auto-select when a variation has only one choice
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      setQuantity(1)
      setSelectedOptions(defaultSelectionsForVariations(item.variations))
      setSelectedCombos(new Set())
      setSlideDirection("right")
      setAddingToCart(false)
    }
  }, [open, item.id, item.variations])

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
        if (option.option_type === "multiple" && isPick3FruitsOption(option.option_name)) {
          return Boolean(selections && selections.length >= PICK3_INCLUDED_SELECTIONS)
        }
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
    let price = calculateLineTotalFromSelections(item.base_price || 0, item.variations, mapSelections(selectedOptions))

    // Add combo prices
    selectedCombos.forEach((comboId) => {
      const combo = availableCombos.find(c => c.id === comboId)
      if (combo && combo.items) {
        combo.items.forEach((comboItem: any) => {
          const comboMenuItem = comboItem.menu_item || menuItems.find(m => m.id === comboItem.menu_item_id)
          if (comboMenuItem) {
            let itemPrice = comboMenuItem.base_price || 0
            if (combo.combo_price !== null && combo.items) {
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

  function mapSelections(map: Map<string, string[]>): Record<string, string | string[]> {
    const out: Record<string, string | string[]> = {}
    map.forEach((ids, variationId) => {
      if (!ids || ids.length === 0) return
      const option = customizations.find((c) => c.id === variationId)
      if (!option) return
      out[variationId] = option.option_type === "single" ? ids[0] : [...ids]
    })
    return out
  }

  function isPick3FruitsOption(optionName: string | undefined): boolean {
    const s = (optionName || "").toLowerCase()
    return s.includes("pick 3") || s.includes("3 fruits")
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
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    })

    // Add combo items
    selectedCombos.forEach((comboId) => {
      const combo = availableCombos.find((c) => c.id === comboId)
      if (combo && combo.items) {
        combo.items.forEach((comboItem: any) => {
          const comboMenuItem = comboItem.menu_item || menuItems.find((m) => m.id === comboItem.menu_item_id)
          if (comboMenuItem) {
            let itemPrice = comboMenuItem.base_price || 0
            if (combo.combo_price !== null && combo.items) {
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

  const getStepTitle = (): ReactNode => {
    const currentStepData = allSteps[currentStep - 1]
    if (!currentStepData) return ""

    if (currentStepData.type === 'customization') {
      const option = currentStepData.data as CustomizationOption & { choices: CustomizationChoice[] }
      return (
        <>
          {option.option_name}
          {option.is_required && <span className="text-destructive ml-0.5" aria-hidden> *</span>}
        </>
      )
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
      if (option.option_type === "multiple" && isPick3FruitsOption(option.option_name)) {
        const selected = selectedOptions.get(option.id) || []
        const extraCount = Math.max(0, selected.length - PICK3_INCLUDED_SELECTIONS)
        const extraCharge = extraCount * PICK3_EXTRA_SELECTION_PRICE
        return extraCount > 0
          ? `Select at least 3 fruits (${selected.length} selected) • Extra fruit charge +$${extraCharge.toFixed(2)}`
          : `Select at least 3 fruits (${selected.length}/${PICK3_INCLUDED_SELECTIONS} selected)`
      }
      if (option.is_required) {
        return option.option_type === "multiple"
          ? "Select at least one option"
          : "Select one option"
      }
      return "Optional — skip or choose your preferences"
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
            isPick3FruitsOption(option.option_name) ? (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  First {PICK3_INCLUDED_SELECTIONS} fruits included. Each extra fruit +$
                  {PICK3_EXTRA_SELECTION_PRICE.toFixed(2)}.
                </p>
                {Math.max(0, selected.length - PICK3_INCLUDED_SELECTIONS) > 0 ? (
                  <p className="text-xs sm:text-sm font-medium text-brand">
                    Extra fruit charges: +$
                    {(
                      Math.max(0, selected.length - PICK3_INCLUDED_SELECTIONS) * PICK3_EXTRA_SELECTION_PRICE
                    ).toFixed(2)}
                  </p>
                ) : null}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {validChoices.map((choice: CustomizationChoice) => {
                    const isSelected = selected.includes(choice.id)
                    const selectedIndex = selected.indexOf(choice.id)
                    const extraForThisSelection = isSelected && selectedIndex >= PICK3_INCLUDED_SELECTIONS
                    return (
                      <button
                        key={choice.id}
                        onClick={() => handleOptionChange(option.id, choice.id, true)}
                        className={`p-3 sm:p-4 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                            : "border-border hover:border-brand/50 hover:bg-muted/50"
                        }`}
                      >
                        <span className="text-base sm:text-lg font-semibold">{choice.choice_name}</span>
                        {isSelected ? <div className="mt-1 text-brand text-sm">✓ Selected</div> : null}
                        {extraForThisSelection ? (
                          <div className="mt-0.5 text-xs text-brand">
                            +${PICK3_EXTRA_SELECTION_PRICE.toFixed(2)} extra
                          </div>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
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
            )
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

  if (allSteps.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={MOBILE_FULLSCREEN_DIALOG_CLASS}>
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
                  toast({
                    title: "Added to cart",
                    description: `${item.name} has been added to your cart.`,
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
      <DialogContent className={MOBILE_FULLSCREEN_DIALOG_CLASS}>
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
        <div className="relative overflow-y-auto flex-1 px-4 sm:px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
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
