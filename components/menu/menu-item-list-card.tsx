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

interface MenuItemListCardProps {
  item: MenuItem
  onCustomize: () => void
  categoryName?: string
}

export default function MenuItemListCard({ item, onCustomize, categoryName }: MenuItemListCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  
  const getImageUrl = () => {
    // Use product image mapping if image_url is not set or is a placeholder
    if (!item.image_url || item.image_url.includes("placeholder")) {
      return getProductImage(item.name, item.category_id, categoryName)
    }
    return item.image_url
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleCardClick = () => {
    router.push(`/menu/${item.id}`)
  }

  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer`}
      onClick={handleCardClick}
    >
      {item.is_featured && (
        <Badge className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 md:right-2 md:top-2 z-10 bg-brand text-white shadow-md flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 py-0.5">
          <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
          Popular
        </Badge>
      )}
      <div className="flex gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 px-2 py-1 sm:px-1 sm:py-2 md:px-3 md:py-2.5 lg:px-4 lg:py-3">
        <div className="relative h-16 w-16 sm:h-16 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
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
              <span className="text-lg">☕</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            <h3 className="font-serif text-xs sm:text-sm md:text-base font-bold text-foreground leading-tight line-clamp-1">
              {item.name}
            </h3>
            {item.description && (
              <p className="mt-0.5 sm:mt-0.5 md:mt-1 line-clamp-2 text-[10px] sm:text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 mt-0.5 sm:mt-1 md:mt-1.5">
            <span className="font-serif text-sm sm:text-base md:text-lg font-bold text-brand">${item.base_price.toFixed(2)}</span>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCustomize()
              }}
              className="h-6 w-6 sm:h-7 sm:w-auto sm:px-2.5 md:px-3 bg-brand text-[10px] sm:text-xs md:text-sm font-medium text-white hover:bg-brand-dark transition-all hover:shadow-md shrink-0"
            >
              <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
