import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const dynamic = "force-dynamic"

// GET - Get single new arrival
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const { data, error } = await supabase
      .from('new_arrivals')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching new arrival:', error)
    return NextResponse.json(
      { error: "New arrival not found" }, 
      { status: 404 }
    )
  }
}

// PUT - Update new arrival
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const body = await request.json()
    
    const updateData: any = {}
    if (body.title) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl
    if (body.buttonText) updateData.button_text = body.buttonText
    if (body.redirectLink !== undefined) updateData.redirect_link = body.redirectLink
    if (body.isActive !== undefined) updateData.is_active = body.isActive
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder
    
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('new_arrivals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating new arrival:', error)
    return NextResponse.json(
      { error: "Failed to update new arrival" }, 
      { status: 500 }
    )
  }
}

// DELETE - Delete new arrival
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    
    // First get the item to check if it has an image to delete
    const { data: item } = await supabase
      .from('new_arrivals')
      .select('image_url')
      .eq('id', id)
      .single()

    // Delete the database record
    const { error } = await supabase
      .from('new_arrivals')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Supabase delete error:', error)
      throw error
    }

    // If there was an image, try to delete it from storage
    if (item?.image_url && item.image_url.includes('new-arrivals-images')) {
      try {
        const fileName = item.image_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('new-arrivals-images')
            .remove([fileName])
        }
      } catch (storageError) {
        console.error('Error deleting image from storage:', storageError)
        // Don't fail the whole operation if image deletion fails
      }
    }

    return NextResponse.json({ message: "New arrival deleted successfully" })
  } catch (error) {
    console.error('Error deleting new arrival:', error)
    return NextResponse.json(
      { error: "Failed to delete new arrival" }, 
      { status: 500 }
    )
  }
}