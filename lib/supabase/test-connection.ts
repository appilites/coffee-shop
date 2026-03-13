import { getSupabaseBrowserClient } from "./client"

/**
 * Test Supabase connection and basic operations
 */
export async function testSupabaseConnection() {
  const supabase = getSupabaseBrowserClient()
  
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('menu_categories')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connection successful!')
    console.log(`Found ${data} categories in database`)
    
    return { 
      success: true, 
      message: `Connected successfully. Found ${data} categories.` 
    }
    
  } catch (error) {
    console.error('Connection test error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Test creating a sample category (for testing purposes)
 */
export async function testCreateCategory() {
  const supabase = getSupabaseBrowserClient()
  
  try {
    const testCategory = {
      id: `test-${Date.now()}`,
      name: 'Test Category',
      description: 'This is a test category',
      display_order: 999,
      is_active: true,
      parent_id: null
    }
    
    const { data, error } = await supabase
      .from('menu_categories')
      .insert(testCategory)
      .select()
      .single()
    
    if (error) {
      console.error('Create test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Test category created:', data)
    
    // Clean up - delete the test category
    await supabase
      .from('menu_categories')
      .delete()
      .eq('id', testCategory.id)
    
    console.log('✅ Test category cleaned up')
    
    return { success: true, data }
    
  } catch (error) {
    console.error('Create test error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}