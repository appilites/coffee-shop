"use client"

import { useRouter, useParams } from "next/navigation"
import { mockMenuItems, mockCategories, mockCustomizationOptions } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Sparkles, Clock } from "lucide-react"
import Image from "next/image"
import { getProductImage } from "@/lib/product-images"
import CustomizeDialog from "@/components/menu/customize-dialog"
import { useState } from "react"
import type { MenuItem } from "@/lib/types"

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null)
  const [imageError, setImageError] = useState(false)

  // Find the product by ID
  const product = mockMenuItems.find((item) => item.id === productId)
  const category = product ? mockCategories.find((cat) => cat.id === product.category_id) : null
  const customizations = product
    ? mockCustomizationOptions.filter((c) => c.menu_item_id === product.id)
    : []

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

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => router.push("/menu")}>Back to Menu</Button>
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
              {product.description && (
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground mb-3 sm:mb-4">
                  {product.description}
                </p>
              )}
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

            {/* Customization Options Preview */}
            {customizations.length > 0 && (
              <div className="mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-2 sm:mb-3">
                  Customization Options Available
                </h3>
                <div className="flex flex-wrap gap-2">
                  {customizations.map((option) => (
                    <Badge key={option.id} variant="secondary" className="text-xs sm:text-sm">
                      {option.option_name}
                      {option.is_required && <span className="ml-1 text-error">*</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              onClick={() => setCustomizeItem(product)}
              size="lg"
              className="w-full bg-brand text-white hover:bg-brand-dark min-h-[48px] sm:min-h-[52px] md:min-h-[56px] text-sm sm:text-base md:text-lg font-semibold"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Customize & Add to Cart
            </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Customize Dialog */}
      {customizeItem && (
        <CustomizeDialog
          item={customizeItem}
          customizations={customizations}
          categoryName={category?.name}
          open={!!customizeItem}
          onClose={() => setCustomizeItem(null)}
        />
      )}
    </div>
  )
}
