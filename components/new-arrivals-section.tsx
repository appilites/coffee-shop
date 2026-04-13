"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface NewArrival {
  id: string
  title: string
  description: string | null
  image_url: string | null
  button_text: string
  redirect_link: string | null
  is_active: boolean
  display_order: number
}

export function NewArrivalsSection() {
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNewArrivals()
  }, [])

  const fetchNewArrivals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/new-arrivals')
      
      if (!response.ok) {
        throw new Error('Failed to fetch new arrivals')
      }
      
      const data = await response.json()
      // Filter only active items and sort by display order
      const activeArrivals = data
        .filter((item: NewArrival) => item.is_active)
        .sort((a: NewArrival, b: NewArrival) => a.display_order - b.display_order)
      
      setNewArrivals(activeArrivals)
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
      setError('Failed to load new arrivals')
      // Fallback to static data if API fails
      setNewArrivals([
        {
          id: '1',
          title: 'Protein Waffles',
          description: 'Build your own protein-packed waffle with your favorite toppings',
          image_url: '/newarrival.jfif',
          button_text: 'Try Now',
          redirect_link: '/menu?category=cat-17',
          is_active: true,
          display_order: 1
        },
        {
          id: '2',
          title: 'Oat Milk Chai Tea Latte',
          description: 'Slow sips, sweet moments. Protein-packed chai tea latte with oat milk',
          image_url: '/newarrival1.jfif',
          button_text: 'Try Now',
          redirect_link: '/menu?category=cat-16',
          is_active: true,
          display_order: 2
        },
        {
          id: '3',
          title: 'Specialty Drinks',
          description: 'Explore our premium specialty drink collection with unique flavors',
          image_url: '/newarrival2.jfif',
          button_text: 'Try Now',
          redirect_link: '/menu?category=cat-10',
          is_active: true,
          display_order: 3
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto px-2 sm:px-3 md:px-4 pt-3 sm:pt-4 md:pt-6 lg:pt-8 pb-6 sm:pb-8 md:pb-12 lg:pb-16" style={{ backgroundColor: '#181511' }}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
        </div>
      </section>
    )
  }

  if (newArrivals.length === 0) {
    return null // Don't show section if no active arrivals
  }

  return (
    <section className="container mx-auto px-2 sm:px-3 md:px-4 pt-3 sm:pt-4 md:pt-6 lg:pt-8 pb-6 sm:pb-8 md:pb-12 lg:pb-16" style={{ backgroundColor: '#181511' }}>
      <div className="mb-5 sm:mb-6 md:mb-8 lg:mb-12 text-center px-2">
        <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">New Arrivals</h2>
        <p className="mt-1.5 sm:mt-2 md:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground">
          Discover our latest additions to the menu
        </p>
      </div>

      <div className="grid gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 md:grid-cols-3">
        {newArrivals.map((item) => (
          <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-xl">
            <div className="aspect-video relative overflow-hidden">
              <img
                src={item.image_url || '/newarrival.jfif'}
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
              {item.redirect_link && (
                <Link href={item.redirect_link} className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px] hover:gradient-copper-gold hover:text-white"
                  >
                    {item.button_text}
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      {error && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {error} - Showing default content
          </p>
        </div>
      )}
    </section>
  )
}