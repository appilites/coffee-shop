"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

interface NewArrival {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  buttonText: string
  redirectLink: string | null
  displayOrder: number
}

interface ApiResponse {
  success: boolean
  data: NewArrival[]
  count: number
}

// Cache class for performance
class NewArrivalsCache {
  private cache: NewArrival[] | null = null
  private lastFetch = 0
  private cacheTime = 5 * 60 * 1000 // 5 minutes

  async getArrivals(): Promise<NewArrival[]> {
    const now = Date.now()
    if (this.cache && (now - this.lastFetch) < this.cacheTime) {
      return this.cache
    }

    try {
      const response = await fetch('/api/public/new-arrivals', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        this.cache = data.data
        this.lastFetch = now
        return this.cache
      } else {
        throw new Error('API returned unsuccessful response')
      }
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error)
      // Return cached data if available
      return this.cache || []
    }
  }
}

// Global cache instance
const arrivalsCache = new NewArrivalsCache()

export function NewArrivalsSection() {
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNewArrivals()
    
    // Set up real-time updates
    const interval = setInterval(fetchNewArrivals, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    checkScrollButtons()
  }, [newArrivals])

  const fetchNewArrivals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const arrivals = await arrivalsCache.getArrivals()
      setNewArrivals(arrivals)
      
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
      setError('Failed to load new arrivals')
      
      // Fallback to static data if API fails
      setNewArrivals([
        {
          id: '1',
          title: 'Protein Waffles',
          description: 'Build your own protein-packed waffle with your favorite toppings',
          imageUrl: '/newarrival.jfif',
          buttonText: 'Try Now',
          redirectLink: '/menu?category=cat-17',
          displayOrder: 1
        },
        {
          id: '2',
          title: 'Oat Milk Chai Tea Latte',
          description: 'Slow sips, sweet moments. Protein-packed chai tea latte with oat milk',
          imageUrl: '/newarrival1.jfif',
          buttonText: 'Try Now',
          redirectLink: '/menu?category=cat-16',
          displayOrder: 2
        },
        {
          id: '3',
          title: 'Specialty Drinks',
          description: 'Explore our premium specialty drink collection with unique flavors',
          imageUrl: '/newarrival2.jfif',
          buttonText: 'Try Now',
          redirectLink: '/menu?category=cat-10',
          displayOrder: 3
        }
      ])
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <section className="container mx-auto px-2 sm:px-3 md:px-4 pt-3 sm:pt-4 md:pt-6 lg:pt-8 pb-6 sm:pb-8 md:pb-12 lg:pb-16" style={{ backgroundColor: '#181511' }}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <span className="ml-2 text-foreground">Loading new arrivals...</span>
        </div>
      </section>
    )
  }

  if (newArrivals.length === 0) {
    return null // Don't show section if no active arrivals
  }

  const showSlider = newArrivals.length > 3

  return (
    <section className="container mx-auto px-2 sm:px-3 md:px-4 pt-3 sm:pt-4 md:pt-6 lg:pt-8 pb-6 sm:pb-8 md:pb-12 lg:pb-16" style={{ backgroundColor: '#181511' }}>
      <div className="mb-5 sm:mb-6 md:mb-8 lg:mb-12 text-center px-2">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-center mb-8 text-foreground">New Arrivals</h2>
        <p className="mt-1.5 sm:mt-2 md:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground">
          Discover our latest additions to the menu
        </p>
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
              ? 'flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4' 
              : 'grid gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 md:grid-cols-3'
          }`}
          onScroll={checkScrollButtons}
          style={showSlider ? { 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          } : {}}
        >
          {newArrivals.map((item, index) => (
            <Card 
              key={item.id} 
              className={`group overflow-hidden transition-all hover:shadow-xl ${
                showSlider
                  ? 'flex-shrink-0 w-full min-w-full max-w-full sm:w-[calc(50%-0.5rem)] sm:min-w-[calc(50%-0.5rem)] sm:max-w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] lg:min-w-[calc(33.333%-0.75rem)] lg:max-w-[calc(33.333%-0.75rem)] scroll-snap-align-start'
                  : ''
              }`}
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={item.imageUrl || '/newarrival.jfif'}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to default image if image fails to load
                    e.currentTarget.src = '/newarrival.jfif'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                    {item.description}
                  </p>
                )}
                {item.redirectLink && (
                  <Link href={item.redirectLink} className="cursor-pointer">
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px] hover:gradient-copper-gold hover:text-white"
                    >
                      Try Now
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {error} - Showing fallback content
          </p>
        </div>
      )}

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