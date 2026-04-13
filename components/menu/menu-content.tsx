"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import type { MenuItem, MenuCategory, CustomizationOption, CustomizationChoice } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Coffee, ArrowLeft, Search, Grid3x3, List, SlidersHorizontal, X, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { useCart } from "@/lib/context/cart-context"
import { Input } from "@/components/ui/input"
import MenuItemCard from "@/components/menu/menu-item-card"
import MenuItemListCard from "@/components/menu/menu-item-list-card"
import CustomizeDialog from "@/components/menu/customize-dialog"
import PowerBowlCustomizeDialog from "@/components/menu/power-bowl-customize-dialog"
import { CartSlideMenu } from "@/components/cart-slide-menu"
import { LoyaltyPointsDisplay } from "@/components/loyalty-points-display"
import Link from "next/link"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { toast } from "@/hooks/use-toast"

interface MenuContentProps {
  menuData: {
    categories: MenuCategory[]
    menuItems: MenuItem[]
    customizations: (CustomizationOption & { choices: CustomizationChoice[] })[]
  }
}

type ViewMode = "grid" | "list"
type SortOption = "featured" | "name" | "price-low" | "price-high"

interface MenuContentProps {
  menuData: {
    categories: MenuCategory[]
    menuItems: MenuItem[]
    customizations: (CustomizationOption & { choices: CustomizationChoice[] })[]
  }
  onRefresh?: () => void
}

const ADD_TO_CART_FEEDBACK_MS = 450

