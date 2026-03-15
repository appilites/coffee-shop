import type { 
  MenuItem, 
  MenuCategory, 
  CustomizationOption, 
  CustomizationChoice,
  Order, 
  OrderItem,
  ComboOption,
  ComboItem,
  ComboChoice,
  Reward,
  LoyaltyPointsTransaction,
  UserReward,
  LoyaltyPointsBalance
} from "../types"
import { mockCategories, mockMenuItems } from "../mock-data"

// Use mock data as fallback, but in production this should come from Supabase
const useMockData = false // Set to false when Supabase is fully set up

// Import Supabase client
let supabase: any = null
try {
  const { getSupabaseBrowserClient } = require("./client")
  supabase = getSupabaseBrowserClient()
} catch (error) {
  console.warn('Supabase client not available, using mock data')
}

// Categories
export const categoryService = {
  async getAll(): Promise<MenuCategory[]> {
    if (useMockData || !supabase) {
      return mockCategories
    }

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      
      if (error) throw error
      return data || mockCategories
    } catch (error) {
      console.error('Error fetching categories:', error)
      return mockCategories
    }
  },

  async getParentCategories(): Promise<MenuCategory[]> {
    if (useMockData || !supabase) {
      return mockCategories.filter(c => !c.parent_id)
    }

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('display_order')
      
      if (error) throw error
      return data || mockCategories.filter(c => !c.parent_id)
    } catch (error) {
      console.error('Error fetching parent categories:', error)
      return mockCategories.filter(c => !c.parent_id)
    }
  },

  async getSubCategories(parentId: string): Promise<MenuCategory[]> {
    if (useMockData || !supabase) {
      return mockCategories.filter(c => c.parent_id === parentId)
    }

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('display_order')
      
      if (error) throw error
      return data || mockCategories.filter(c => c.parent_id === parentId)
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      return mockCategories.filter(c => c.parent_id === parentId)
    }
  },

  async create(category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): Promise<MenuCategory> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('menu_categories')
      .insert(category)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<MenuCategory>): Promise<MenuCategory> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('menu_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Menu Items
export const menuItemService = {
  async getAll(): Promise<MenuItem[]> {
    if (useMockData || !supabase) {
      console.log('⚠️ Using mock menu items')
      return mockMenuItems
    }

    try {
      console.log('🔍 Fetching menu items from Supabase...')
      console.log('🔍 Supabase client:', supabase ? 'available' : 'not available')
      console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'using default')
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        // Removed .eq('is_available', true) to show all items
        .order('created_at', { ascending: false }) // Order by newest first
      
      if (error) {
        console.error('❌ Error fetching menu items:', error)
        console.error('❌ Error code:', error.code)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error details:', error.details)
        console.error('❌ Error hint:', error.hint)
        
        // If it's a permission error, provide helpful message
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          console.error('🚨 RLS POLICY ERROR: Products cannot be read. Please run scripts/11-simple-fix-rls.sql in Supabase SQL Editor.')
        }
        
        // Don't throw - return empty array instead of mock data so we can see the error
        return []
      }
      
      console.log('✅ Fetched menu items from database:', data?.length || 0)
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No products found in database!')
        console.warn('💡 Check: 1) Products exist in database, 2) RLS policies allow SELECT, 3) Products have valid category_id')
        return []
      }
      
      // Transform data to ensure consistent structure
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        category_id: item.category_id,
        name: item.name,
        description: item.description,
        base_price: item.base_price,
        image_url: item.image_url || `/coffee-drink.png`, // Use local default image
        is_available: item.is_available,
        is_featured: item.is_featured,
        prep_time_minutes: item.prep_time_minutes || 5,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
      
      console.log('📊 Transformed menu items:', transformedData.length)
      if (transformedData.length > 0) {
        console.log('📝 Sample item:', {
          id: transformedData[0].id,
          name: transformedData[0].name,
          category_id: transformedData[0].category_id,
          base_price: transformedData[0].base_price,
          image_url: transformedData[0].image_url ? 'has image' : 'no image',
          is_available: transformedData[0].is_available,
          created_at: transformedData[0].created_at
        })
      }
      
      return transformedData
    } catch (error) {
      console.error('❌ Exception fetching menu items:', error)
      console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      
      // Return empty array instead of mock data so we can see the actual error
      return []
    }
  },

  async getByCategory(categoryId: string): Promise<MenuItem[]> {
    if (useMockData || !supabase) {
      return mockMenuItems.filter(item => item.category_id === categoryId)
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_available', true)
        .order('name')
      
      if (error) throw error
      return data || mockMenuItems.filter(item => item.category_id === categoryId)
    } catch (error) {
      console.error('Error fetching menu items by category:', error)
      return mockMenuItems.filter(item => item.category_id === categoryId)
    }
  },

  async getFeatured(): Promise<MenuItem[]> {
    if (useMockData || !supabase) {
      return mockMenuItems.filter(item => item.is_featured)
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_featured', true)
        // Removed .eq('is_available', true) to show all featured items
        .order('name')
      
      if (error) throw error
      return data || mockMenuItems.filter(item => item.is_featured)
    } catch (error) {
      console.error('Error fetching featured items:', error)
      return mockMenuItems.filter(item => item.is_featured)
    }
  },

  async getById(id: string): Promise<MenuItem | null> {
    if (useMockData || !supabase) {
      return mockMenuItems.find(item => item.id === id) || null
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching menu item:', error)
      return mockMenuItems.find(item => item.id === id) || null
    }
  },

  async create(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Customization Options
export const customizationService = {
  async getByMenuItem(menuItemId: string): Promise<CustomizationOption[]> {
    if (!supabase) {
      console.warn('⚠️ Supabase client not available for customizations')
      return []
    }

    try {
      console.log('🔍 Fetching customizations for menu item:', menuItemId)
      const { data, error } = await supabase
        .from('customization_options')
        .select(`
          *,
          choices:customization_choices(*)
        `)
        .eq('menu_item_id', menuItemId)
        .order('option_name')
      
      if (error) {
        console.error('❌ Supabase error fetching customizations:', error)
        console.error('❌ Error code:', error.code)
        console.error('❌ Error message:', error.message)
        throw error
      }
      
      console.log('✅ Customizations fetched:', data?.length || 0, 'options for item:', menuItemId)
      if (data && data.length > 0) {
        // Log each customization with its choices
        data.forEach((opt: any) => {
          console.log(`  - ${opt.option_name} (${opt.option_type}): ${opt.choices?.length || 0} choices`)
        })
      }
      
      return data || []
    } catch (error) {
      console.error('❌ Exception fetching customization options:', error)
      return []
    }
  },

  async create(option: Omit<CustomizationOption, 'id' | 'created_at'>): Promise<CustomizationOption> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('customization_options')
      .insert(option)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createChoice(choice: Omit<CustomizationChoice, 'id' | 'created_at'>): Promise<CustomizationChoice> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('customization_choices')
      .insert(choice)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Orders
export const orderService = {
  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createOrderItem(orderItem: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('order_items')
      .insert(orderItem)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<Order | null> {
    if (!supabase) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  },

  async getByUser(userId: string): Promise<Order[]> {
    if (!supabase) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user orders:', error)
      return []
    }
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updatePaymentStatus(id: string, paymentStatus: Order['payment_status']): Promise<Order> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Combo Options
export const comboService = {
  async getByMenuItem(menuItemId: string): Promise<ComboOption[]> {
    if (!supabase) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('combo_options')
        .select(`
          *,
          items:combo_items(
            *,
            menu_item:menu_items(*)
          ),
          choices:combo_choices(
            *,
            menu_item:menu_items(*)
          )
        `)
        .or(`menu_item_id.eq.${menuItemId},menu_item_id.is.null`)
        .eq('is_active', true)
        .order('display_order')
      
      if (error) {
        // If table doesn't exist, silently return empty array (combo feature not set up yet)
        if (error.message?.includes('Could not find the table') || 
            error.message?.includes('relation') || 
            error.code === '42P01') {
          console.log('ℹ️ Combo options table not found - combo feature not configured')
          return []
        }
        console.error('Error fetching combo options:', error.message || error)
        return []
      }
      return data || []
    } catch (error: any) {
      // If table doesn't exist, silently return empty array
      if (error?.message?.includes('Could not find the table') || 
          error?.message?.includes('relation') ||
          error?.code === '42P01') {
        console.log('ℹ️ Combo options table not found - combo feature not configured')
        return []
      }
      console.error('Error fetching combo options:', error?.message || error || 'Unknown error')
      return []
    }
  }
}

// Rewards & Loyalty
export const rewardService = {
  async getAll(): Promise<Reward[]> {
    if (!supabase) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching rewards:', error)
      return []
    }
  },

  async getUserRewards(userId: string): Promise<UserReward[]> {
    if (!supabase) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user rewards:', error)
      return []
    }
  },

  async getUserPointsBalance(userId: string): Promise<LoyaltyPointsBalance> {
    if (!supabase) {
      return { current_points: 0, total_points_earned: 0, total_points_redeemed: 0 }
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_points_balance', { user_id: userId })
      
      if (error) throw error
      return data || { current_points: 0, total_points_earned: 0, total_points_redeemed: 0 }
    } catch (error) {
      console.error('Error fetching points balance:', error)
      return { current_points: 0, total_points_earned: 0, total_points_redeemed: 0 }
    }
  },

  async addPointsTransaction(transaction: Omit<LoyaltyPointsTransaction, 'id' | 'created_at'>): Promise<LoyaltyPointsTransaction> {
    if (!supabase) {
      throw new Error('Database not available')
    }

    const { data, error } = await supabase
      .from('loyalty_points_transactions')
      .insert(transaction)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}