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
      .order('display_order')
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching new arrivals for admin:', error)
    return NextResponse.json(
      { error: "Failed to fetch new arrivals" }, 
      { status: 500 }
    )
  }
}