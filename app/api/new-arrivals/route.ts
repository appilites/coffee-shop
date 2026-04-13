import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
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

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching new arrivals:', error)
    
    // Return fallback data if database fails
    const fallbackData = [
      {
        id: 'fallback-1',
        title: 'Protein Waffles',
        description: 'Build your own protein-packed waffle with your favorite toppings',
        image_url: '/newarrival.jfif',
        button_text: 'Try Now',
        redirect_link: '/menu?category=cat-17',
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-2',
        title: 'Oat Milk Chai Tea Latte',
        description: 'Slow sips, sweet moments. Protein-packed chai tea latte with oat milk',
        image_url: '/newarrival1.jfif',
        button_text: 'Try Now',
        redirect_link: '/menu?category=cat-16',
        is_active: true,
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-3',
        title: 'Specialty Drinks',
        description: 'Explore our premium specialty drink collection with unique flavors',
        image_url: '/newarrival2.jfif',
        button_text: 'Try Now',
        redirect_link: '/menu?category=cat-10',
        is_active: true,
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(fallbackData)
  }
}