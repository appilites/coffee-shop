import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const dynamic = "force-dynamic"

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      error: "Supabase configuration missing",
      data: [],
      count: 0
    }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { data, error } = await supabase
      .from('new_arrivals')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Transform data to match the expected format from the guide
    const transformedData = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.image_url,
      buttonText: item.button_text,
      redirectLink: item.redirect_link,
      displayOrder: item.display_order
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('Error fetching new arrivals:', error)
    
    // Return fallback data in the expected format
    const fallbackData = [
      {
        id: 'fallback-1',
        title: 'Protein Waffles',
        description: 'Build your own protein-packed waffle with your favorite toppings',
        imageUrl: '/newarrival.jfif',
        buttonText: 'Try Now',
        redirectLink: '/menu?category=cat-17',
        displayOrder: 1
      },
      {
        id: 'fallback-2',
        title: 'Oat Milk Chai Tea Latte',
        description: 'Slow sips, sweet moments. Protein-packed chai tea latte with oat milk',
        imageUrl: '/newarrival1.jfif',
        buttonText: 'Try Now',
        redirectLink: '/menu?category=cat-16',
        displayOrder: 2
      },
      {
        id: 'fallback-3',
        title: 'Specialty Drinks',
        description: 'Explore our premium specialty drink collection with unique flavors',
        imageUrl: '/newarrival2.jfif',
        buttonText: 'Try Now',
        redirectLink: '/menu?category=cat-10',
        displayOrder: 3
      }
    ]
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      count: fallbackData.length
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  }
}