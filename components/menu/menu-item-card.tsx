"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { MenuItem } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Sparkles } from "lucide-react"
import Image from "next/image"
import { getProductImage } from "@/lib/product-images"

interface MenuItemCardProps {
  item: MenuItem
  onCustomize: () => void
  categoryName?: string
}

export default function MenuItemCard({ item, onCustomize, categoryName }: MenuItemCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  
  const getImageUrl = () => {
    // If we have a valid image URL, use it
    if (item.image_url && !item.image_url.includes("placeholder")) {
      // If it's a local path, ensure it starts with /
      if (!item.image_url.startsWith('http') && !item.image_url.startsWith('/')) {
        return `/${item.image_url}`
      }
      return item.image_url
    }
    
    // Otherwise, use product image mapping
    return getProductImage(item.name, item.category_id, categoryName)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleCardClick = () => {
    router.push(`/menu/${item.id}`)
  }

  return (
    <Card
      className={`group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/3] sm:aspect-[3/2] md:aspect-square lg:aspect-[4/3] bg-muted overflow-hidden">
        {!imageError ? (
        <Image
          src={getImageUrl()}
          alt={item.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          unoptimized={getImageUrl().startsWith("http")}
            onError={handleImageError}
        />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-muted">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">☕</div>
              <p className="text-xs text-muted-foreground">{item.name}</p>
            </div>
          </div>
        )}
        {item.is_featured && (
          <Badge className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 md:right-2 md:top-2 bg-brand text-white shadow-md flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 py-0.5">
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Popular
          </Badge>
        )}
      </div>

      <div className="px-2 py-1 sm:px-2.5 sm:py-2 md:px-3 md:py-2.5 lg:px-4 lg:py-3">
        <div className="mb-0 sm:mb-1 md:mb-1.5">
          <h3 className="font-serif text-xs sm:text-sm md:text-base font-bold text-foreground leading-tight line-clamp-1">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-0.5 sm:mt-0.5 md:mt-1 line-clamp-2 text-[10px] sm:text-xs leading-relaxed text-muted-foreground">{item.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2">
          <span className="font-serif text-sm sm:text-base md:text-lg font-bold text-brand">${item.base_price.toFixed(2)}</span>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onCustomize()
            }}
            className="h-7 w-7 sm:h-8 sm:w-auto sm:px-3 md:px-4 bg-brand text-[10px] sm:text-xs md:text-sm font-medium text-white hover:bg-brand-dark transition-all hover:shadow-md"
          >
            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
