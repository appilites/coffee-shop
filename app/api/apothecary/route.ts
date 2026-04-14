import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const apothecaryItems = [
  {
    id: '1',
    title: 'Loaded Teas',
    description: 'Clean energy and mental clarity with zero sugar and metabolic boosting antioxidants.',
    imageUrl: '/Loaded Teas (Big Card).png',
    buttonText: 'EXPLORE BLENDS',
    redirectLink: '/menu?category=cat-16',
    category: 'loaded-teas'
  },
  {
    id: '2',
    title: 'Meal Shakes',
    description: 'High-quality protein to keep you focused through the afternoon.',
    imageUrl: '/Meal Replacement Shakes.png',
    buttonText: 'DISCOVER',
    redirectLink: '/menu?category=cat-protein',
    category: 'meal-shakes'
  },
  {
    id: '3',
    title: 'Beauty Drinks',
    description: 'Collagen-infused botanicals for glowing skin and cellular hydration.',
    imageUrl: '/Beauty Drinks.png',
    buttonText: 'DISCOVER',
    redirectLink: '/menu?category=cat-specialty',
    category: 'beauty-drinks'
  },
  {
    id: '4',
    title: 'Power Snacks',
    description: 'Small-batch protein balls and sustenance crafted for the ambitious professional.',
    imageUrl: '/Power Snacks.png',
    buttonText: 'VIEW SNACKS',
    redirectLink: '/menu?category=cat-17',
    category: 'power-snacks'
  }
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: apothecaryItems,
      count: apothecaryItems.length
    })
  } catch (error) {
    console.error('Error fetching apothecary items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch apothecary items' },
      { status: 500 }
    )
  }
}