export default function MenuContent({ menuData, onRefresh }: MenuContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { getItemCount, getTotal, addItem } = useCart()
  const categoryFromUrl = searchParams?.get("category")
  // IMPORTANT: Always start with null to show ALL items by default (no filter)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null) // For scroll spy highlight only

  // Update selectedCategory when URL param changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
      setHighlightedCategory(null) // Clear highlight when category is selected
      console.log('📂 Category from URL:', categoryFromUrl, '- Filtering by category')
      // Scroll to the category tab after a brief delay to ensure DOM is ready
      setTimeout(() => {
        const container = categoryTabsContainerRef.current
        if (container) {
          const targetButton = container.querySelector(`[data-category-button="${categoryFromUrl}"]`) as HTMLElement
          if (targetButton && container) {
            // Calculate scroll to move button to left edge
            const containerScrollLeft = container.scrollLeft
            const containerRect = container.getBoundingClientRect()
            const buttonRect = targetButton.getBoundingClientRect()
            
            // Distance from button's left to container's left viewport
            const distanceFromLeft = buttonRect.left - containerRect.left
            
            // New scroll position to align button at left edge
            const newScrollLeft = containerScrollLeft + distanceFromLeft
            
            container.scrollTo({
              left: newScrollLeft,
              behavior: "smooth"
            })
          }
        }
      }, 200)
    } else {
      // No category in URL - show all items
      setSelectedCategory(null)
      console.log('📂 No category selected - showing all items')
    }
  }, [categoryFromUrl])

  const [searchQuery, setSearchQuery] = useState("")
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null)
  const [powerBowlItem, setPowerBowlItem] = useState<MenuItem | null>(null)
  const [expandedParentCategory, setExpandedParentCategory] = useState<string | null>(null)
  const [hoveredParentCategory, setHoveredParentCategory] = useState<string | null>(null)
  const [isCartMenuOpen, setIsCartMenuOpen] = useState(false)
  const [addingItemId, setAddingItemId] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const [sortBy, setSortBy] = useState<SortOption>("featured")
  // Calculate max price from all items to set proper price range
  const maxPrice = useMemo(() => {
    if (menuData.menuItems.length === 0) return 500
    const max = Math.max(...menuData.menuItems.map(item => item.base_price || 0))
    return Math.ceil(max) + 50 // Add buffer
  }, [menuData.menuItems])
  
  // Initialize price range with maxPrice (will update when maxPrice changes)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  
  // Update price range when maxPrice changes to ensure all items are visible
  useEffect(() => {
    if (maxPrice > 0) {
      // Always set to full range to show all products by default
      setPriceRange([0, maxPrice])
      console.log('💰 Price range set to show all items:', [0, maxPrice], 'Max item price:', maxPrice)
    }
  }, [maxPrice])
  const [filterOpen, setFilterOpen] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const isScrollingRef = useRef(false)
  const categoryTabsContainerRef = useRef<HTMLDivElement | null>(null)

  const isQRScan = searchParams?.get("qr") === "scan"

  // Get parent categories (categories with no parent_id)
  const parentCategories = useMemo(() => {
    const parents = menuData.categories
      .filter((cat) => !cat.parent_id && cat.is_active !== false)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    
    console.log('📂 Parent Categories:', parents.map(c => ({ id: c.id, name: c.name, display_order: c.display_order })))
    return parents
  }, [menuData.categories])

  // Get subcategories for each parent
  const getSubcategories = (parentId: string) => {
    return menuData.categories
      .filter((cat) => cat.parent_id === parentId)
      .sort((a, b) => a.display_order - b.display_order)
  }

  // Get category name for display (parent or subcategory)
  const getCategoryDisplayName = (categoryId: string | null) => {
    if (!categoryId) return "All Items"
    const category = menuData.categories.find((c) => c.id === categoryId)
    if (!category) return "All Items"
    // If it's a subcategory, show parent name - subcategory name
    if (category.parent_id) {
      const parent = menuData.categories.find((c) => c.id === category.parent_id)
      return parent ? `${parent.name} - ${category.name}` : category.name
    }
    return category.name
  }

  // Check if item is a Loaded Tea item
  const isLoadedTeaItem = (item: MenuItem) => {
    const categoryId = item.category_id || ""
    // Check if it's Loaded Tea parent category or any of its subcategories
    return categoryId === "cat-loaded-tea" || 
           categoryId === "cat-2" || 
           categoryId === "cat-3" || 
           categoryId === "cat-4" || 
           categoryId === "cat-5" ||
           categoryId.startsWith("cat-loaded-")
  }

  // Check if item is a Power Bowl item
  const isPowerBowlItem = (item: MenuItem) => {
    const itemName = item.name.toLowerCase()
    const categoryId = item.category_id || ""
    // Keep this strict: "build your own" can exist in non-power-bowl products (e.g. waffles).
    return itemName.includes("power bowl") || 
           categoryId === "cat-power-bowl"
  }

  // Handle add to cart - check if item has customizations from database
  const handleAddToCart = async (item: MenuItem) => {
    if (isPowerBowlItem(item)) {
      // Prefer API variations (single source of truth); legacy dialog only if JSON is empty
      if (Array.isArray(item.variations) && item.variations.length > 0) {
        setCustomizeItem(item)
      } else {
        setPowerBowlItem(item)
      }
    } else if (isLoadedTeaItem(item)) {
      setAddingItemId(item.id)
      try {
        const cartItem = {
          id: `${item.id}-${Date.now()}`,
          menuItem: item,
          quantity: 1,
          selectedCustomizations: [],
          totalPrice: item.base_price || 0,
        }
        addItem(cartItem)
        toast({
          title: "Added to cart",
          description: `${item.name} has been added to your cart.`,
        })
        await new Promise((r) => setTimeout(r, ADD_TO_CART_FEEDBACK_MS))
      } finally {
        setAddingItemId(null)
      }
    } else {
      // ALWAYS open customize dialog (pehle wala behavior restore)
      // Dialog will show ONLY database variations (no auto-generated ones)
      console.log('🔄 Opening customize dialog for product:', item.id)
      setCustomizeItem(item)
    }
  }

  const filteredItems = useMemo(() => {
    // Start with ALL menu items (no filters applied initially)
    let items = menuData.menuItems || []

    // Debug: Log total items
    console.log('📦 Total menu items:', items.length)

    // Filter by category (only if category is selected)
    if (selectedCategory) {
      const category = menuData.categories.find((c) => c.id === selectedCategory)
      if (category) {
        // If it's a parent category, show all items from all subcategories
        if (!category.parent_id) {
          const subcategories = getSubcategories(selectedCategory)
          if (subcategories.length > 0) {
            // Parent category: show all items from all subcategories
            const subcategoryIds = subcategories.map((sub) => sub.id)
            items = items.filter((item) => item.category_id && subcategoryIds.includes(item.category_id))
          } else {
            // Parent category with no subcategories: show items directly
            items = items.filter((item) => item.category_id === selectedCategory)
          }
        } else {
          // Subcategory: show items from this subcategory only
          items = items.filter((item) => item.category_id === selectedCategory)
        }
        console.log('📂 After category filter:', items.length)
      }
    }

    // Filter by search query (only if search query exists)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) => item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query),
      )
      console.log('🔍 After search filter:', items.length)
    }

    // Filter by featured (only if featured filter is ON)
    if (showFeaturedOnly) {
      items = items.filter((item) => item.is_featured)
      console.log('⭐ After featured filter:', items.length)
    }

    // Filter by price range (ensure all items are within range)
    // Only filter if price range is not the default (0 to maxPrice)
    const beforePriceFilter = items.length
    // Check if it's default range: [0, maxPrice] or if maxPrice is 0/not calculated, check if range covers all items
    const isDefaultPriceRange = (priceRange[0] === 0 && maxPrice > 0 && priceRange[1] >= maxPrice) || 
                                (priceRange[0] === 0 && maxPrice === 0 && priceRange[1] >= 500)
    if (!isDefaultPriceRange) {
      items = items.filter((item) => {
        const price = item.base_price || 0
        return price >= priceRange[0] && price <= priceRange[1]
      })
      if (beforePriceFilter !== items.length) {
        console.log('💰 After price filter:', items.length, `(removed ${beforePriceFilter - items.length} items)`)
        console.log('💰 Price range:', priceRange, 'Max price:', maxPrice, 'Is default:', isDefaultPriceRange)
      }
    } else {
      console.log('💰 Price filter skipped (default range):', priceRange, 'Max price:', maxPrice)
    }

    // Sort items
    switch (sortBy) {
      case "featured":
        items = [...items].sort((a, b) => {
          if (a.is_featured === b.is_featured) return 0
          return a.is_featured ? -1 : 1
        })
        break
      case "name":
        items = [...items].sort((a, b) => a.name.localeCompare(b.name))
        break
      case "price-low":
        items = [...items].sort((a, b) => a.base_price - b.base_price)
        break
      case "price-high":
        items = [...items].sort((a, b) => b.base_price - a.base_price)
        break
    }

    console.log('✅ Final filtered items:', items.length)
    
    // Summary log for debugging
    const activeFilters = []
    if (selectedCategory) activeFilters.push(`Category: ${selectedCategory}`)
    if (searchQuery && searchQuery.trim()) activeFilters.push(`Search: "${searchQuery}"`)
    if (showFeaturedOnly) activeFilters.push('Featured Only')
    if (!isDefaultPriceRange) activeFilters.push(`Price: $${priceRange[0]}-$${priceRange[1]}`)
    
    if (activeFilters.length === 0) {
      console.log('📊 NO FILTERS ACTIVE - Showing ALL products:', items.length, 'out of', menuData.menuItems.length)
    } else {
      console.log('📊 Active filters:', activeFilters.join(', '), '- Showing', items.length, 'items')
    }
    
    return items
  }, [selectedCategory, searchQuery, menuData.menuItems, sortBy, priceRange, showFeaturedOnly, maxPrice])

  // Group items by category when showing all items or a parent category
  const groupedItems = useMemo(() => {
    // Check if selected category is a parent category
    const selectedCat = selectedCategory ? menuData.categories.find((c) => c.id === selectedCategory) : null
    const isParentCategorySelected = selectedCat && !selectedCat.parent_id
    
    // Don't group when a subcategory is selected (show items directly)
    if (selectedCategory && !isParentCategorySelected) {
      return null
    }

    // Get categories to display: all parent categories if no selection, or just the selected parent category
    const categoriesToDisplay = isParentCategorySelected 
      ? [selectedCat!] 
      : parentCategories.sort((a, b) => a.display_order - b.display_order)
    
    // Group filtered items by category_id
    const itemsByCategory: { [key: string]: MenuItem[] } = {}
    const uncategorizedItems: MenuItem[] = []
    
    filteredItems.forEach((item) => {
      const catId = item.category_id
      if (catId) {
        // Check if category exists in our categories list
        const categoryExists = menuData.categories.some(c => c.id === catId)
        if (categoryExists) {
          if (!itemsByCategory[catId]) {
            itemsByCategory[catId] = []
          }
          itemsByCategory[catId].push(item)
        } else {
          // Category doesn't exist, add to uncategorized
          uncategorizedItems.push(item)
          console.warn(`⚠️ Product "${item.name}" has category_id "${catId}" that doesn't exist in categories`)
        }
      } else {
        // No category_id, add to uncategorized
        uncategorizedItems.push(item)
      }
    })
    
    // Log for debugging
    console.log('📊 Grouped Items Debug:', {
      totalFilteredItems: filteredItems.length,
      itemsByCategoryCount: Object.keys(itemsByCategory).length,
      itemsInCategories: Object.values(itemsByCategory).reduce((sum, arr) => sum + arr.length, 0),
      uncategorizedCount: uncategorizedItems.length,
      categoriesToDisplay: categoriesToDisplay.length,
      itemsByCategory: Object.keys(itemsByCategory).map(catId => {
        const cat = menuData.categories.find(c => c.id === catId)
        return {
          categoryId: catId,
          categoryName: cat?.name || 'Unknown',
          itemCount: itemsByCategory[catId].length
        }
      })
    })

    // Create sections grouped by parent category
    const result: Array<{ category: MenuCategory; items: MenuItem[]; isParent: boolean }> = []
    
    categoriesToDisplay.forEach((parentCategory) => {
      const subcategories = getSubcategories(parentCategory.id)
      
      if (subcategories.length > 0) {
        // Parent with subcategories: show parent heading only (no items), then subcategory headings with items
        result.push({
          category: parentCategory,
          items: [], // Parent categories show no items, only heading
          isParent: true
        })
        
        // Then add subcategory sections with their items
        subcategories.forEach((subcategory) => {
          const subcategoryItems = itemsByCategory[subcategory.id] || []
          if (subcategoryItems.length > 0) {
            result.push({
              category: subcategory,
              items: subcategoryItems,
              isParent: false
            })
          }
        })
      } else {
        // Parent without subcategories: show parent with its direct items
        const parentItems = itemsByCategory[parentCategory.id] || []
        if (parentItems.length > 0) {
          result.push({
            category: parentCategory,
            items: parentItems,
            isParent: true
          })
        }
      }
    })
    
    // Add uncategorized items at the end if any
    if (uncategorizedItems.length > 0) {
      console.log(`⚠️ Found ${uncategorizedItems.length} products without valid categories - showing them`)
      // Create a temporary category for uncategorized items
      const uncategorizedCategory: MenuCategory = {
        id: 'uncategorized',
        name: 'Other Items',
        description: null,
        is_active: true,
        display_order: 9999,
        parent_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      result.push({
        category: uncategorizedCategory,
        items: uncategorizedItems,
        isParent: true
      })
    }

    console.log('✅ Final grouped items result:', {
      totalGroups: result.length,
      totalItems: result.reduce((sum, group) => sum + group.items.length, 0),
      groupsWithItems: result.filter(g => g.items.length > 0).length,
      groups: result.map(g => ({
        category: g.category.name,
        categoryId: g.category.id,
        itemCount: g.items.length,
        isParent: g.isParent,
        hasSubcategories: getSubcategories(g.category.id).length > 0
      }))
    })

    return result
  }, [filteredItems, selectedCategory, menuData.categories, parentCategories, getSubcategories])

  // Scroll spy: highlight category tab when section heading is at top (fast and responsive)
  useEffect(() => {
    // Only highlight when showing all items (selectedCategory is null)
    if (selectedCategory || !groupedItems || groupedItems.length === 0) {
      setHighlightedCategory(null)
      return
    }

    // Wait for DOM to be ready
    const timeoutId = setTimeout(() => {
      const observerOptions = {
        root: null,
        rootMargin: "-200px 0px -60% 0px", // Top margin matches header height
        threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5], // More thresholds for faster detection
      }

      let lastCategoryId: string | null = null

      const observer = new IntersectionObserver((entries) => {
        // Don't update during programmatic scrolling
        if (isScrollingRef.current) return

        // Immediate update - no debounce for fast scrolling
        // Find all visible sections
        const visibleSections = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({
            element: e.target,
            categoryId: e.target.getAttribute("data-category-id"),
            top: e.boundingClientRect.top,
            ratio: e.intersectionRatio,
          }))
          .filter((s) => s.categoryId && s.categoryId !== "uncategorized" && s.categoryId !== "all")

        if (visibleSections.length > 0) {
          // Find section heading that's at the top (around 200px - header area)
          // Priority: heading closest to 200px from top
          const topSection = visibleSections
            .filter((s) => s.top >= 180 && s.top <= 250) // Narrower range for top position
            .sort((a, b) => {
              // Closest to 200px wins
              const aDistance = Math.abs(a.top - 200)
              const bDistance = Math.abs(b.top - 200)
              return aDistance - bDistance
            })[0]

          // If no section in top range, check for any section above 300px
          const bestSection = topSection || visibleSections
            .filter((s) => s.top < 300 && s.ratio > 0.1)
            .sort((a, b) => {
              // Prefer sections closer to top
              if (a.top < 250 && b.top < 250) {
                return a.top - b.top
              }
              return a.top - b.top
            })[0]

          if (bestSection && bestSection.categoryId !== lastCategoryId) {
            lastCategoryId = bestSection.categoryId
            setHighlightedCategory(bestSection.categoryId)
          }
        }
      }, observerOptions)

      // Observe all category section headings
      Object.values(categoryRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref)
      })

      return () => {
        observer.disconnect()
      }
    }, 500) // Reduced delay for faster setup

    return () => {
      clearTimeout(timeoutId)
    }
  }, [groupedItems, selectedCategory])

  // Scroll category tabs horizontally to show highlighted/selected tab at the left edge
  useEffect(() => {
    if (!categoryTabsContainerRef.current) return

    // Use setTimeout to ensure DOM is fully updated after state changes
    const timeoutId = setTimeout(() => {
      const container = categoryTabsContainerRef.current
      if (!container) return

      // Determine which button to scroll to
      let targetButton: HTMLElement | null = null
      
      if (selectedCategory) {
        // If a category is selected, scroll to that category button
        targetButton = container.querySelector(`[data-category-button="${selectedCategory}"]`) as HTMLElement
      } else if (highlightedCategory) {
        // If a category is highlighted (scroll spy), scroll to that button
        targetButton = container.querySelector(`[data-category-button="${highlightedCategory}"]`) as HTMLElement
      } else {
        // If "All Items" is selected, scroll to "All Items" button
        targetButton = container.querySelector(`[data-category-button="all"]`) as HTMLElement
      }

      if (targetButton && container) {
        // Use requestAnimationFrame to ensure layout is complete
        requestAnimationFrame(() => {
          const containerScrollLeft = container.scrollLeft
          const containerRect = container.getBoundingClientRect()
          const buttonRect = targetButton!.getBoundingClientRect()
          
          // Calculate the distance from button's left edge to container's left edge
          const distanceFromLeft = buttonRect.left - containerRect.left
          
          // Calculate new scroll position: current scroll + distance to move button to left edge
          const newScrollLeft = containerScrollLeft + distanceFromLeft
          
          // Scroll to position button at the left edge
          container.scrollTo({
            left: newScrollLeft,
            behavior: "smooth"
          })
        })
      }
    }, 200) // Delay to ensure DOM and styles are fully updated

    return () => clearTimeout(timeoutId)
  }, [selectedCategory, highlightedCategory])

  // Handle category button click - scroll to section or filter items
  const handleCategoryClick = (categoryId: string | null) => {
    // Disable scroll spy during programmatic scrolling
    isScrollingRef.current = true
    setHighlightedCategory(null) // Clear highlight when clicking
    setCategoriesExpanded(false) // Collapse categories when user selects
    
    // Update URL with category parameter
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    
    // Update URL without page reload
    const newUrl = params.toString() ? `/menu?${params.toString()}` : '/menu'
    router.push(newUrl)
    
    // Immediately scroll the category tab to the left edge (works for all tabs including "All Items")
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = categoryTabsContainerRef.current
        if (container) {
          let targetButton: HTMLElement | null = null
          
          if (categoryId === null) {
            // Scroll to "All Items" button
            targetButton = container.querySelector(`[data-category-button="all"]`) as HTMLElement
          } else {
            // Scroll to category button
            targetButton = container.querySelector(`[data-category-button="${categoryId}"]`) as HTMLElement
          }
          
          if (targetButton && container) {
            // Calculate scroll to move button to left edge
            const containerScrollLeft = container.scrollLeft
            const containerRect = container.getBoundingClientRect()
            const buttonRect = targetButton.getBoundingClientRect()
            
            // Distance from button's left to container's left viewport
            const distanceFromLeft = buttonRect.left - containerRect.left
            
            // New scroll position to align button at left edge
            const newScrollLeft = containerScrollLeft + distanceFromLeft
            
            container.scrollTo({
              left: newScrollLeft,
              behavior: "smooth"
            })
          }
        }
      })
    })
    
    if (categoryId === null) {
      // For "All Items" - show all sections, don't filter
      setSelectedCategory(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      // For specific category - filter items and scroll to that section
      setSelectedCategory(categoryId)
      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = categoryRefs.current[categoryId]
          if (element) {
            const headerOffset = 200
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            window.scrollTo({
              top: Math.max(0, elementPosition - headerOffset),
              behavior: "smooth",
            })
          }
        }, 100)
      })
    }

    // Re-enable scroll spy after scrolling completes
    setTimeout(() => {
      isScrollingRef.current = false
    }, 3000)
  }

  const getCategoryStyle = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes("coffee")) return { color: "gradient-copper-gold text-white" }
    if (name.includes("tea")) return { color: "gradient-copper-gold text-white" }
    if (name.includes("protein")) return { color: "gradient-copper-gold text-white" }
    return { color: "gradient-copper-gold text-white" }
  }

  const resetFilters = () => {
    console.log('🔄 Resetting all filters...')
    setSortBy("featured")
    // Use dynamic maxPrice, fallback to 500 if not calculated yet
    const resetMaxPrice = maxPrice > 0 ? maxPrice : 500
    setPriceRange([0, resetMaxPrice])
    setShowFeaturedOnly(false)
    setSearchQuery("") // Reset search query
    // Only reset category if not from URL
    if (!categoryFromUrl) {
      setSelectedCategory(null) // Show all items
      console.log('📂 Category reset to null (show all items)')
    }
    console.log('✅ Filters reset. Price range:', [0, resetMaxPrice], 'Max price:', resetMaxPrice)
  }

  // Check if any filters are active (excluding default values)
  const hasActiveFilters = useMemo(() => {
    const hasNonDefaultSort = sortBy !== "featured"
    const hasNonDefaultPrice = priceRange[0] !== 0 || priceRange[1] !== maxPrice
    const hasFeaturedFilter = showFeaturedOnly
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0
    const hasCategoryFilter = selectedCategory !== null && selectedCategory !== categoryFromUrl
    
    const active = hasNonDefaultSort || hasNonDefaultPrice || hasFeaturedFilter || hasSearchQuery || hasCategoryFilter
    console.log('🔍 Active filters check:', {
      hasNonDefaultSort,
      hasNonDefaultPrice,
      hasFeaturedFilter,
      hasSearchQuery,
      hasCategoryFilter,
      active
    })
    return active
  }, [sortBy, priceRange, maxPrice, showFeaturedOnly, searchQuery, selectedCategory, categoryFromUrl])

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-20 border-b border-border backdrop-blur-md shadow-sm" style={{ backgroundColor: '#181511' }}>
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2">
          <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-0 flex-1">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 shrink-0">
                  <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 min-w-0">
                <div className="relative h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Druids Nutrition Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-serif text-xs sm:text-sm md:text-base lg:text-lg font-bold text-foreground truncate">Our Menu</span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              <LoyaltyPointsDisplay />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (onRefresh) {
                    onRefresh()
                  } else {
                    window.location.reload()
                  }
                }}
                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 shrink-0"
                title="Refresh Menu to see new products"
              >
                <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              </Button>
              <CartSlideMenu open={isCartMenuOpen} onOpenChange={setIsCartMenuOpen}>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 bg-transparent shrink-0"
                >
                  <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  {getItemCount() > 0 && (
                    <Badge className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:min-w-[20px] rounded-full gradient-copper-gold px-0.5 sm:px-1 text-[10px] sm:text-xs text-white">
                      {getItemCount()}
                    </Badge>
                  )}
                </Button>
              </CartSlideMenu>
            </div>
          </div>

          <div className="mt-1 sm:mt-1.5 md:mt-2 relative">
            <Search className="absolute left-2 sm:left-2.5 md:left-3 top-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 sm:h-9 md:h-10 lg:h-11 pl-7 sm:pl-8 md:pl-10 bg-muted/50 border-border text-xs sm:text-sm md:text-base"
            />
          </div>
        </div>

        <div className="container mx-auto px-2 sm:px-3 md:px-4 pb-0.5 sm:pb-1 md:pb-1.5 pt-0.5 sm:pt-0.5 md:pt-1">
          {/* Mobile: Horizontal scroll */}
          <div className="md:hidden">
            <div 
              ref={categoryTabsContainerRef}
              className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide scroll-smooth items-center"
            >
              <Button
                data-category-button="all"
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(null)}
                className={`h-7 shrink-0 font-medium transition-all text-xs px-2 whitespace-nowrap ${
                  selectedCategory === null ? "gradient-copper-gold text-white hover:opacity-90 shadow-md" : "hover:bg-muted"
                }`}
              >
                All Items
              </Button>
              {parentCategories.map((parentCategory) => {
                const subcategories = getSubcategories(parentCategory.id)
                const hasSubcategories = subcategories.length > 0
                const style = getCategoryStyle(parentCategory.name)
                
                // Check if any subcategory is selected
                const isParentSelected = hasSubcategories 
                  ? subcategories.some((sub) => selectedCategory === sub.id)
                  : selectedCategory === parentCategory.id
                
                // Check if any subcategory is highlighted
                const isParentHighlighted = selectedCategory === null && hasSubcategories
                  ? subcategories.some((sub) => highlightedCategory === sub.id)
                  : selectedCategory === null && highlightedCategory === parentCategory.id

                if (hasSubcategories) {
                  const isParentDirectlySelected = selectedCategory === parentCategory.id
                  return (
                    <div key={parentCategory.id} className="relative inline-block">
                      <Button
                        data-category-button={parentCategory.id}
                        variant={isParentSelected || isParentDirectlySelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          // Click parent to show all subcategory items (super menu)
                          handleCategoryClick(parentCategory.id)
                        }}
                        className={`h-7 shrink-0 font-medium transition-all text-xs pl-2 pr-6 sm:pr-7 whitespace-nowrap ${
                          isParentSelected || isParentDirectlySelected
                            ? `${style.color} hover:opacity-90 shadow-md` 
                            : isParentHighlighted 
                              ? `${style.color} opacity-70 hover:opacity-90` 
                              : "hover:bg-muted"
                        }`}
                      >
                        <span className="truncate">{parentCategory.name}</span>
                      </Button>
                      <DropdownMenu
                        open={expandedParentCategory === parentCategory.id}
                        onOpenChange={(open) => setExpandedParentCategory(open ? parentCategory.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-7 w-5 sm:h-7 sm:w-6 p-0 hover:bg-transparent z-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedParentCategory(expandedParentCategory === parentCategory.id ? null : parentCategory.id)
                            }}
                          >
                            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[180px] sm:w-[200px] z-[100]">
                          <DropdownMenuItem
                            onClick={() => {
                              // Show all items from parent (super menu)
                              handleCategoryClick(parentCategory.id)
                              setExpandedParentCategory(null)
                            }}
                            className={isParentDirectlySelected ? "bg-accent text-accent-foreground font-semibold" : ""}
                          >
                            All {parentCategory.name}
                          </DropdownMenuItem>
                          {subcategories.map((subcategory) => {
                            const isSubSelected = selectedCategory === subcategory.id
                            return (
                              <DropdownMenuItem
                                key={subcategory.id}
                                onClick={() => {
                                  handleCategoryClick(subcategory.id)
                                  setExpandedParentCategory(null)
                                }}
                                className={isSubSelected ? "bg-accent text-accent-foreground font-semibold" : ""}
                              >
                                {subcategory.name}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                } else {
                  const isSelected = selectedCategory === parentCategory.id
                  const isHighlighted = selectedCategory === null && highlightedCategory === parentCategory.id
                  return (
                    <Button
                      key={parentCategory.id}
                      data-category-button={parentCategory.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryClick(parentCategory.id)}
                      className={`h-7 shrink-0 font-medium transition-all text-xs px-2 whitespace-nowrap ${
                        isSelected 
                          ? `${style.color} hover:opacity-90 shadow-md` 
                          : isHighlighted 
                            ? `${style.color} opacity-70 hover:opacity-90` 
                            : "hover:bg-muted"
                      }`}
                    >
                      {parentCategory.name}
                    </Button>
                  )
                }
              })}
            </div>
          </div>

          {/* Desktop: Professional Navigation Menu */}
          <div className="hidden md:block">
            <NavigationMenu viewport={false} className="w-full">
              <NavigationMenuList 
                className="flex flex-wrap gap-0.5 justify-start items-center"
              >
                {/* All Items */}
                <NavigationMenuItem>
                  <Button
                    data-category-button="all"
                    variant={selectedCategory === null ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCategoryClick(null)}
                    className={`h-8 shrink-0 font-medium transition-all text-xs sm:text-sm px-2 sm:px-2.5 whitespace-nowrap rounded-md ${
                      selectedCategory === null 
                        ? "gradient-copper-gold text-white hover:opacity-90 shadow-md" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    All Items
                  </Button>
                </NavigationMenuItem>

                {/* Parent Categories with Submenus */}
                {parentCategories.map((parentCategory) => {
                  const subcategories = getSubcategories(parentCategory.id)
                  const hasSubcategories = subcategories.length > 0
                  const style = getCategoryStyle(parentCategory.name)
                  
                  const isParentDirectlySelected = selectedCategory === parentCategory.id
                  const isParentSelected = hasSubcategories 
                    ? subcategories.some((sub) => selectedCategory === sub.id) || isParentDirectlySelected
                    : selectedCategory === parentCategory.id
                  
                  const isParentHighlighted = selectedCategory === null && hasSubcategories
                    ? subcategories.some((sub) => highlightedCategory === sub.id)
                    : selectedCategory === null && highlightedCategory === parentCategory.id

                  if (hasSubcategories) {
                    return (
                      <NavigationMenuItem 
                        key={parentCategory.id}
                        onMouseEnter={() => setHoveredParentCategory(parentCategory.id)}
                        onMouseLeave={() => setHoveredParentCategory(null)}
                      >
                        <NavigationMenuTrigger
                          data-category-button={parentCategory.id}
                          className={`h-8 shrink-0 font-medium text-xs sm:text-sm px-2 sm:px-2.5 whitespace-nowrap rounded-md transition-all ${
                            isParentSelected
                              ? `${style.color} hover:opacity-90 shadow-md` 
                              : isParentHighlighted 
                                ? `${style.color} opacity-70 hover:opacity-90` 
                                : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                          onClick={() => handleCategoryClick(parentCategory.id)}
                        >
                          {parentCategory.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="z-[100]">
                          <div className="w-[200px] sm:w-[240px] md:w-[280px] p-2 bg-popover border rounded-md shadow-lg">
                            <div className="grid gap-0.5">
                              <Button
                                variant="ghost"
                                className={`w-full justify-start h-auto py-2 px-3 rounded-md ${
                                  isParentDirectlySelected ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-accent/20 hover:text-accent"
                                }`}
                                onClick={() => {
                                  handleCategoryClick(parentCategory.id)
                                  setHoveredParentCategory(null)
                                }}
                              >
                                <span className="font-semibold text-sm">All {parentCategory.name}</span>
                              </Button>
                              <div className="h-px bg-border my-1" />
                              {subcategories.map((subcategory) => {
                                const isSubSelected = selectedCategory === subcategory.id
                                return (
                                  <Button
                                    key={subcategory.id}
                                    variant="ghost"
                                    className={`w-full justify-start h-auto py-2 px-3 rounded-md ${
                                      isSubSelected ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-accent/20 hover:text-accent"
                                    }`}
                                    onClick={() => {
                                      handleCategoryClick(subcategory.id)
                                      setHoveredParentCategory(null)
                                    }}
                                  >
                                    <span className="font-medium text-sm">{subcategory.name}</span>
                                  </Button>
                                )
                              })}
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    )
                  } else {
                    const isSelected = selectedCategory === parentCategory.id
                    const isHighlighted = selectedCategory === null && highlightedCategory === parentCategory.id
                    return (
                      <NavigationMenuItem key={parentCategory.id}>
                        <Button
                          data-category-button={parentCategory.id}
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleCategoryClick(parentCategory.id)}
                          className={`h-8 shrink-0 font-medium transition-all text-xs sm:text-sm px-2 sm:px-2.5 whitespace-nowrap rounded-md ${
                            isSelected 
                              ? `${style.color} hover:opacity-90 shadow-md` 
                              : isHighlighted 
                                ? `${style.color} opacity-70 hover:opacity-90` 
                                : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {parentCategory.name}
                        </Button>
                      </NavigationMenuItem>
                    )
                  }
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      {isQRScan && (
        <div className="container mx-auto px-2 sm:px-3 md:px-4 pt-2 sm:pt-3 md:pt-4">
          <Card className="bg-brand-light/30 border-2 p-2.5 sm:p-3 md:p-4">
            <p className="text-center text-xs sm:text-sm font-medium text-foreground/90">
              🎉 Welcome! Browse our menu and add items to your cart. No sign-up required.
            </p>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4">
        {filteredItems.length > 0 ? (
          <>
            <div
              ref={(el) => {
                if (!selectedCategory) categoryRefs.current["all"] = el
              }}
              data-category-id="all"
              className="mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 flex flex-row items-center justify-between gap-1 xs:gap-1.5 md:gap-2 lg:gap-3"
            >
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground">
                  {selectedCategory ? getCategoryDisplayName(selectedCategory) : "All Items"}
                  <span className="ml-1 sm:ml-1.5 md:ml-2 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-normal text-muted-foreground">
                    ({filteredItems.length} {filteredItems.length === 1 ? "item" : "items"})
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg border border-border bg-card p-0.5 sm:p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${viewMode === "grid" ? "gradient-copper-gold text-white hover:opacity-90" : ""}`}
                  >
                    <Grid3x3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${viewMode === "list" ? "gradient-copper-gold text-white hover:opacity-90" : ""}`}
                  >
                    <List className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>

                <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 relative bg-transparent">
                      <SlidersHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                      {hasActiveFilters && (
                        <span className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full gradient-copper-gold border-2 border-card" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto p-4 sm:p-6">
                    <SheetHeader>
                      <SheetTitle className="font-serif text-lg sm:text-xl">Filters & Sort</SheetTitle>
                      <SheetDescription className="text-sm">Customize your menu view</SheetDescription>
                    </SheetHeader>

                    <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm sm:text-base font-semibold">Sort By</Label>
                        </div>
                        <RadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)} className="!gap-2 sm:!gap-2.5">
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3 sm:p-3.5 hover:bg-muted/40 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
                            <RadioGroupItem value="featured" id="featured" />
                            <Label htmlFor="featured" className="flex-1 cursor-pointer text-sm sm:text-base font-medium">
                              Featured First
                            </Label>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3 sm:p-3.5 hover:bg-muted/40 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
                            <RadioGroupItem value="name" id="name" />
                            <Label htmlFor="name" className="flex-1 cursor-pointer text-sm sm:text-base font-medium">
                              Name (A-Z)
                            </Label>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3 sm:p-3.5 hover:bg-muted/40 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
                            <RadioGroupItem value="price-low" id="price-low" />
                            <Label htmlFor="price-low" className="flex-1 cursor-pointer text-sm sm:text-base font-medium">
                              Price: Low to High
                            </Label>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3 sm:p-3.5 hover:bg-muted/40 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
                            <RadioGroupItem value="price-high" id="price-high" />
                            <Label htmlFor="price-high" className="flex-1 cursor-pointer text-sm sm:text-base font-medium">
                              Price: High to Low
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Separator />

                      <div className="space-y-2 sm:space-y-3">
                        <Label className="text-sm sm:text-base font-semibold">Price Range</Label>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={maxPrice}
                              value={priceRange[0]}
                              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                              className="flex-1 h-9 sm:h-10 text-sm sm:text-base"
                              placeholder="Min"
                            />
                            <span className="text-muted-foreground text-sm">to</span>
                            <Input
                              type="number"
                              min={0}
                              max={maxPrice}
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                              className="flex-1 h-9 sm:h-10 text-sm sm:text-base"
                              placeholder="Max"
                            />
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            ${priceRange[0].toFixed(2)} - ${priceRange[1].toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2 sm:space-y-3">
                        <Label className="text-sm sm:text-base font-semibold">Additional Filters</Label>
                        <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3 sm:p-3.5 hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
                          <Checkbox
                            id="featured-only"
                            checked={showFeaturedOnly}
                            onCheckedChange={(checked) => setShowFeaturedOnly(checked as boolean)}
                          />
                          <Label
                            htmlFor="featured-only"
                            className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Show Popular Items Only
                          </Label>
                        </div>
                      </div>

                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          onClick={resetFilters}
                          className="w-full bg-transparent h-9 sm:h-10 text-sm sm:text-base"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {groupedItems && groupedItems.length > 0 ? (
              // Items grouped by category - Works for "All Items" and parent categories (shows subcategory sections)
              <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12 pb-20">
                {groupedItems.map((group) => {
                  const categoryId = group.category.id
                  const categoryName = getCategoryDisplayName(categoryId)
                  const itemCount = group.items.length
                  const isParent = group.isParent
                  const subcategories = getSubcategories(categoryId)

                  // Skip empty subcategories (only show parent heading if it has items or subcategories)
                  if (!isParent && itemCount === 0) {
                    return null
                  }

                  // For parent categories, show heading even if empty (they have subcategories)
                  // But skip if parent has no items AND no subcategories with items
                  if (isParent && itemCount === 0) {
                    // Check if any subcategory has items
                    const hasSubcategoryItems = subcategories.some(sub => {
                      const subItems = filteredItems.filter(item => item.category_id === sub.id)
                      return subItems.length > 0
                    })
                    if (!hasSubcategoryItems) {
                      return null
                    }
                  }
                  
                  // Debug log for each group
                  if (itemCount > 0 || (isParent && subcategories.length > 0)) {
                    console.log(`📦 Rendering category: ${group.category.name}`, {
                      categoryId,
                      itemCount,
                      isParent,
                      subcategoriesCount: subcategories.length
                    })
                  }

                  return (
                    <section 
                      key={categoryId} 
                      id={`category-${categoryId}`} 
                      className="scroll-mt-36 w-full"
                    >
                      {/* Category Section Header */}
                      <div
                        ref={(el) => {
                          categoryRefs.current[categoryId] = el || null
                        }}
                        data-category-id={categoryId}
                        className={`mb-3 sm:mb-4 md:mb-5 lg:mb-6 ${isParent ? 'mt-2 sm:mt-3 md:mt-4' : 'mt-1 sm:mt-1.5 md:mt-2'}`}
                      >
                        {isParent && getSubcategories(categoryId).length > 0 ? (
                          // Parent category heading with different style (no items count)
                          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold uppercase tracking-wide flex items-center gap-2 sm:gap-2.5 md:gap-3 border-b-2 border-foreground/30 pb-2 sm:pb-2.5 md:pb-3 text-foreground">
                            <span>{group.category.name}</span>
                          </h2>
                        ) : (
                          // Subcategory or parent without subcategories heading
                          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold flex items-center gap-1.5 sm:gap-2 md:gap-2.5 text-foreground">
                            <span>{group.category.name}</span>
                            {itemCount > 0 && (
                              <span className="ml-1.5 sm:ml-2 md:ml-2.5 text-xs sm:text-sm md:text-base font-normal text-muted-foreground">
                                ({itemCount} {itemCount === 1 ? "item" : "items"})
                              </span>
                            )}
                          </h2>
                        )}
                      </div>

                      {/* Category Products Grid/List */}
                      {/* Only show items for subcategories or parents without subcategories */}
                      {!isParent || getSubcategories(categoryId).length === 0 ? (
                        itemCount > 0 ? (
                          viewMode === "grid" ? (
                            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 lg:gap-2">
                              {group.items.map((item) => (
                                <MenuItemCard
                                  key={item.id}
                                  item={item}
                                  categoryName={categoryName}
                                  isAdding={addingItemId === item.id}
                                  onCustomize={() => handleAddToCart(item)}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5">
                              {group.items.map((item) => (
                                <MenuItemListCard
                                  key={item.id}
                                  item={item}
                                  categoryName={categoryName}
                                  isAdding={addingItemId === item.id}
                                  onCustomize={() => handleAddToCart(item)}
                                />
                              ))}
                            </div>
                          )
                        ) : null
                      ) : null}
                    </section>
                  )
                })}
              </div>
            ) : (
              // Fallback: show items directly when subcategory is selected (no grouping needed)
              <div>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
                </div>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 lg:gap-2">
                    {filteredItems.map((item) => {
                      const category = menuData.categories.find((c) => c.id === item.category_id)
                      return (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          categoryName={category?.name}
                          isAdding={addingItemId === item.id}
                          onCustomize={() => handleAddToCart(item)}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5">
                    {filteredItems.map((item) => {
                      const category = menuData.categories.find((c) => c.id === item.category_id)
                      return (
                        <MenuItemListCard
                          key={item.id}
                          item={item}
                          categoryName={category?.name}
                          isAdding={addingItemId === item.id}
                          onCustomize={() => handleAddToCart(item)}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="py-12 sm:py-16 md:py-20 text-center px-3 sm:px-4">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-muted">
              <Coffee className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mb-1.5 sm:mb-2 font-serif text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-foreground">No drinks found</h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              {searchQuery ? "Try a different search term" : "No items match your filters"}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="mt-3 sm:mt-4 bg-transparent h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base"
              >
                <X className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>


      {customizeItem && (() => {
        const itemCategory = menuData.categories.find((c) => c.id === customizeItem.category_id)
        // If it's a subcategory, get the parent category name for better detection
        const parentCategory = itemCategory?.parent_id 
          ? menuData.categories.find((c) => c.id === itemCategory.parent_id)
          : null
        const categoryName = parentCategory ? parentCategory.name : itemCategory?.name
        
        return (
          <CustomizeDialog
            item={customizeItem}
            categoryName={categoryName}
            menuItems={menuData.menuItems}
            open={!!customizeItem}
            onClose={() => setCustomizeItem(null)}
          />
        )
      })()}

      {powerBowlItem && (
        <PowerBowlCustomizeDialog
          item={powerBowlItem}
          open={!!powerBowlItem}
          onClose={() => setPowerBowlItem(null)}
        />
      )}
    </div>
  )
}
