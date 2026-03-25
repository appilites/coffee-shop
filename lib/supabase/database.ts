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

// Set to true only if Supabase is unavailable; false means live DB data is used
const useMockData = false

// Only initialize the Supabase client on the browser side
let supabase: any = null
if (typeof window !== 'undefined') {
  try {
    const { createBrowserClient } = require("./client")
    supabase = createBrowserClient()
  } catch (error) {
    console.warn('Supabase client not available, using mock data')
  }
}

/** Supabase/Postgrest errors often omit .message; String(error) is "[object Object]" — extract reliably */
function textFromSupabaseError(error: unknown): string {
  if (error == null) return ""
  if (typeof error === "string") return error
  if (error instanceof Error) return `${error.name} ${error.message}`
  if (typeof error === "object") {
    const o = error as Record<string, unknown>
    const parts = [o.message, o.details, o.hint, o.code].filter((x) => typeof x === "string") as string[]
    if (parts.length) return parts.join(" ")
    try {
      return JSON.stringify(error)
    } catch {
      return String(error)
    }
  }
  return String(error)
}

function isAbortLikeSupabaseError(error: unknown): boolean {
  const t = textFromSupabaseError(error).toLowerCase()
  return (
    t.includes("aborterror") ||
    t.includes("signal is aborted") ||
    t.includes("the user aborted") ||
    t.includes("operation was aborted") ||
    (t.includes("abort") && t.includes("signal"))
  )
}

let inflightCategoriesGetAll: Promise<MenuCategory[]> | null = null
let inflightMenuItemsGetAll: Promise<MenuItem[]> | null = null

// Categories
export const categoryService = {
  async getAll(): Promise<MenuCategory[]> {
    if (useMockData || !supabase) {
      console.log('📂 Using mock categories (mock mode or no client)')
      return mockCategories
    }

    if (inflightCategoriesGetAll) return inflightCategoriesGetAll

    inflightCategoriesGetAll = (async () => {
      try {
        const { data, error } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order')

        if (error) {
          if (isAbortLikeSupabaseError(error)) {
            console.warn('📂 Categories fetch aborted (ignored); using mock categories')
            return mockCategories
          }
          const msg = textFromSupabaseError(error)
          console.error('❌ Error fetching categories:', msg)
          console.log('📂 Falling back to mock categories')
          return mockCategories
        }

        console.log('✅ Fetched', data?.length || 0, 'categories from database')
        return data || mockCategories
      } catch (error: unknown) {
        if (isAbortLikeSupabaseError(error)) {
          console.warn('📂 Categories request aborted; using mock categories')
          return mockCategories
        }
        const err = error as { message?: string }
        if (err?.message?.includes('Failed to fetch')) {
          console.error('❌ Network error fetching categories')
        } else {
          console.error('❌ Exception fetching categories:', textFromSupabaseError(error))
        }
        console.log('📂 Falling back to mock categories')
        return mockCategories
      } finally {
        inflightCategoriesGetAll = null
      }
    })()

    return inflightCategoriesGetAll
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
      console.log('📦 Using mock menu items (mock mode or no client)')
      return mockMenuItems
    }

    if (inflightMenuItemsGetAll) return inflightMenuItemsGetAll

    inflightMenuItemsGetAll = (async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          if (isAbortLikeSupabaseError(error)) {
            console.warn('📦 Menu items fetch aborted (ignored); using mock data')
            return mockMenuItems
          }
          const msg = textFromSupabaseError(error)
          console.error('❌ Error fetching menu items:', msg)
          console.log('📦 Falling back to mock menu items')
          return mockMenuItems
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ No products found in database, using mock data')
          return mockMenuItems
        }

        const transformedData = (data || []).map((item: any) => ({
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          description: item.description,
          base_price: item.base_price,
          image_url: item.image_url || `/coffee-drink.png`,
          is_available: item.is_available,
          is_featured: item.is_featured,
          prep_time_minutes: item.prep_time_minutes || 5,
          created_at: item.created_at,
          updated_at: item.updated_at,
          loyalty_points_earn: item.loyalty_points_earn != null ? Number(item.loyalty_points_earn) : undefined,
          loyalty_points_cost: item.loyalty_points_cost != null ? Number(item.loyalty_points_cost) : undefined,
          variations: Array.isArray(item.variations) ? item.variations : undefined
        }))

        console.log('✅ Fetched', transformedData.length, 'menu items from database')
        return transformedData
      } catch (error: unknown) {
        if (isAbortLikeSupabaseError(error)) {
          console.warn('📦 Menu items request aborted; using mock data')
          return mockMenuItems
        }
        const err = error as { message?: string }
        if (err?.message?.includes('Failed to fetch')) {
          console.error('❌ Network error - check internet or Supabase status')
        } else {
          console.error('❌ Exception fetching menu items:', textFromSupabaseError(error))
        }
        console.log('📦 Falling back to mock menu items')
        return mockMenuItems
      } finally {
        inflightMenuItemsGetAll = null
      }
    })()

    return inflightMenuItemsGetAll
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
      const found = mockMenuItems.find(item => item.id === id) || null
      return found ? { ...found, variations: (found as any).variations } : null
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      if (!data) return null
      return {
        ...data,
        variations: Array.isArray((data as any).variations) ? (data as any).variations : undefined
      }
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