import type { 
  MenuItem, 
  MenuCategory, 
  Location, 
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
import { mockCategories, mockMenuItems, mockLocations } from "../mock-data"

// Use mock data as fallback, but in production this should come from Supabase
const useMockData = true // Set to false when Supabase is fully set up

// Import Supabase client
let supabase: any = null
try {
  const { getSupabaseBrowserClient } = require("./client")
  supabase = getSupabaseBrowserClient()
} catch (error) {
  console.warn('Supabase client not available, using mock data')
}

// Locations
export const locationService = {
  async getAll(): Promise<Location[]> {
    if (useMockData || !supabase) {
      return mockLocations
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data || mockLocations
    } catch (error) {
      console.error('Error fetching locations:', error)
      return mockLocations
    }
  },

  async getById(id: string): Promise<Location | null> {
    if (useMockData || !supabase) {
      return mockLocations.find(l => l.id === id) || null
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching location:', error)
      return mockLocations.find(l => l.id === id) || null
    }
  }
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
      return mockMenuItems
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name')
      
      if (error) throw error
      return data || mockMenuItems
    } catch (error) {
      console.error('Error fetching menu items:', error)
      return mockMenuItems
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
        .eq('is_available', true)
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
      return []
    }

    try {
      const { data, error } = await supabase
        .from('customization_options')
        .select(`
          *,
          choices:customization_choices(*)
        `)
        .eq('menu_item_id', menuItemId)
        .order('option_name')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching customization options:', error)
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
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching combo options:', error)
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