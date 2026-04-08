"use client"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Sparkles, Clock, Minus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Image from "next/image"
import { getProductImage } from "@/lib/product-images"
import { useState, useEffect, useMemo, type ReactNode } from "react"
import type { MenuItem, MenuCategory, CustomizationOption, CustomizationChoice } from "@/lib/types"
import { menuItemService, categoryService } from "@/lib/supabase/database"
import { productVariationsToCustomizations, defaultSelectionsForVariations } from "@/lib/product-variations"
import { createBrowserClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/lib/context/cart-context"
import { LoyaltyPointsEarnBadge } from "@/components/loyalty-points-earn-badge"
import { toast } from "@/hooks/use-toast"

// Fallback Power Bowl Options (used only if database has no customizations)
const FALLBACK_BASE_OPTIONS = [
  { id: "acai", name: "Açaí", priceModifier: 0 },
  { id: "pitaya", name: "Pitaya", priceModifier: 0 },
  { id: "oatmeal", name: "Oatmeal", priceModifier: 0 },
]

const FALLBACK_GRANOLA_OPTIONS = [
  { id: "granola", name: "Granola", priceModifier: 0 },
  { id: "no-granola", name: "No Granola", priceModifier: 0 },
  { id: "blueberry-flax", name: "Blueberry Flax", priceModifier: 0.5 },
]

const FALLBACK_FRUIT_OPTIONS = [
  { id: "banana", name: "Banana", priceModifier: 0 },
  { id: "blueberry", name: "Blueberry", priceModifier: 0 },
  { id: "kiwi", name: "Kiwi", priceModifier: 0 },
  { id: "pineapple", name: "Pineapple", priceModifier: 0 },
  { id: "strawberry", name: "Strawberry", priceModifier: 0 },
]

const ADD_TO_CART_FEEDBACK_MS = 450

const FALLBACK_BOOSTA_OPTIONS = [
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

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { addItem } = useCart()
  const productId = params?.id as string
  const [imageError, setImageError] = useState(false)
  const [product, setProduct] = useState<MenuItem | null>(null)
  const [category, setCategory] = useState<MenuCategory | null>(null)
  const [customizations, setCustomizations] = useState<(CustomizationOption & { choices: CustomizationChoice[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string[]>>(new Map())
  const [quantity, setQuantity] = useState(1)
  
  // Power Bowl specific states
  const [isPowerBowl, setIsPowerBowl] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  const [useFallbackPowerBowl, setUseFallbackPowerBowl] = useState(false)
  const [selectedBase, setSelectedBase] = useState<string>("")
  const [selectedGranola, setSelectedGranola] = useState<string>("")
  const [selectedFruits, setSelectedFruits] = useState<string[]>([])
  const [selectedBoostas, setSelectedBoostas] = useState<string[]>([])
  const [addingToCart, setAddingToCart] = useState(false)

  // Get Power Bowl customizations from database (converted to step format)
  const powerBowlSteps = useMemo(() => {
    if (!isPowerBowl || customizations.length === 0) return []
    
    return customizations.map((opt, index) => ({
      stepNumber: index + 1,
      optionId: opt.id,
      title: opt.option_name,
      subtitle: opt.is_required
        ? opt.option_type === "multiple"
          ? "Select at least one option"
          : "Select one option"
        : "Optional — skip or choose your preferences",
      type: opt.option_type,
      isRequired: opt.is_required,
      choices: opt.choices.map(ch => ({
        id: ch.id,
        name: ch.choice_name,
        priceModifier: ch.price_modifier || 0,
        isDefault: ch.is_default
      }))
    }))
  }, [isPowerBowl, customizations])

  // Total steps for Power Bowl (from database or fallback)
  const totalPowerBowlSteps = useMemo(() => {
    if (useFallbackPowerBowl) return 4
    return powerBowlSteps.length > 0 ? powerBowlSteps.length : 4
  }, [useFallbackPowerBowl, powerBowlSteps])

  // Fetch product, category, and customizations from database
  const fetchProductData = async () => {
    if (!productId) return
    try {
      setLoading(true)

      const fetchedProduct = await menuItemService.getById(productId)
      if (!fetchedProduct) {
        setLoading(false)
        return
      }

      setProduct(fetchedProduct)

      const itemName = fetchedProduct.name.toLowerCase()
      const categoryId = fetchedProduct.category_id || ""
      const isPowerBowlItem =
        itemName.includes("power bowl") ||
        categoryId === "cat-power-bowl"
      setIsPowerBowl(isPowerBowlItem)

      if (fetchedProduct.category_id) {
        const categories = await categoryService.getAll()
        const foundCategory = categories.find((cat) => cat.id === fetchedProduct.category_id)
        if (foundCategory) setCategory(foundCategory)
      }

      // All variations are stored in menu_items.variations (JSONB)
      const validCustomizations = productVariationsToCustomizations(fetchedProduct.variations)
      setCustomizations(validCustomizations)

      if (isPowerBowlItem && validCustomizations.length === 0) {
        console.log("⚠️ No Power Bowl variations (product API or DB), using fallback options")
        setUseFallbackPowerBowl(true)
      } else {
        setUseFallbackPowerBowl(false)
      }

      const defaultSelections = defaultSelectionsForVariations(fetchedProduct.variations)
      validCustomizations.forEach((option) => {
        if (defaultSelections.has(option.id)) return
        if (option.is_required && option.choices && option.choices.length > 0) {
          const defaultChoice = option.choices.find((ch: any) => ch.is_default) || option.choices[0]
          if (defaultChoice) defaultSelections.set(option.id, [defaultChoice.id])
        }
      })
      setSelectedOptions(defaultSelections)
    } catch (error) {
      console.error("Error fetching product data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [productId])

  // Supabase Realtime: re-fetch immediately when this product or its
  // customizations are updated from the dashboard
  useEffect(() => {
    if (!productId) return

    const supabase = createBrowserClient()

    const channel = supabase
      .channel(`product-detail-${productId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items", filter: `id=eq.${productId}` },
        () => {
          fetchProductData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId])

  const getImageUrl = () => {
    if (!product) return "/coffee-drink.png"
    if (!product.image_url || product.image_url.includes("placeholder")) {
      return getProductImage(product.name, product.category_id, category?.name)
    }
    return product.image_url
  }

  const handleImageError = () => {
    setImageError(true)
  }

  // Handle option selection
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

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!product) return 0
    let price = product.base_price || 0

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

    return price * quantity
  }, [product, selectedOptions, quantity, customizations])

  // Check if can add to cart (all required options selected)
  const canAddToCart = useMemo(() => {
    if (customizations.length === 0) return true
    const requiredCustomizations = customizations.filter((c) => c.is_required)
    if (requiredCustomizations.length === 0) return true
    return requiredCustomizations.every((c) => {
      const selections = selectedOptions.get(c.id)
      return selections && selections.length > 0
    })
  }, [customizations, selectedOptions])

  // Power Bowl handlers
  const handleNext = () => {
    if (currentStep < totalPowerBowlSteps) {
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
    } else if (selectedFruits.length < 3) {
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

  const canProceedPowerBowl = () => {
    if (useFallbackPowerBowl) {
      switch (currentStep) {
        case 1: return selectedBase !== ""
        case 2: return selectedGranola !== ""
        case 3: return selectedFruits.length === 3
        case 4: return true
        default: return false
      }
    }
    const step = powerBowlSteps[currentStep - 1]
    if (!step) return true
    const selections = selectedOptions.get(step.optionId) || []
    if (step.isRequired) {
      if (step.type === 'multiple') {
        const pick3Step = step.title.toLowerCase().includes('pick 3') || step.title.toLowerCase().includes('3 fruits')
        return pick3Step ? selections.length === 3 : selections.length > 0
      }
      return selections.length > 0
    }
    return true
  }

  const calculatePowerBowlPrice = () => {
    if (!product) return 0
    let price = product.base_price || 0

    if (useFallbackPowerBowl) {
      const base = FALLBACK_BASE_OPTIONS.find(b => b.id === selectedBase)
      if (base) price += base.priceModifier
      const granola = FALLBACK_GRANOLA_OPTIONS.find(g => g.id === selectedGranola)
      if (granola) price += granola.priceModifier
      selectedFruits.forEach(fruitId => {
        const fruit = FALLBACK_FRUIT_OPTIONS.find(f => f.id === fruitId)
        if (fruit) price += fruit.priceModifier
      })
      selectedBoostas.forEach(boostaId => {
        const boosta = FALLBACK_BOOSTA_OPTIONS.find(b => b.id === boostaId)
        if (boosta) price += boosta.priceModifier
      })
    } else {
      selectedOptions.forEach((choiceIds, optionId) => {
        const option = customizations.find(c => c.id === optionId)
        if (option) {
          choiceIds.forEach(choiceId => {
            const choice = option.choices.find(ch => ch.id === choiceId)
            if (choice) price += choice.price_modifier || 0
          })
        }
      })
    }

    return price * quantity
  }

  const getStepTitle = (): ReactNode => {
    if (useFallbackPowerBowl) {
      const title =
        currentStep === 1
          ? "Pick your Base"
          : currentStep === 2
            ? "Add Granola or Not"
            : currentStep === 3
              ? "Pick 3 Fruits"
              : currentStep === 4
                ? "Agaves Boosta"
                : ""
      const showRequired = currentStep >= 1 && currentStep <= 3
      return (
        <>
          {title}
          {showRequired && title && (
            <span className="text-destructive ml-0.5" aria-hidden>
              {" "}
              *
            </span>
          )}
        </>
      )
    }
    const step = powerBowlSteps[currentStep - 1]
    if (!step) return ""
    return (
      <>
        {step.title}
        {step.isRequired && (
          <span className="text-destructive ml-0.5" aria-hidden>
            {" "}
            *
          </span>
        )}
      </>
    )
  }

  const getStepSubtitle = () => {
    if (useFallbackPowerBowl) {
      switch (currentStep) {
        case 1: return "Choose your bowl base"
        case 2: return "Select your granola option"
        case 3: return `Select exactly 3 fruits (${selectedFruits.length}/3 selected)`
        case 4: return "Add optional boosts (multiple selections allowed)"
        default: return ""
      }
    }
    const step = powerBowlSteps[currentStep - 1]
    if (!step) return ""
    const selections = selectedOptions.get(step.optionId) || []
    const pick3 = step.title.toLowerCase().includes('pick 3') || step.title.toLowerCase().includes('3 fruits')
    if (pick3) return `Select exactly 3 fruits (${selections.length}/3 selected)`
    return step.subtitle
  }

  // Handle add to cart directly (no dialog)
  const handleAddToCart = async () => {
    if (!product || addingToCart) return
    setAddingToCart(true)
    try {
    if (isPowerBowl) {
      let customizationData: Array<{ optionId: string; optionName: string; choices: Array<{ id: string; name: string; priceModifier: number }> }>

      if (useFallbackPowerBowl) {
        customizationData = [
          {
            optionId: "base",
            optionName: "Base",
            choices: [{
              id: selectedBase,
              name: FALLBACK_BASE_OPTIONS.find(b => b.id === selectedBase)?.name || "",
              priceModifier: FALLBACK_BASE_OPTIONS.find(b => b.id === selectedBase)?.priceModifier || 0,
            }],
          },
          {
            optionId: "granola",
            optionName: "Granola",
            choices: [{
              id: selectedGranola,
              name: FALLBACK_GRANOLA_OPTIONS.find(g => g.id === selectedGranola)?.name || "",
              priceModifier: FALLBACK_GRANOLA_OPTIONS.find(g => g.id === selectedGranola)?.priceModifier || 0,
            }],
          },
          {
            optionId: "fruits",
            optionName: "Fruits",
            choices: selectedFruits.map(fruitId => {
              const fruit = FALLBACK_FRUIT_OPTIONS.find(f => f.id === fruitId)!
              return { id: fruitId, name: fruit.name, priceModifier: fruit.priceModifier }
            }),
          },
          ...(selectedBoostas.length > 0 ? [{
            optionId: "boostas",
            optionName: "Agaves Boosta",
            choices: selectedBoostas.map(boostaId => {
              const boosta = FALLBACK_BOOSTA_OPTIONS.find(b => b.id === boostaId)!
              return { id: boostaId, name: boosta.name, priceModifier: boosta.priceModifier }
            }),
          }] : []),
        ]
      } else {
        customizationData = Array.from(selectedOptions.entries())
          .map(([optionId, choiceIds]) => {
            const option = customizations.find(c => c.id === optionId)
            if (!option) return null
            return {
              optionId,
              optionName: option.option_name,
              choices: choiceIds
                .map(choiceId => {
                  const choice = option.choices.find(ch => ch.id === choiceId)
                  if (!choice) return null
                  return {
                    id: choice.id,
                    name: choice.choice_name,
                    priceModifier: choice.price_modifier || 0,
                  }
                })
                .filter(Boolean) as Array<{ id: string; name: string; priceModifier: number }>,
            }
          })
          .filter(Boolean) as typeof customizationData
      }

      addItem({
        id: `${product.id}-${Date.now()}`,
        menuItem: product,
        quantity: quantity,
        selectedCustomizations: customizationData,
        totalPrice: calculatePowerBowlPrice(),
      })
    } else {
      // Regular product customizations
      if (!canAddToCart) return

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

      addItem({
        id: `${product.id}-${Date.now()}`,
        menuItem: product,
        quantity: quantity,
        selectedCustomizations: customizationData,
        totalPrice: totalPrice,
      })
    }

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })

      await new Promise((r) => setTimeout(r, ADD_TO_CART_FEEDBACK_MS))
    } finally {
      setAddingToCart(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <header className="sticky top-0 z-20 border-b border-border backdrop-blur-md shadow-sm" style={{ backgroundColor: '#181511' }}>
          <div className="container mx-auto px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
            <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 shrink-0"
              >
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
              </Button>
              <Skeleton className="h-5 w-32" />
              <div className="w-7 sm:w-8 md:w-9 lg:w-10" />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8">
          <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <Skeleton className="w-full md:w-[30%] aspect-[4/3] md:min-h-[400px]" />
              <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => router.push("/menu")} className="bg-brand text-white hover:bg-brand-dark">
            Back to Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border backdrop-blur-md shadow-sm" style={{ backgroundColor: '#181511' }}>
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3">
          <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 shrink-0"
            >
              <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
            </Button>
            <h1 className="font-serif text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-foreground flex-1 text-center">
              Product Details
            </h1>
            <div className="w-7 sm:w-8 md:w-9 lg:w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8">
        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-stretch">
            {/* Product Image - 30% width on desktop */}
            <div className="relative w-full md:w-[30%] aspect-[4/3] md:aspect-auto md:min-h-[400px] lg:min-h-[500px] bg-muted overflow-hidden shrink-0">
              {!imageError ? (
                <Image
                  src={getImageUrl()}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={getImageUrl().startsWith("http")}
                  onError={handleImageError}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-muted">
                  <div className="text-center p-4">
                    <div className="text-6xl mb-4">☕</div>
                    <p className="text-sm text-muted-foreground">{product.name}</p>
                  </div>
                </div>
              )}
              {product.is_featured && (
                <Badge className="absolute right-2 top-2 sm:right-3 sm:top-3 md:right-4 md:top-4 bg-brand text-white shadow-md flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-2.5 py-1">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  Popular
                </Badge>
              )}
            </div>

            {/* Product Details - 70% width on desktop */}
            <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="mb-4 sm:mb-5 md:mb-6">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                {product.name}
              </h2>
              {category && (
                <Badge variant="outline" className="mb-2 sm:mb-3 text-xs sm:text-sm">
                  {category.name}
                </Badge>
              )}
              {product.description && (() => {
                // Clean description - remove any JSON-like content or debug strings
                let cleanDescription = product.description
                
                // Remove JSON patterns like [VARIATIONS:[...]] or [PRICES:{...}]
                cleanDescription = cleanDescription.replace(/\[VARIATIONS:.*?\]\]/g, '')
                cleanDescription = cleanDescription.replace(/\[PRICES:.*?\]/g, '')
                cleanDescription = cleanDescription.replace(/adsada\}?\]?/g, '')
                
                // Remove any remaining JSON-like structures
                cleanDescription = cleanDescription.replace(/\{.*?\}/g, '')
                cleanDescription = cleanDescription.replace(/\[.*?\]/g, '')
                
                // Trim and clean up extra spaces
                cleanDescription = cleanDescription.trim().replace(/\s+/g, ' ')
                
                // Only show if there's actual content left
                if (!cleanDescription || cleanDescription.length === 0) {
                  return null
                }
                
                return (
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground mb-3 sm:mb-4">
                    {cleanDescription}
                  </p>
                )
              })()}
              {category?.description && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed text-foreground">
                    {category.description}
                  </p>
                </div>
              )}
            </div>

            {/* Price and Prep Time */}
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 pb-4 sm:pb-5 md:pb-6 border-b border-border">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Price</p>
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand">
                  ${product.base_price.toFixed(2)}
                </p>
              </div>
              {product.prep_time_minutes && (
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Prep Time</p>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                      {product.prep_time_minutes} min
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2">
              <LoyaltyPointsEarnBadge
                points={(product.loyalty_points_earn ?? 0) * quantity}
                size="sm"
                variant="compact"
                context="product"
              />
            </div>

            {/* Power Bowl Step-by-Step Flow */}
            {isPowerBowl ? (
              <div className="mb-4 sm:mb-5 md:mb-6">
                {/* Step Header */}
                <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gradient-to-r from-amber-950/40 to-stone-900/90 dark:from-[#2a241c] dark:to-[#181511] rounded-lg border border-border">
                  <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                    Build your own POWER BOWL
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Step {currentStep} of {totalPowerBowlSteps}</p>
                      <p className="text-base sm:text-lg font-semibold text-brand mt-1">
                        {getStepTitle()}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {getStepSubtitle()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                      <p className="text-xl sm:text-2xl font-bold text-brand">
                        ${calculatePowerBowlPrice().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step Progress Indicator */}
                <div className="flex gap-1 mb-4 sm:mb-5">
                  {Array.from({ length: totalPowerBowlSteps }, (_, i) => i + 1).map((step) => (
                    <div
                      key={step}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        step <= currentStep ? "gradient-copper-gold" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Step Content */}
                <div className="space-y-4 sm:space-y-5">
                  {useFallbackPowerBowl ? (
                    <>
                      {currentStep === 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          {FALLBACK_BASE_OPTIONS.map((base) => (
                            <button
                              key={base.id}
                              onClick={() => setSelectedBase(base.id)}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                selectedBase === base.id
                                  ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                                  : "border-border hover:border-brand/50 hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-base sm:text-lg font-semibold">{base.name}</span>
                                {base.priceModifier > 0 && (
                                  <span className="text-sm text-muted-foreground">+${base.priceModifier.toFixed(2)}</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {currentStep === 2 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          {FALLBACK_GRANOLA_OPTIONS.map((granola) => (
                            <button
                              key={granola.id}
                              onClick={() => setSelectedGranola(granola.id)}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                selectedGranola === granola.id
                                  ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                                  : "border-border hover:border-brand/50 hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-base sm:text-lg font-semibold">{granola.name}</span>
                                {granola.priceModifier > 0 && (
                                  <span className="text-sm text-muted-foreground">+${granola.priceModifier.toFixed(2)}</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {currentStep === 3 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {FALLBACK_FRUIT_OPTIONS.map((fruit) => {
                            const isSelected = selectedFruits.includes(fruit.id)
                            const isDisabled = !isSelected && selectedFruits.length >= 3
                            return (
                              <button
                                key={fruit.id}
                                onClick={() => handleFruitToggle(fruit.id)}
                                disabled={isDisabled}
                                className={`p-3 sm:p-4 rounded-lg border-2 text-center transition-all ${
                                  isSelected
                                    ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                                    : isDisabled
                                      ? "border-border bg-muted/20 opacity-50 cursor-not-allowed"
                                      : "border-border hover:border-brand/50 hover:bg-muted/50"
                                }`}
                              >
                                <span className="text-base sm:text-lg font-semibold">{fruit.name}</span>
                                {isSelected && <div className="mt-1 text-brand text-sm">✓ Selected</div>}
                              </button>
                            )
                          })}
                        </div>
                      )}
                      {currentStep === 4 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {FALLBACK_BOOSTA_OPTIONS.map((boosta) => {
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
                                  <span className="text-sm sm:text-base font-semibold">{boosta.name}</span>
                                  {isSelected && <span className="text-brand text-sm">✓</span>}
                                </div>
                                <span className="text-xs text-muted-foreground">+${boosta.priceModifier.toFixed(2)}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    (() => {
                      const step = powerBowlSteps[currentStep - 1]
                      if (!step) return null
                      const choices = step.choices || []
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {choices.map((choice) => {
                            const selected = selectedOptions.get(step.optionId) || []
                            const isSelected = selected.includes(choice.id)
                            const pick3Step = step.title.toLowerCase().includes("pick 3") || step.title.toLowerCase().includes("3 fruits")
                            const isDisabled = pick3Step && !isSelected && selected.length >= 3
                            return (
                              <button
                                key={choice.id}
                                onClick={() => handleOptionChange(step.optionId, choice.id, step.type === "multiple")}
                                disabled={isDisabled}
                                className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all ${
                                  isSelected
                                    ? "border-brand bg-brand/10 dark:bg-brand/15 shadow-md"
                                    : isDisabled
                                      ? "border-border bg-muted/20 opacity-50 cursor-not-allowed"
                                      : "border-border hover:border-brand/50 hover:bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm sm:text-base font-semibold">{choice.name}</span>
                                  {choice.priceModifier > 0 && (
                                    <span className="text-xs sm:text-sm text-muted-foreground">+${choice.priceModifier.toFixed(2)}</span>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )
                    })()
                  )}
                </div>

                {/* Step Navigation */}
                <div className="flex items-center gap-3 mt-4 sm:mt-5">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                      size="lg"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  {currentStep < totalPowerBowlSteps ? (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceedPowerBowl()}
                      className="flex-1 bg-brand text-white hover:bg-brand-dark"
                      size="lg"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => void handleAddToCart()}
                      disabled={!canProceedPowerBowl() || addingToCart}
                      className="flex-1 bg-brand text-white hover:bg-brand-dark"
                      size="lg"
                    >
                      {addingToCart ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        `Add to Cart - $${calculatePowerBowlPrice().toFixed(2)}`
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Regular Variations Selection - Inline (WooCommerce Style) */
              <div className="mb-4 sm:mb-5 md:mb-6 space-y-4 sm:space-y-5">
                {customizations.length > 0 ? (
                  <>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground mb-3 sm:mb-4">
                      Product Options
                    </h3>
                    {customizations.map((option) => {
                      const selected = selectedOptions.get(option.id) || []
                      return (
                        <div key={option.id} className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
                          <div>
                            <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                              {option.option_name}
                              {option.is_required && <span className="text-error text-xs">*</span>}
                            </Label>
                            {!option.is_required && (
                              <p className="text-xs text-muted-foreground mt-1">Optional</p>
                            )}
                          </div>

                          {option.option_type === "single" ? (
                            <RadioGroup
                              value={selected[0] || ""}
                              onValueChange={(value) => handleOptionChange(option.id, value, false)}
                              className="mt-2"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {option.choices?.map((choice) => (
                                  <div
                                    key={choice.id}
                                    className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                      selected[0] === choice.id
                                        ? "border-brand bg-brand/10"
                                        : "border-border hover:border-brand/50 bg-background"
                                    }`}
                                    onClick={() => handleOptionChange(option.id, choice.id, false)}
                                  >
                                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                      <RadioGroupItem value={choice.id} id={choice.id} />
                                      <Label htmlFor={choice.id} className="font-normal text-sm sm:text-base cursor-pointer flex-1">
                                        {choice.choice_name}
                                      </Label>
                                    </div>
                                    {choice.price_modifier > 0 && (
                                      <span className="text-xs sm:text-sm font-semibold text-brand whitespace-nowrap ml-2">
                                        +${choice.price_modifier.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </RadioGroup>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-2">
                              {option.choices?.map((choice) => (
                                <div
                                  key={choice.id}
                                  className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                    selected.includes(choice.id)
                                      ? "border-brand bg-brand/10"
                                      : "border-border hover:border-brand/50 bg-background"
                                  }`}
                                  onClick={() => handleOptionChange(option.id, choice.id, true)}
                                >
                                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                    <Checkbox
                                      id={choice.id}
                                      checked={selected.includes(choice.id)}
                                      onCheckedChange={() => handleOptionChange(option.id, choice.id, true)}
                                    />
                                    <Label htmlFor={choice.id} className="font-normal text-sm sm:text-base cursor-pointer flex-1">
                                      {choice.choice_name}
                                    </Label>
                                  </div>
                                  {choice.price_modifier > 0 && (
                                    <span className="text-xs sm:text-sm font-semibold text-brand whitespace-nowrap ml-2">
                                      +${choice.price_modifier.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                ) : (
                  <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      No variations available for this product.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selection - Only for non-Power Bowl */}
            {!isPowerBowl && (
              <>
                <div className="mb-4 sm:mb-5 md:mb-6">
                  <Label className="text-sm sm:text-base font-semibold mb-2 block">Quantity</Label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 sm:h-9 sm:w-9"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-base sm:text-lg font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 sm:h-9 sm:w-9"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="mb-4 sm:mb-5 md:mb-6 pb-4 sm:pb-5 md:pb-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm sm:text-base font-semibold text-foreground">Total</p>
                    <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand">
                      ${totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Add to Cart Button - Direct (No Dialog) */}
                <Button
                  onClick={() => void handleAddToCart()}
                  disabled={!canAddToCart || addingToCart}
                  size="lg"
                  className="w-full bg-brand text-white hover:bg-brand-dark min-h-[48px] sm:min-h-[52px] md:min-h-[56px] text-sm sm:text-base md:text-lg font-semibold"
                >
                  {addingToCart ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Quantity for Power Bowl - Show on last step */}
            {isPowerBowl && currentStep === totalPowerBowlSteps && (
              <>
                <div className="mb-4 sm:mb-5 md:mb-6">
                  <Label className="text-sm sm:text-base font-semibold mb-2 block">Quantity</Label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 sm:h-9 sm:w-9"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-base sm:text-lg font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 sm:h-9 sm:w-9"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mb-4 sm:mb-5 md:mb-6 pb-4 sm:pb-5 md:pb-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm sm:text-base font-semibold text-foreground">Total</p>
                    <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand">
                      ${calculatePowerBowlPrice().toFixed(2)}
                    </p>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}
