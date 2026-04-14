"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface ApothecaryItem {
  id: string
  title: string
  description: string
  imageUrl: string
  buttonText: string
  redirectLink: string
  category: string
}

const apothecaryItems: ApothecaryItem[] = [
  {
    id: '1',
    title: 'Loaded Teas',
    description: 'Clean energy and mental clarity with zero sugar and metabolic boosting antioxidants.',
    imageUrl: '/loaded-tea.jpg',
    buttonText: 'EXPLORE BLENDS',
    redirectLink: '/menu?category=cat-16',
    category: 'loaded-teas'
  },
  {
    id: '2',
    title: 'Meal Shakes',
    description: 'High-quality protein to keep you focused through the afternoon.',
    imageUrl: '/meal-shake.jpg',
    buttonText: 'DISCOVER',
    redirectLink: '/menu?category=cat-protein',
    category: 'meal-shakes'
  },
  {
    id: '3',
    title: 'Beauty Drinks',
    description: 'Collagen-infused botanicals for glowing skin and cellular hydration.',
    imageUrl: '/beauty-drink.jpg',
    buttonText: 'DISCOVER',
    redirectLink: '/menu?category=cat-specialty',
    category: 'beauty-drinks'
  },
  {
    id: '4',
    title: 'Power Snacks',
    description: 'Small-batch protein balls and sustenance crafted for the ambitious professional.',
    imageUrl: '/power-snacks.jpg',
    buttonText: 'VIEW SNACKS',
    redirectLink: '/menu?category=cat-17',
    category: 'power-snacks'
  }
]

export function ApothecarySection() {
  return (
    <section className="py-16 px-4 pb-24 bg-[#181511]">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-brand text-sm font-medium tracking-wider uppercase mb-2">
              CURATED SELECTION
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground">
              Explore Our Apothecary
            </h2>
          </div>
          <Link href="/menu" className="hidden md:block">
            <Button 
              variant="ghost" 
              className="text-brand hover:text-brand/80 text-sm tracking-wider uppercase"
            >
              VIEW FULL INVENTORY
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Grid Layout - 2 rows with alternating widths */}
        <div className="space-y-6">
          {/* First Row: Loaded Teas (70%) + Meal Shakes (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-auto lg:h-[320px]">
            {/* Loaded Teas - 70% width */}
            <Card className="lg:col-span-7 relative overflow-hidden group cursor-pointer border-0 bg-black h-[280px] lg:h-full">
              <Link href={apothecaryItems[0].redirectLink}>
                <div className="absolute inset-0">
                  <img
                    src="/Loaded Teas (Big Card).png"
                    alt={apothecaryItems[0].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/latte-coffee-drink.jpg'
                    }}
                  />
                  {/* Blackish overlay */}
                  <div className="absolute inset-0 bg-black/40" />
                </div>
                {/* Content positioned at bottom left */}
                <div className="absolute bottom-0 left-0 p-8 z-10">
                  <h3 className="text-2xl lg:text-3xl font-light text-white mb-3 lg:mb-4">
                    {apothecaryItems[0].title}
                  </h3>
                  <p className="text-white/85 text-sm leading-relaxed mb-4 lg:mb-6 max-w-md">
                    {apothecaryItems[0].description}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="text-brand hover:text-brand/80 text-sm tracking-wider uppercase w-fit p-0 h-auto"
                  >
                    {apothecaryItems[0].buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </Card>

            {/* Meal Shakes - 30% width */}
            <Card className="lg:col-span-3 relative overflow-hidden group cursor-pointer border-0 bg-black h-[280px] lg:h-full">
              <Link href={apothecaryItems[1].redirectLink}>
                <div className="absolute inset-0">
                  <img
                    src="/Meal Replacement Shakes.png"
                    alt={apothecaryItems[1].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/fruit-smoothie-drink.jpg'
                    }}
                  />
                  {/* Blackish overlay */}
                  <div className="absolute inset-0 bg-black/40" />
                </div>
                {/* Content positioned at bottom left */}
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h3 className="text-lg lg:text-xl font-light text-white mb-2">
                    {apothecaryItems[1].title}
                  </h3>
                  <p className="text-white/85 text-xs lg:text-sm leading-relaxed mb-3 max-w-xs">
                    {apothecaryItems[1].description}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="text-brand hover:text-brand/80 text-xs lg:text-sm tracking-wider uppercase w-fit p-0 h-auto"
                  >
                    {apothecaryItems[1].buttonText}
                    <ArrowRight className="ml-2 h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
              </Link>
            </Card>
          </div>

          {/* Second Row: Beauty Drinks (30%) + Power Snacks (70%) */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-auto lg:h-[320px]">
            {/* Beauty Drinks - 30% width */}
            <Card className="lg:col-span-3 relative overflow-hidden group cursor-pointer border-0 bg-black h-[280px] lg:h-full">
              <Link href={apothecaryItems[2].redirectLink}>
                <div className="absolute inset-0">
                  <img
                    src="/Beauty Drinks.png"
                    alt={apothecaryItems[2].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/matcha-green-tea-latte-vibrant.jpg'
                    }}
                  />
                  {/* Blackish overlay */}
                  <div className="absolute inset-0 bg-black/40" />
                </div>
                {/* Content positioned at bottom left */}
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h3 className="text-lg lg:text-xl font-light text-white mb-2">
                    {apothecaryItems[2].title}
                  </h3>
                  <p className="text-white/85 text-xs lg:text-sm leading-relaxed mb-3">
                    {apothecaryItems[2].description}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="text-brand hover:text-brand/80 text-xs lg:text-sm tracking-wider uppercase w-fit p-0 h-auto"
                  >
                    {apothecaryItems[2].buttonText}
                    <ArrowRight className="ml-2 h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
              </Link>
            </Card>

            {/* Power Snacks - 70% width */}
            <Card className="lg:col-span-7 relative overflow-hidden group cursor-pointer border-0 bg-black h-[280px] lg:h-full">
              <Link href={apothecaryItems[3].redirectLink}>
                <div className="absolute inset-0">
                  <img
                    src="/Power Snacks.png"
                    alt={apothecaryItems[3].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/coffee-drink.png'
                    }}
                  />
                  {/* Blackish overlay */}
                  <div className="absolute inset-0 bg-black/40" />
                </div>
                {/* Content positioned at bottom left */}
                <div className="absolute bottom-0 left-0 p-8 z-10">
                  <h3 className="text-2xl lg:text-3xl font-light text-white mb-3 lg:mb-4">
                    {apothecaryItems[3].title}
                  </h3>
                  <p className="text-white/85 text-sm leading-relaxed mb-4 lg:mb-6 max-w-md">
                    {apothecaryItems[3].description}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="text-brand hover:text-brand/80 text-sm tracking-wider uppercase w-fit p-0 h-auto"
                  >
                    {apothecaryItems[3].buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </Card>
          </div>
        </div>

        {/* Mobile View Full Inventory Button */}
        <div className="md:hidden mt-8 text-center">
          <Link href="/menu">
            <Button 
              variant="ghost" 
              className="text-brand hover:text-brand/80 text-sm tracking-wider uppercase"
            >
              VIEW FULL INVENTORY
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}