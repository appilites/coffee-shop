"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2, Tag, ChevronLeft, ChevronRight } from "lucide-react"
import type { ShopPromotion } from "@/lib/promotions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function PromotionsSection() {
  const router = useRouter()
  const [items, setItems] = useState<ShopPromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/shop-promotions", { cache: "no-store" })
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setItems(data)
        }
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    checkScrollButtons()
  }, [items])

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth
      const scrollAmount = containerWidth // Scroll by full container width to show next 3 cards
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const onActivate = useCallback(
    (p: ShopPromotion) => {
      if (p.menuItemId) {
        router.push(`/menu/${encodeURIComponent(p.menuItemId)}`)
        return
      }
      if (p.externalUrl) {
        try {
          const u = new URL(p.externalUrl)
          window.open(u.href, "_blank", "noopener,noreferrer")
        } catch {
          window.open(p.externalUrl, "_blank", "noopener,noreferrer")
        }
      }
    },
    [router],
  )

  if (loading) {
    return (
      <section className="border-t border-border/40 bg-[#181511] pt-4 pb-8 sm:pt-6 sm:pb-10">
        <div className="container mx-auto flex justify-center px-4">
          <Loader2 className="h-7 w-7 animate-spin text-primary/80" aria-hidden />
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return null
  }

  const showSlider = items.length > 3

  return (
    <section className="border-t border-border/40 bg-[#181511] pt-4 pb-8 sm:pt-6 sm:pb-10 md:pb-12">
      <div className="container mx-auto px-2 sm:px-3 md:px-4">
        <div className="mb-4 sm:mb-6 text-center px-2">
          <div className="mb-1 flex items-center justify-center gap-2 text-primary">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide">Offers</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Promotions</h2>
        </div>

        <div className="relative">
          {/* Scroll Buttons */}
          {showSlider && (
            <>
              <Button
                variant="outline"
                size="icon"
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm ${
                  !canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm ${
                  !canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            className={`${
              showSlider 
                ? 'flex gap-4 overflow-x-auto scrollbar-hide pb-4' 
                : 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6'
            }`}
            onScroll={checkScrollButtons}
            style={showSlider ? { 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            } : {}}
          >
            {items.map((p) => (
              <div 
                key={p.id} 
                className={showSlider ? 'flex-shrink-0 w-[calc(33.333%-0.75rem)] scroll-snap-align-start' : ''}
                style={showSlider ? {
                  minWidth: 'calc(33.333% - 0.75rem)',
                  maxWidth: 'calc(33.333% - 0.75rem)'
                } : {}}
              >
                <PromotionCard promotion={p} onActivate={() => onActivate(p)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}

function PromotionCard({
  promotion: p,
  onActivate,
}: {
  promotion: ShopPromotion
  onActivate: () => void
}) {
  const interactive = Boolean(p.menuItemId || p.externalUrl)

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden border-border/60 transition-shadow hover:shadow-md",
        interactive && "hover:border-primary/30",
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={p.name || "Promotion"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/25 to-accent/15">
            <span className="px-3 text-center font-serif text-sm font-semibold text-foreground">{p.name}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="font-serif text-base font-semibold text-foreground sm:text-lg">{p.name}</h3>
        {p.description ? (
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">{p.description}</p>
        ) : null}
        {interactive ? (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full min-h-[44px] border-border/80 hover:gradient-copper-gold hover:text-white"
            onClick={() => onActivate()}
          >
            View Promotion
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
