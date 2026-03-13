"use client"

import { useState, useMemo, useEffect } from "react"
import type { MenuItem, CustomizationOption, CustomizationChoice, ComboOption, ComboItem } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus, Tag } from "lucide-react"
import { useCart } from "@/lib/context/cart-context"
import { CartSlideMenu } from "@/components/cart-slide-menu"
import { getCombosForItem, getComboItems, mockMenuItems } from "@/lib/mock-data"
import { LoyaltyPointsEarnBadge } from "@/components/loyalty-points-earn-badge"

interface CustomizeDialogProps {
  item: MenuItem
  customizations: (CustomizationOption & { choices: CustomizationChoice[] })[]
  categoryName?: string
  open: boolean
  onClose: () => void
}

export default function CustomizeDialog({ item, customizations, categoryName, open, onClose }: CustomizeDialogProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string[]>>(new Map())
  const [selectedCombos, setSelectedCombos] = useState<Set<string>>(new Set()) // Selected combo option IDs
  const [showCartMenu, setShowCartMenu] = useState(false)
  
  // Get available combos for this item
  const availableCombos = useMemo(() => getCombosForItem(item.id), [item.id])
  
  // Reset cart menu state when dialog closes
  useEffect(() => {
    if (!open) {
      setShowCartMenu(false)
    }
  }, [open])

  // Check if item is a liquid item (juices, shakes, drinks only - NO cakes, pastries, or baking items)
  const isLiquidItem = useMemo(() => {
    const category = (categoryName || "").toLowerCase()
    const itemName = item.name.toLowerCase()
    const categoryId = item.category_id || ""
    
    // Check by category_id first (most reliable)
    const isDrinkByCategoryId = 
      categoryId === "cat-beauty-drinks" || 
      categoryId === "cat-6" || categoryId === "cat-7" || categoryId === "cat-8" || categoryId === "cat-9" ||
      categoryId === "cat-specialty-drinks" || 
      categoryId === "cat-10" || categoryId === "cat-11" || categoryId === "cat-12" || categoryId === "cat-13" ||
      categoryId === "cat-kids-drinks" || 
      categoryId === "cat-14" || categoryId === "cat-15" ||
      categoryId === "cat-1" || // Meal Replacement Shakes
      categoryId === "cat-loaded-tea" || 
      categoryId === "cat-2" || categoryId === "cat-3" || categoryId === "cat-4" || categoryId === "cat-5" ||
      categoryId === "cat-coffee-bar" || // Coffee Bar
      categoryId === "cat-22" || categoryId === "cat-23" || categoryId === "cat-24" || categoryId === "cat-25" // Coffee Bar subcategories
    
    // Comprehensive list of solid food/baking items to EXCLUDE
    const isSolidFood = category.includes("pastry") || 
                       category.includes("pastries") ||
                       category.includes("cake") || 
                       category.includes("cakes") ||
                       category.includes("baking") ||
                       category.includes("baked") ||
                       category.includes("food") || 
                       category.includes("dessert") ||
                       category.includes("desserts") ||
                       category.includes("snack") ||
                       category.includes("snacks") ||
                       itemName.includes("cake") ||
                       itemName.includes("pastry") ||
                       itemName.includes("cookie") ||
                       itemName.includes("cookies") ||
                       itemName.includes("muffin") ||
                       itemName.includes("muffins") ||
                       itemName.includes("brownie") ||
                       itemName.includes("brownies") ||
                       itemName.includes("pie") ||
                       itemName.includes("bread") ||
                       itemName.includes("croissant") ||
                       itemName.includes("bagel") ||
                       itemName.includes("donut") ||
                       itemName.includes("doughnut")
    
    // Only allow size for specific liquid items: juices, shakes, drinks, teas, coffees
    const isLiquid = isDrinkByCategoryId ||
                      (category.includes("drink") || 
                      category.includes("drinks") ||
                      category.includes("juice") ||
                      category.includes("juices") ||
                      category.includes("shake") ||
                      category.includes("shakes") ||
                      category.includes("smoothie") ||
                      category.includes("smoothies") ||
                      category.includes("coffee") ||
                      category.includes("tea") ||
                      category.includes("espresso") ||
                      category.includes("latte") ||
                      itemName.includes("juice") ||
                      itemName.includes("shake") ||
                      itemName.includes("smoothie") ||
                      itemName.includes("latte") ||
                      itemName.includes("coffee") ||
                      itemName.includes("tea") ||
                      itemName.includes("espresso") ||
                      itemName.includes("americano") ||
                      itemName.includes("cappuccino") ||
                      itemName.includes("mocha") ||
                      itemName.includes("frappe") ||
                      itemName.includes("brew"))
    
    return isLiquid && !isSolidFood
  }, [categoryName, item.name, item.category_id])

  // Check if item is a drink or shake (for add-ons)
  // Specifically: Beauty Drinks, Specialty Drinks, Kids Drinks, Meal Replacement Shakes
  const isDrinkOrShake = useMemo(() => {
    const category = (categoryName || "").toLowerCase()
    const categoryId = item.category_id || ""
    
    // Check by category ID (most reliable)
    // Beauty Drinks: parent cat-beauty-drinks or subcategories cat-6, cat-7, cat-8, cat-9
    const isBeautyDrink = categoryId === "cat-beauty-drinks" || 
                          categoryId === "cat-6" || 
                          categoryId === "cat-7" || 
                          categoryId === "cat-8" || 
                          categoryId === "cat-9"
    
    // Specialty Drinks: parent cat-specialty-drinks or subcategories cat-10, cat-11, cat-12, cat-13
    const isSpecialtyDrink = categoryId === "cat-specialty-drinks" || 
                             categoryId === "cat-10" || 
                             categoryId === "cat-11" || 
                             categoryId === "cat-12" || 
                             categoryId === "cat-13"
    
    // Kids Drinks: parent cat-kids-drinks or subcategories cat-14, cat-15
    const isKidsDrink = categoryId === "cat-kids-drinks" || 
                        categoryId === "cat-14" || 
                        categoryId === "cat-15"
    
    // Meal Replacement Shakes: cat-1
    const isMealReplacementShake = categoryId === "cat-1"
    
    // Also check by category name as fallback
    const isBeautyByName = category.includes("beauty") && category.includes("drink")
    const isSpecialtyByName = category.includes("specialty") && category.includes("drink")
    const isKidsByName = category.includes("kids") && category.includes("drink")
    const isMealReplacementByName = category.includes("meal") && category.includes("replacement")
    
    return isBeautyDrink || isSpecialtyDrink || isKidsDrink || isMealReplacementShake ||
           isBeautyByName || isSpecialtyByName || isKidsByName || isMealReplacementByName
  }, [categoryName, item.category_id])

  // Filter out size options for non-liquid items and create size option for liquid items
  const enhancedCustomizations = useMemo(() => {
    // Determine which size options to add based on category (check this first)
    const categoryId = item.category_id || ""
    const category = (categoryName || "").toLowerCase()
    
    // Check for Beauty Drinks, Specialty Drinks, or Kids Drinks (Mini 24oz and Full 32oz)
    // Primary check: category_id (most reliable)
    const isBeautyOrSpecialtyOrKidsDrink = 
      categoryId === "cat-beauty-drinks" || 
      categoryId === "cat-6" || categoryId === "cat-7" || categoryId === "cat-8" || categoryId === "cat-9" ||
      categoryId === "cat-specialty-drinks" || 
      categoryId === "cat-10" || categoryId === "cat-11" || categoryId === "cat-12" || categoryId === "cat-13" ||
      categoryId === "cat-kids-drinks" || 
      categoryId === "cat-14" || categoryId === "cat-15" ||
      // Fallback: category name check
      (category.includes("beauty") && (category.includes("drink") || category.includes("drinks"))) ||
      (category.includes("specialty") && (category.includes("drink") || category.includes("drinks"))) ||
      (category.includes("kids") && (category.includes("drink") || category.includes("drinks")))
    
    // Check for Meal Replacement Shakes (24oz only)
    const isMealReplacementShake = categoryId === "cat-1" || 
                                    (category.includes("meal") && category.includes("replacement"))
    
    // Check for Loaded Tea (no size options)
    // Loaded Tea: parent cat-loaded-tea or subcategories cat-2, cat-3, cat-4, cat-5
    const isTea = categoryId === "cat-loaded-tea" || 
                   categoryId === "cat-2" || 
                   categoryId === "cat-3" || 
                   categoryId === "cat-4" || 
                   categoryId === "cat-5" ||
                   categoryId.startsWith("cat-loaded-") ||
                   (category.includes("loaded") && category.includes("tea"))
    
    // Check for Coffee Bar items (no size options)
    const isCoffeeBar = categoryId === "cat-coffee-bar" ||
                        categoryId === "cat-22" || // Blended Coffee
                        categoryId === "cat-23" || // Iced Coffee
                        categoryId === "cat-24" || // Hot Coffee
                        categoryId === "cat-25" || // Hot Tea
                        (category.includes("coffee") && category.includes("bar"))
    
    // Check for Beauty Drinks, Specialty Drinks, and Kids Drinks
    const isBeautyDrink = categoryId === "cat-beauty-drinks" || 
                          categoryId === "cat-6" || 
                          categoryId === "cat-7" || 
                          categoryId === "cat-8" || 
                          categoryId === "cat-9"
    
    const isSpecialtyDrink = categoryId === "cat-specialty-drinks" || 
                             categoryId === "cat-10" || 
                             categoryId === "cat-11" || 
                             categoryId === "cat-12" || 
                             categoryId === "cat-13"
    
    const isKidsDrink = categoryId === "cat-kids-drinks" || 
                        categoryId === "cat-14" || 
                        categoryId === "cat-15"
    
    const isBeautySpecialtyOrKidsDrink = isBeautyDrink || isSpecialtyDrink || isKidsDrink
    
    // First, filter out any existing "Size" customizations
    // Remove size options for:
    // 1. Non-liquid items
    // 2. Items that need auto-generated sizes (Beauty/Specialty/Kids Drinks, Meal Replacement Shakes)
    // 3. Loaded Tea (no size options)
    // Also remove "Sweetness" option for Beauty/Specialty/Kids Drinks
    let filtered = customizations.filter(c => {
      const isSizeOption = c.option_name.toLowerCase() === "size"
      const isAddonsOption = c.option_name.toLowerCase() === "add-ons" || c.option_name.toLowerCase() === "addons"
      const isSweetnessOption = c.option_name.toLowerCase() === "sweetness"
      
      // Remove size option if item is not a liquid item
      if (isSizeOption && !isLiquidItem) {
        return false
      }
      
      // Remove existing size options for items that need auto-generated sizes
      if (isSizeOption && (isBeautyOrSpecialtyOrKidsDrink || isMealReplacementShake)) {
        return false
      }
      
      // Remove size option for Loaded Tea
      if (isSizeOption && isTea) {
        return false
      }
      
      // Remove size option for Coffee Bar items
      if (isSizeOption && isCoffeeBar) {
        return false
      }
      
      // Remove "Sweetness" option for Beauty/Specialty/Kids Drinks
      if (isSweetnessOption && isBeautySpecialtyOrKidsDrink) {
        return false
      }
      
      // Remove existing add-ons option for drinks/shakes (we'll add our own)
      if (isAddonsOption && isDrinkOrShake) {
        return false
      }
      return true
    })
    
    // Check if size option exists after filtering
    const hasSizeOption = filtered.some(c => c.option_name.toLowerCase() === "size")
    
    // Add size option for liquid items
    // FORCE add correct size for Beauty/Specialty/Kids Drinks and Meal Replacement Shakes
    // Exclude Coffee Bar items and Loaded Tea
    if (isLiquidItem && !isTea && !isCoffeeBar && (isBeautyOrSpecialtyOrKidsDrink || isMealReplacementShake || !hasSizeOption)) {
      let sizeOption: CustomizationOption & { choices: CustomizationChoice[] }
      
      if (isBeautyOrSpecialtyOrKidsDrink) {
        // Mini (24oz) and Full (32oz) for Beauty Drinks, Specialty Drinks, and Kids Drinks
        sizeOption = {
          id: "auto-size-option",
          menu_item_id: item.id,
          option_name: "Size",
          option_type: "single",
          is_required: true,
          created_at: new Date().toISOString(),
          choices: [
            {
              id: "auto-size-mini",
              option_id: "auto-size-option",
              choice_name: "Mini (24oz)",
              price_modifier: 0,
              is_default: true,
              created_at: new Date().toISOString(),
            },
            {
              id: "auto-size-full",
              option_id: "auto-size-option",
              choice_name: "Full (32oz)",
              price_modifier: 0,
              is_default: false,
              created_at: new Date().toISOString(),
            },
          ],
        }
      } else if (isMealReplacementShake) {
        // 24oz only for Meal Replacement Shakes
        sizeOption = {
          id: "auto-size-option",
          menu_item_id: item.id,
          option_name: "Size",
          option_type: "single",
          is_required: true,
          created_at: new Date().toISOString(),
          choices: [
            {
              id: "auto-size-24oz",
              option_id: "auto-size-option",
              choice_name: "24oz",
              price_modifier: 0,
              is_default: true,
              created_at: new Date().toISOString(),
            },
          ],
        }
      } else {
        // Small, Medium, Large for other liquid items
        sizeOption = {
          id: "auto-size-option",
          menu_item_id: item.id,
          option_name: "Size",
          option_type: "single",
          is_required: true,
          created_at: new Date().toISOString(),
          choices: [
            {
              id: "auto-size-small",
              option_id: "auto-size-option",
              choice_name: "Small",
              price_modifier: 0,
              is_default: true,
              created_at: new Date().toISOString(),
            },
            {
              id: "auto-size-medium",
              option_id: "auto-size-option",
              choice_name: "Medium",
              price_modifier: 0.50,
              is_default: false,
              created_at: new Date().toISOString(),
            },
            {
              id: "auto-size-large",
              option_id: "auto-size-option",
              choice_name: "Large",
              price_modifier: 1.00,
              is_default: false,
              created_at: new Date().toISOString(),
            },
          ],
        }
      }
      
      filtered = [sizeOption, ...filtered]
    }
    
    // Add add-ons option for drinks and shakes
    if (isDrinkOrShake) {
      const hasAddonsOption = filtered.some(c => c.option_name.toLowerCase() === "add-ons" || c.option_name.toLowerCase() === "addons")
      if (!hasAddonsOption) {
        // Use original drinks add-in list for Beauty/Specialty/Kids Drinks
        // Otherwise use the protein shake add-ons for Meal Replacement Shakes
        const addonsOption: CustomizationOption & { choices: CustomizationChoice[] } = {
          id: "auto-addons-option",
          menu_item_id: item.id,
          option_name: "Add-ons",
          option_type: "multiple",
          is_required: false,
          created_at: new Date().toISOString(),
          choices: isBeautySpecialtyOrKidsDrink
            ? [
                // Original drinks add-in list: Whipped Cream, Caramel Drizzle, Vanilla Syrup, Honey
                {
                  id: "auto-addon-whip-cream",
                  option_id: "auto-addons-option",
                  choice_name: "Whipped Cream",
                  price_modifier: 0.5,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-caramel",
                  option_id: "auto-addons-option",
                  choice_name: "Caramel Drizzle",
                  price_modifier: 0.5,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-vanilla",
                  option_id: "auto-addons-option",
                  choice_name: "Vanilla Syrup",
                  price_modifier: 0.5,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-honey",
                  option_id: "auto-addons-option",
                  choice_name: "Honey",
                  price_modifier: 0.5,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
              ]
            : [
                // Protein shake and energy drink add-ons for Meal Replacement Shakes
                {
                  id: "auto-addon-lift-off",
                  option_id: "auto-addons-option",
                  choice_name: "Extra Lift off",
                  price_modifier: 2.50,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-nrg",
                  option_id: "auto-addons-option",
                  choice_name: "Extra NRG",
                  price_modifier: 1.00,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-tea",
                  option_id: "auto-addons-option",
                  choice_name: "Extra Tea",
                  price_modifier: 1.00,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-protein",
                  option_id: "auto-addons-option",
                  choice_name: "Extra Protein",
                  price_modifier: 2.00,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-defense",
                  option_id: "auto-addons-option",
                  choice_name: "Defense Tablet",
                  price_modifier: 1.50,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-immunity",
                  option_id: "auto-addons-option",
                  choice_name: "Immunity Booster",
                  price_modifier: 1.50,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-probiotic",
                  option_id: "auto-addons-option",
                  choice_name: "Probiotic",
                  price_modifier: 1.00,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-hibiscus",
                  option_id: "auto-addons-option",
                  choice_name: "Hibiscus Tea",
                  price_modifier: 1.00,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-green-tea",
                  option_id: "auto-addons-option",
                  choice_name: "Green Tea",
                  price_modifier: 1.00,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-whip-cream",
                  option_id: "auto-addons-option",
                  choice_name: "Whip Cream",
                  price_modifier: 0.00,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
                {
                  id: "auto-addon-prolessa",
                  option_id: "auto-addons-option",
                  choice_name: "Prolessa",
                  price_modifier: 5.00,
                  is_default: false,
                  created_at: new Date().toISOString(),
                },
              ],
        }
        
        filtered = [...filtered, addonsOption]
      }
    }
    
    return filtered
  }, [isLiquidItem, isDrinkOrShake, customizations, item.id, item.category_id, categoryName])

  // Reset selections when dialog opens/closes or item changes
  useEffect(() => {
    if (open) {
      setQuantity(1)
      setSelectedCombos(new Set())
      const newSelections = new Map<string, string[]>()
      
      // Auto-select default size based on category
      const hasSizeOption = enhancedCustomizations.some(c => c.option_name.toLowerCase() === "size")
      if (isLiquidItem && hasSizeOption) {
        const sizeOption = enhancedCustomizations.find(c => c.option_name.toLowerCase() === "size")
        if (sizeOption) {
          // Determine which default size to select
          const categoryId = item.category_id || ""
          const category = (categoryName || "").toLowerCase()
          
          const isBeautyOrSpecialtyOrKidsDrink = 
            categoryId === "cat-beauty-drinks" || 
            categoryId === "cat-6" || categoryId === "cat-7" || categoryId === "cat-8" || categoryId === "cat-9" ||
            categoryId === "cat-specialty-drinks" || 
            categoryId === "cat-10" || categoryId === "cat-11" || categoryId === "cat-12" || categoryId === "cat-13" ||
            categoryId === "cat-kids-drinks" || 
            categoryId === "cat-14" || categoryId === "cat-15" ||
            (category.includes("beauty") && category.includes("drink")) ||
            (category.includes("specialty") && category.includes("drink")) ||
            (category.includes("kids") && category.includes("drink"))
          
          const isMealReplacementShake = categoryId === "cat-1" || 
                                          (category.includes("meal") && category.includes("replacement"))
          
          let defaultChoice
          if (isBeautyOrSpecialtyOrKidsDrink) {
            // Select Mini (24oz) for Beauty/Specialty/Kids Drinks
            defaultChoice = sizeOption.choices.find(ch => ch.id === "auto-size-mini" || ch.choice_name.includes("Mini"))
          } else if (isMealReplacementShake) {
            // Select 24oz for Meal Replacement Shakes
            defaultChoice = sizeOption.choices.find(ch => ch.id === "auto-size-24oz" || ch.choice_name.includes("24oz"))
          } else {
            // Select Small for other liquid items
            defaultChoice = sizeOption.choices.find(ch => ch.choice_name.toLowerCase() === "small" || ch.id === "auto-size-small")
          }
          
          if (defaultChoice) {
            newSelections.set(sizeOption.id, [defaultChoice.id])
          }
        }
      }
      
      setSelectedOptions(newSelections)
    }
  }, [open, item.id, isLiquidItem, enhancedCustomizations])

  const handleOptionChange = (optionId: string, choiceId: string, isMultiple: boolean) => {
    const newSelections = new Map(selectedOptions)
    if (isMultiple) {
      const current = newSelections.get(optionId) || []
      if (current.includes(choiceId)) {
        newSelections.set(
          optionId,
          current.filter((id) => id !== choiceId),
        )
      } else {
        newSelections.set(optionId, [...current, choiceId])
      }
    } else {
      newSelections.set(optionId, [choiceId])
    }
    setSelectedOptions(newSelections)
  }

  // Calculate combo prices
  const comboPrices = useMemo(() => {
    let total = 0
    selectedCombos.forEach((comboId) => {
      const combo = availableCombos.find(c => c.id === comboId)
      if (combo) {
        const comboItems = getComboItems(comboId)
        comboItems.forEach((comboItem) => {
          const comboMenuItem = mockMenuItems.find(m => m.id === comboItem.menu_item_id)
          if (comboMenuItem) {
            let itemPrice = comboMenuItem.base_price
            // Apply discount
            if (combo.combo_price !== null) {
              itemPrice = combo.combo_price / comboItems.length
            } else if (combo.discount_type === "percentage" && combo.discount_value) {
              itemPrice = itemPrice * (1 - combo.discount_value / 100)
            } else if (combo.discount_type === "fixed" && combo.discount_value) {
              itemPrice = Math.max(0, itemPrice - combo.discount_value)
            }
            total += itemPrice * comboItem.quantity
          }
        })
      }
    })
    return total
  }, [selectedCombos, availableCombos])

  const totalPrice = useMemo(() => {
    let price = item.base_price
    selectedOptions.forEach((choiceIds, optionId) => {
      const option = enhancedCustomizations.find((c) => c.id === optionId)
      if (option) {
        choiceIds.forEach((choiceId) => {
          const choice = option.choices.find((ch) => ch.id === choiceId)
          if (choice) {
            price += choice.price_modifier
          }
        })
      }
    })
    return (price * quantity) + (comboPrices * quantity)
  }, [item.base_price, selectedOptions, quantity, enhancedCustomizations, comboPrices])

  const canAddToCart = useMemo(() => {
    return enhancedCustomizations
      .filter((c) => c.is_required)
      .every((c) => selectedOptions.has(c.id) && selectedOptions.get(c.id)!.length > 0)
  }, [enhancedCustomizations, selectedOptions])

  const handleComboToggle = (comboId: string) => {
    const newSelectedCombos = new Set(selectedCombos)
    if (newSelectedCombos.has(comboId)) {
      newSelectedCombos.delete(comboId)
    } else {
      newSelectedCombos.add(comboId)
    }
    setSelectedCombos(newSelectedCombos)
  }

  const handleAddToCart = () => {
    const customizationData = Array.from(selectedOptions.entries()).map(([optionId, choiceIds]) => {
      const option = enhancedCustomizations.find((c) => c.id === optionId)!
      return {
        optionId,
        optionName: option.option_name,
        choices: choiceIds.map((choiceId) => {
          const choice = option.choices.find((ch) => ch.id === choiceId)!
          return {
            id: choice.id,
            name: choice.choice_name,
            priceModifier: choice.price_modifier,
          }
        }),
      }
    })

    // Calculate main item price (without combos)
    let mainItemPrice = item.base_price
    selectedOptions.forEach((choiceIds, optionId) => {
      const option = enhancedCustomizations.find((c) => c.id === optionId)
      if (option) {
        choiceIds.forEach((choiceId) => {
          const choice = option.choices.find((ch) => ch.id === choiceId)
          if (choice) {
            mainItemPrice += choice.price_modifier
          }
        })
      }
    })

    // Add main item
    addItem({
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity,
      selectedCustomizations: customizationData,
      totalPrice: mainItemPrice * quantity,
    })

    // Add combo items
    selectedCombos.forEach((comboId) => {
      const combo = availableCombos.find(c => c.id === comboId)
      if (combo) {
        const comboItems = getComboItems(comboId)
        comboItems.forEach((comboItem) => {
          const comboMenuItem = mockMenuItems.find(m => m.id === comboItem.menu_item_id)
          if (comboMenuItem) {
            let itemPrice = comboMenuItem.base_price
            // Apply discount
            if (combo.combo_price !== null) {
              itemPrice = combo.combo_price / comboItems.length
            } else if (combo.discount_type === "percentage" && combo.discount_value) {
              itemPrice = itemPrice * (1 - combo.discount_value / 100)
            } else if (combo.discount_type === "fixed" && combo.discount_value) {
              itemPrice = Math.max(0, itemPrice - combo.discount_value)
            }
            
            addItem({
              id: `${comboMenuItem.id}-combo-${comboId}-${Date.now()}`,
              menuItem: comboMenuItem,
              quantity: comboItem.quantity * quantity,
              selectedCustomizations: [],
              totalPrice: itemPrice * comboItem.quantity * quantity,
            })
          }
        })
      }
    })

    onClose()
    setShowCartMenu(true)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl sm:text-2xl">{item.name}</DialogTitle>
          {item.description && (
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          )}
          {item.category_id === "cat-17" && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">Nutritional Information</p>
              <div className="space-y-1 text-xs sm:text-sm text-green-700 dark:text-green-300">
                <p className="font-semibold">LOW CARBS</p>
                <p>33g Protein</p>
                <p>230-260 Calories</p>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-5 sm:space-y-6 py-3 sm:py-4">
          {enhancedCustomizations.map((option) => (
            <div key={option.id} className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold">
                {option.option_name}
                {option.is_required && <span className="ml-1 text-error">*</span>}
              </Label>

              {option.option_type === "single" ? (
                <RadioGroup
                  value={selectedOptions.get(option.id)?.[0] || ""}
                  onValueChange={(value) => handleOptionChange(option.id, value, false)}
                >
                  {option.choices.map((choice) => (
                    <div key={choice.id} className="flex items-center justify-between space-x-2 py-1">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <RadioGroupItem value={choice.id} id={choice.id} className="flex-shrink-0" />
                        <Label htmlFor={choice.id} className="font-normal text-sm sm:text-base cursor-pointer">
                          {choice.choice_name}
                        </Label>
                      </div>
                      {choice.price_modifier > 0 && (
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          +${choice.price_modifier.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-1 sm:space-y-2">
                  {option.choices.map((choice) => (
                    <div key={choice.id} className="flex items-center justify-between space-x-2 py-1">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Checkbox
                          id={choice.id}
                          checked={selectedOptions.get(option.id)?.includes(choice.id) || false}
                          onCheckedChange={() => handleOptionChange(option.id, choice.id, true)}
                          className="flex-shrink-0"
                        />
                        <Label htmlFor={choice.id} className="font-normal text-sm sm:text-base cursor-pointer">
                          {choice.choice_name}
                        </Label>
                      </div>
                      {choice.price_modifier > 0 && (
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          +${choice.price_modifier.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Combo Options */}
          {availableCombos.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Combo Options
              </Label>
              <div className="space-y-2">
                {availableCombos.map((combo) => {
                  const comboItems = getComboItems(combo.id)
                  const comboMenuItem = comboItems.length > 0 
                    ? mockMenuItems.find(m => m.id === comboItems[0].menu_item_id)
                    : null
                  
                  let comboPrice = 0
                  if (comboMenuItem) {
                    comboPrice = comboMenuItem.base_price
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
                    <div
                      key={combo.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-brand bg-brand/10"
                          : "border-border hover:border-brand/50"
                      }`}
                      onClick={() => handleComboToggle(combo.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleComboToggle(combo.id)}
                              className="flex-shrink-0"
                            />
                            <Label className="font-semibold text-sm sm:text-base cursor-pointer">
                              {combo.name}
                            </Label>
                          </div>
                          {combo.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground ml-6">
                              {combo.description}
                            </p>
                          )}
                          {comboMenuItem && (
                            <p className="text-xs sm:text-sm text-muted-foreground ml-6 mt-1">
                              Includes: {comboMenuItem.name}
                            </p>
                          )}
                        </div>
                        {comboMenuItem && (
                          <span className="text-sm sm:text-base font-semibold whitespace-nowrap">
                            +${comboPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-semibold">Quantity</Label>
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
        </div>

        <div className="border-t pt-3 sm:pt-4 space-y-3">
          <div className="flex justify-center">
            <LoyaltyPointsEarnBadge amount={totalPrice} size="sm" variant="full" />
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="w-full bg-brand text-white hover:bg-brand-dark min-h-[48px] sm:min-h-[44px]"
            size="lg"
          >
            Add to Cart - ${totalPrice.toFixed(2)}
          </Button>
        </div>
      </DialogContent>
      <CartSlideMenu open={showCartMenu} onOpenChange={setShowCartMenu}>
        <div style={{ display: 'none' }} />
      </CartSlideMenu>
    </Dialog>
  )
}
