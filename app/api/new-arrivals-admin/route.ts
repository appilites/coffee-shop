import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const dynamic = "force-dynamic"

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase configuration missing" }, 
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  try {
    const { data, error } = await supabase
      .from('new_arrivals')
      .select('*')
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
      displayOrder: item.display_order,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length
    })
  } catch (error) {
    console.error('Error fetching new arrivals for admin:', error)
    return NextResponse.json(
      { error: "Failed to fetch new arrivals" }, 
      { status: 500 }
    )
  }
}