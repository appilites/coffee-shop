export interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone: string | null
  is_active: boolean
  opening_time: string | null
  closing_time: string | null
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  category_id: string | null
  name: string
  description: string | null
  base_price: number
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  prep_time_minutes: number
  created_at: string
  updated_at: string
}

export interface CustomizationOption {
  id: string
  menu_item_id: string
  option_name: string
  option_type: "single" | "multiple"
  is_required: boolean
  created_at: string
  choices?: CustomizationChoice[]
}

export interface CustomizationChoice {
  id: string
  option_id: string
  choice_name: string
  price_modifier: number
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  location_id: string | null
  order_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  total_amount: number
  tax_amount: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  payment_intent_id: string | null
  pickup_time: string | null
  is_guest_order: boolean
  special_instructions: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  customizations: Array<{
    option_name: string
    choices: string[]
  }>
  created_at: string
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  selectedCustomizations: Map<string, string[]>
  totalPrice: number
}

// Loyalty Program Types
export interface Reward {
  id: string
  name: string
  description: string | null
  points_required: number
  reward_type: "free_drink" | "free_tea" | "discount" | "bonus_points"
  discount_percentage: number | null
  discount_amount: number | null
  is_active: boolean
  image_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface LoyaltyPointsTransaction {
  id: string
  user_id: string
  order_id: string | null
  points: number
  transaction_type: "earned" | "redeemed" | "expired" | "bonus"
  description: string | null
  reward_id: string | null
  created_at: string
}

export interface UserReward {
  id: string
  user_id: string
  reward_id: string
  order_id: string | null
  points_spent: number
  status: "active" | "used" | "expired"
  expires_at: string | null
  used_at: string | null
  created_at: string
  reward?: Reward
}

export interface LoyaltyPointsBalance {
  current_points: number
  total_points_earned: number
  total_points_redeemed: number
}

// Combo Options Types
export interface ComboOption {
  id: string
  menu_item_id: string | null // The item this combo is available for (null = available for all items)
  name: string
  description: string | null
  combo_type: "bundle" | "addon" | "quantity" // Bundle = multiple items, Addon = add item at discount, Quantity = buy X get Y
  discount_type: "percentage" | "fixed" | null // Percentage discount or fixed amount off
  discount_value: number | null // The discount amount (percentage or fixed)
  combo_price: number | null // Fixed combo price (if set, overrides discount)
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ComboItem {
  id: string
  combo_option_id: string
  menu_item_id: string // The item to add in the combo
  quantity: number // Quantity of this item in the combo
  is_required: boolean // If true, item is included automatically; if false, user can choose
  created_at: string
}

export interface ComboChoice {
  id: string
  combo_option_id: string
  menu_item_id: string // Alternative item choice (for "choose one" combos)
  created_at: string
}
