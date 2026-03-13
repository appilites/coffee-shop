import type { MenuItem, MenuCategory, Location, CustomizationOption, CustomizationChoice, ComboOption, ComboItem, ComboChoice } from "./types"

export const mockLocations: Location[] = [
  {
    id: "loc-1",
    name: "Druids Nutrition - Downtown",
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zip_code: "94102",
    phone: "(415) 555-0123",
    is_active: true,
    opening_time: "06:00",
    closing_time: "20:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "loc-2",
    name: "Druids Nutrition - Marina",
    address: "456 Bay Street",
    city: "San Francisco",
    state: "CA",
    zip_code: "94123",
    phone: "(415) 555-0456",
    is_active: true,
    opening_time: "07:00",
    closing_time: "19:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "loc-3",
    name: "Druids Nutrition - SOMA",
    address: "789 Mission Street",
    city: "San Francisco",
    state: "CA",
    zip_code: "94103",
    phone: "(415) 555-0789",
    is_active: true,
    opening_time: "06:30",
    closing_time: "21:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockCategories: MenuCategory[] = [
  // Parent Categories (main tabs)
  {
    id: "cat-loaded-tea",
    name: "Loaded Tea",
    description: "Teas are a combination of natural caffeine, B vitamins, tea grains, and aloe vera to make a highly caffeinated, sugar-free energy drink.",
    display_order: 1,
    is_active: true,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-beauty-drinks",
    name: "Beauty Drinks",
    description: "115MG CAFFEINE • 6G CARBS • 39 CALORIES • 2G PROTEIN",
    display_order: 2,
    is_active: true,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-specialty-drinks",
    name: "Specialty Drinks",
    description: "115MG CAFFEINE • 9G CARBS • 105-109 CALORIES • 17G PROTEIN",
    display_order: 3,
    is_active: true,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-1",
    name: "Meal Replacement Shakes",
    description: "LOW CARB • LOW SUGAR • 24G PROTEIN • 200-250 CALORIES",
    display_order: 4,
    is_active: true,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-power-bowl",
    name: "Power Bowl",
    description: "Build your own power bowl with açaí, pitaya, or oatmeal base, fresh fruits, and nutritious toppings",
    display_order: 5,
    is_active: true,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-16",
    name: "Oat Milk Latte",
    description: "Slow sips, sweet moments. Protein-packed chai tea latte with oat milk",
    display_order: 6,
    is_active: true,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-quick-snacks",
    name: "Quick Snacks/Eats",
    description: "Healthy snacks and quick eats",
    display_order: 6,
    is_active: true,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-kids-drinks",
    name: "Kids Drinks",
    description: "VITAMINS • HYDRATION • ELECTROLYTES",
    display_order: 7,
    is_active: true,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // Subcategories for Loaded Tea
  {
    id: "cat-2",
    name: "Berry",
    description: "Teas are a combination of natural caffeine, B vitamins, tea grains, and aloe vera to make a highly caffeinated, sugar-free energy drink.",
    display_order: 1,
    is_active: true,
    parent_id: "cat-loaded-tea",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-3",
    name: "Orange",
    description: "Teas are a combination of natural caffeine, B vitamins, tea grains, and aloe vera to make a highly caffeinated, sugar-free energy drink.",
    display_order: 2,
    is_active: true,
    parent_id: "cat-loaded-tea",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-4",
    name: "Lime",
    description: "Teas are a combination of natural caffeine, B vitamins, tea grains, and aloe vera to make a highly caffeinated, sugar-free energy drink.",
    display_order: 3,
    is_active: true,
    parent_id: "cat-loaded-tea",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-5",
    name: "Tropical",
    description: "Teas are a combination of natural caffeine, B vitamins, tea grains, and aloe vera to make a highly caffeinated, sugar-free energy drink.",
    display_order: 4,
    is_active: true,
    parent_id: "cat-loaded-tea",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // Subcategories for Beauty Drinks
  {
    id: "cat-6",
    name: "Berry",
    description: "115MG CAFFEINE • 6G CARBS • 39 CALORIES • 2G PROTEIN",
    display_order: 1,
    is_active: true,
    parent_id: "cat-beauty-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-7",
    name: "Lime",
    description: "115MG CAFFEINE • 6G CARBS • 39 CALORIES • 2G PROTEIN",
    display_order: 2,
    is_active: true,
    parent_id: "cat-beauty-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-8",
    name: "Tropical",
    description: "115MG CAFFEINE • 6G CARBS • 39 CALORIES • 2G PROTEIN",
    display_order: 3,
    is_active: true,
    parent_id: "cat-beauty-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-9",
    name: "Orange",
    description: "115MG CAFFEINE • 6G CARBS • 39 CALORIES • 2G PROTEIN",
    display_order: 4,
    is_active: true,
    parent_id: "cat-beauty-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // Subcategories for Specialty Drinks
  {
    id: "cat-10",
    name: "Berry",
    description: "115MG CAFFEINE • 9G CARBS • 105-109 CALORIES • 17G PROTEIN",
    display_order: 1,
    is_active: true,
    parent_id: "cat-specialty-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-11",
    name: "Lime",
    description: "115MG CAFFEINE • 9G CARBS • 105-109 CALORIES • 17G PROTEIN",
    display_order: 2,
    is_active: true,
    parent_id: "cat-specialty-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-12",
    name: "Tropical",
    description: "115MG CAFFEINE • 9G CARBS • 105-109 CALORIES • 17G PROTEIN",
    display_order: 3,
    is_active: true,
    parent_id: "cat-specialty-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-13",
    name: "Orange",
    description: "115MG CAFFEINE • 9G CARBS • 105-109 CALORIES • 17G PROTEIN",
    display_order: 4,
    is_active: true,
    parent_id: "cat-specialty-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // Subcategories for Quick Snacks/Eats
  {
    id: "cat-17",
    name: "Protein Waffles",
    description: "Build Your Own Waffle! Low carbs, 33g protein, 230-260 calories",
    display_order: 1,
    is_active: true,
    parent_id: "cat-quick-snacks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-18",
    name: "Protein Balls",
    description: "Protein-packed energy balls",
    display_order: 2,
    is_active: true,
    parent_id: "cat-quick-snacks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-19",
    name: "Fruit Bowls",
    description: "Fresh fruit bowls",
    display_order: 3,
    is_active: true,
    parent_id: "cat-quick-snacks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-20",
    name: "Fruit Cups",
    description: "Fresh fruit cups",
    display_order: 4,
    is_active: true,
    parent_id: "cat-quick-snacks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-21",
    name: "Overnight Oats",
    description: "Overnight oats",
    display_order: 5,
    is_active: true,
    parent_id: "cat-quick-snacks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // Subcategories for Kids Drinks
  {
    id: "cat-14",
    name: "Berry",
    description: "VITAMINS • HYDRATION • ELECTROLYTES",
    display_order: 1,
    is_active: true,
    parent_id: "cat-kids-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-15",
    name: "Orange",
    description: "VITAMINS • HYDRATION • ELECTROLYTES",
    display_order: 2,
    is_active: true,
    parent_id: "cat-kids-drinks",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // Coffee Bar Category
  {
    id: "cat-coffee-bar",
    name: "Coffee Bar",
    description: "Premium coffee and tea beverages. All sweetened with monk fruit - no sugar added.",
    display_order: 8,
    is_active: true,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // Subcategories for Coffee Bar
  {
    id: "cat-22",
    name: "Blended Coffee",
    description: "Smooth and creamy blended coffee drinks",
    display_order: 1,
    is_active: true,
    parent_id: "cat-coffee-bar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-23",
    name: "Iced Coffee",
    description: "Refreshing iced coffee beverages",
    display_order: 2,
    is_active: true,
    parent_id: "cat-coffee-bar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-24",
    name: "Hot Coffee",
    description: "Classic hot coffee drinks",
    display_order: 3,
    is_active: true,
    parent_id: "cat-coffee-bar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-25",
    name: "Hot Tea",
    description: "Premium hot tea selections",
    display_order: 4,
    is_active: true,
    parent_id: "cat-coffee-bar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Helper function to get appropriate image URL based on product category and name
const getProductImageUrl = (categoryId: string, name: string): string => {
  // Coffee shop product images - using Unsplash for realistic images
  const baseUrl = "https://images.unsplash.com"
  
  // Category-based image mapping
  const categoryImages: Record<string, string[]> = {
    // Meal Replacement Shakes
    "cat-1": [
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Protein shake
      `${baseUrl}/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop&crop=center`, // Smoothie bowl
      `${baseUrl}/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop&crop=center`, // Protein drink
      `${baseUrl}/photo-1563227812-0ea4c22e6cc8?w=400&h=400&fit=crop&crop=center`, // Healthy shake
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Nutrition drink
    ],
    
    // Loaded Tea - Berry
    "cat-2": [
      `${baseUrl}/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&crop=center`, // Berry tea
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Iced tea
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Colorful drink
      `${baseUrl}/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop&crop=center`, // Energy drink
    ],
    
    // Loaded Tea - Orange
    "cat-3": [
      `${baseUrl}/photo-1613478223719-2ab802602423?w=400&h=400&fit=crop&crop=center`, // Orange drink
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Citrus tea
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Orange smoothie
    ],
    
    // Loaded Tea - Lime
    "cat-4": [
      `${baseUrl}/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop&crop=center`, // Lime drink
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Green tea
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Lime smoothie
    ],
    
    // Loaded Tea - Tropical
    "cat-5": [
      `${baseUrl}/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop&crop=center`, // Tropical smoothie
      `${baseUrl}/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop&crop=center`, // Tropical drink
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Pineapple drink
    ],
    
    // Beauty Drinks - Berry
    "cat-6": [
      `${baseUrl}/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&crop=center`, // Berry beauty drink
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Pink drink
    ],
    
    // Beauty Drinks - Lime
    "cat-7": [
      `${baseUrl}/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop&crop=center`, // Green beauty drink
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Lime drink
    ],
    
    // Beauty Drinks - Tropical
    "cat-8": [
      `${baseUrl}/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop&crop=center`, // Tropical beauty drink
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Tropical smoothie
    ],
    
    // Coffee Bar categories
    "cat-22": [ // Blended Coffee
      `${baseUrl}/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&crop=center`, // Blended coffee
      `${baseUrl}/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&crop=center`, // Frappuccino
      `${baseUrl}/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center`, // Iced coffee blend
    ],
    
    "cat-23": [ // Iced Coffee
      `${baseUrl}/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center`, // Iced coffee
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Cold brew
      `${baseUrl}/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&crop=center`, // Iced latte
    ],
    
    "cat-24": [ // Hot Coffee
      `${baseUrl}/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&crop=center`, // Hot coffee
      `${baseUrl}/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&crop=center`, // Latte
      `${baseUrl}/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center`, // Cappuccino
    ],
    
    "cat-25": [ // Hot Tea
      `${baseUrl}/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&crop=center`, // Hot tea
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Tea cup
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Herbal tea
    ],
    
    // Power Bowl
    "cat-power-bowl": [
      `${baseUrl}/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop&crop=center`, // Acai bowl
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Smoothie bowl
      `${baseUrl}/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop&crop=center`, // Power bowl
    ],
    
    // Quick Snacks
    "cat-quick-snacks": [
      `${baseUrl}/photo-1563227812-0ea4c22e6cc8?w=400&h=400&fit=crop&crop=center`, // Protein bar
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Healthy snack
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Energy ball
    ],
    
    // Kids Drinks
    "cat-14": [ // Kids Berry
      `${baseUrl}/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&crop=center`, // Kids berry drink
      `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Colorful kids drink
    ],
    
    "cat-15": [ // Kids Orange
      `${baseUrl}/photo-1613478223719-2ab802602423?w=400&h=400&fit=crop&crop=center`, // Kids orange drink
      `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Orange juice
    ],
  }
  
  // Get images for the category
  const images = categoryImages[categoryId] || [
    `${baseUrl}/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center`, // Default smoothie
    `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`, // Default drink
    `${baseUrl}/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop&crop=center`, // Default beverage
  ]
  
  // Use product name hash to consistently assign same image to same product
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const imageIndex = Math.abs(hash) % images.length
  return images[imageIndex]
}

// Helper function to create menu items
const createMenuItem = (
  id: string,
  categoryId: string,
  name: string,
  description: string | null = null,
  basePrice: number = 6.95,
  isFeatured: boolean = false,
): MenuItem => ({
  id,
  category_id: categoryId,
  name,
  description,
  base_price: basePrice,
  image_url: getProductImageUrl(categoryId, name),
  is_available: true,
  is_featured: isFeatured,
  prep_time_minutes: 4,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export const mockMenuItems: MenuItem[] = [
  // Meal Replacement Shakes (cat-1)
  createMenuItem("item-1", "cat-1", "Apple Pie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-2", "cat-1", "Bahama Breeze", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-3", "cat-1", "Banana Caramel", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-4", "cat-1", "Banana Moon Pie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-5", "cat-1", "Banana Nut", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-6", "cat-1", "Banana Pudding", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-7", "cat-1", "Blondie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-8", "cat-1", "Blueberry Cheesecake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-9", "cat-1", "Blueberry Lemonade", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-10", "cat-1", "Brownie Batter", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-11", "cat-1", "Bubble Gum", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-12", "cat-1", "Butter Pecan", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-13", "cat-1", "Butterfinger", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-14", "cat-1", "Butterscotch", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-15", "cat-1", "Butterscotch Cookie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-16", "cat-1", "Cafe Latte", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-17", "cat-1", "Cake Batter", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-18", "cat-1", "Captain Crunch", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-19", "cat-1", "Caramel Cake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-20", "cat-1", "Cheesecake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-21", "cat-1", "Chocolate Caramel Cheesecake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-22", "cat-1", "Chocolate Caramel Cappuccino", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-23", "cat-1", "Chocolate Chip Cookie Dough", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-24", "cat-1", "Cinnamon Roll", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-25", "cat-1", "Cinnamon Toast Crunch", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-26", "cat-1", "Coconut Cream Pie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-27", "cat-1", "The Cookie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-28", "cat-1", "Cookies and Cream", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-29", "cat-1", "Dulce de Leche", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-30", "cat-1", "Dutch Chocolate", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-31", "cat-1", "Elvis (Chocolate or Vanilla)", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-32", "cat-1", "French Vanilla", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-33", "cat-1", "French Vanilla Cappuccino", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-34", "cat-1", "Frosted Animal Cracker", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-35", "cat-1", "Fruity Pebbles", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-36", "cat-1", "Fudgesicle", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-37", "cat-1", "Funfetti", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-38", "cat-1", "German Chocolate", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-39", "cat-1", "Key Lime Pie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-40", "cat-1", "King Cake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-41", "cat-1", "Lemon Ice Box", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-42", "cat-1", "Lemon Shortie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-43", "cat-1", "Margarita", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-44", "cat-1", "Mint Chocolate Chip", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-45", "cat-1", "No Bake Cookie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-46", "cat-1", "Nutter Butter", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-47", "cat-1", "Oatmeal Cookie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-48", "cat-1", "Orange Cream", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-49", "cat-1", "Peanut Butter Cheesecake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-50", "cat-1", "PB and J", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-51", "cat-1", "Peanut Butter Cup", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-52", "cat-1", "Peanut Butter Pancake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-53", "cat-1", "Pecan Pie", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-54", "cat-1", "Pina Colada", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-55", "cat-1", "Pineapple Upside Down Cake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-56", "cat-1", "Pistachio", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-57", "cat-1", "Pralines and Cream", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-58", "cat-1", "Push Pop", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-59", "cat-1", "Red Velvet", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-60", "cat-1", "Salted Caramel", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-61", "cat-1", "Salted Caramel Cheesecake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-62", "cat-1", "Samoa", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-63", "cat-1", "S'mores", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-64", "cat-1", "Snickers", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-65", "cat-1", "Strawberry", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-66", "cat-1", "Strawberry Cake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-67", "cat-1", "Strawberry Cheesecake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-68", "cat-1", "Strawberry Lemonade", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-69", "cat-1", "Strawberry Salted Caramel", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-70", "cat-1", "Tiramisu", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95, true),
  createMenuItem("item-71", "cat-1", "Very Berry Day", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-72", "cat-1", "Wedding Cake", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-73", "cat-1", "Wild Berry", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-74", "cat-1", "White Chocolate Peanut Butter Cup", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),
  createMenuItem("item-75", "cat-1", "White Chocolate Snickers", "Low carb, low sugar, 24g protein, 200-250 calories", 7.95),

  // Loaded Tea - Berry (cat-2)
  createMenuItem("item-76", "cat-2", "Airhead Extreme", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-77", "cat-2", "Beach Please", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-78", "cat-2", "Berry Blue", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-79", "cat-2", "Black Magic", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-80", "cat-2", "Black Pearl", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-81", "cat-2", "Blue Thunder", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-82", "cat-2", "Captain America", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-83", "cat-2", "Cherry Bomb", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-84", "cat-2", "Cotton Candy", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-85", "cat-2", "Cran-Pom", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-86", "cat-2", "Cucumber Watermelon", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-87", "cat-2", "Everest", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-88", "cat-2", "Grape Jolly Rancher", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-89", "cat-2", "Gypsy Juice", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-90", "cat-2", "Happy Camper", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-91", "cat-2", "Hurricane", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-92", "cat-2", "Melon Bomb", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-93", "cat-2", "Miami Vice", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-94", "cat-2", "Pine-Pom", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-95", "cat-2", "Pink Flamingo", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-96", "cat-2", "Pixie Stix", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-97", "cat-2", "Purple Rain", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-98", "cat-2", "Raspberry", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-99", "cat-2", "Red Dirt", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-100", "cat-2", "Red High Heel", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-101", "cat-2", "Runts", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-102", "cat-2", "Sandy Beach", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-103", "cat-2", "Shack Life", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-104", "cat-2", "Shark Bite", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-105", "cat-2", "Shipwreck", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-106", "cat-2", "Strawberry Jolly Rancher", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-107", "cat-2", "Sunrise", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-108", "cat-2", "Tranquility", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-109", "cat-2", "Unicorn", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-110", "cat-2", "Velvet Elvis", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-111", "cat-2", "Venom", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-112", "cat-2", "Warhead", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-113", "cat-2", "Watermelon Jolly Rancher", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),

  // Loaded Tea - Orange (cat-3)
  createMenuItem("item-114", "cat-3", "Aloha Dream", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-115", "cat-3", "Bahama Mama", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-116", "cat-3", "Bama Peach", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-117", "cat-3", "Beyond Blast", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-118", "cat-3", "Fanta", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-119", "cat-3", "Farmer's Market", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-120", "cat-3", "Firecracker", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-121", "cat-3", "Fruit Roll Up", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-122", "cat-3", "Fuzzy Navel", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-123", "cat-3", "Georgia Peach", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-124", "cat-3", "Halo", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-125", "cat-3", "Hello Sunshine", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-126", "cat-3", "Hippie Juice", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-127", "cat-3", "Hipster", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-128", "cat-3", "Hulk", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-129", "cat-3", "Insani Tea", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-130", "cat-3", "Lake Days", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-131", "cat-3", "Lollipop", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-132", "cat-3", "Mermaid", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-133", "cat-3", "Nerds", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-134", "cat-3", "One Stop", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-135", "cat-3", "Orange Slice", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-136", "cat-3", "Outer Banks", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-137", "cat-3", "Peach Sangria", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-138", "cat-3", "Russian Twist", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-139", "cat-3", "Skinny's on the Beach", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-140", "cat-3", "Skittlez", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-141", "cat-3", "Sour Apple Blow Pop", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-142", "cat-3", "Spring Breaker", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-143", "cat-3", "Strawberry Orange", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-144", "cat-3", "Sunset", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-145", "cat-3", "Tiger Tea", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-146", "cat-3", "Tropical Wave", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-147", "cat-3", "Up River", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-148", "cat-3", "Wonder Woman", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),

  // Loaded Tea - Lime (cat-4)
  createMenuItem("item-149", "cat-4", "Aqua Man", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-150", "cat-4", "Arnold Palmer", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-151", "cat-4", "Beach Bum", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-152", "cat-4", "Blackberry Lemonade", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-153", "cat-4", "Blue Hawaiian", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-154", "cat-4", "Blue Lagoon", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-155", "cat-4", "Blue Zen", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-156", "cat-4", "Bora Bora", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-157", "cat-4", "Cherry Lemonade", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-158", "cat-4", "Cherry Limeade", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-159", "cat-4", "Coco Papaya", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-160", "cat-4", "Cool Cucumber Lime", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-161", "cat-4", "Eclipse", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-162", "cat-4", "Fireball", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-163", "cat-4", "Froggie", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-164", "cat-4", "Green Apple", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-165", "cat-4", "Gummi Bear", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-166", "cat-4", "Hulk Smash", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-167", "cat-4", "Lemon Lagoon", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-168", "cat-4", "Loopy Fruit", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-169", "cat-4", "Margarita", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-170", "cat-4", "Melon Drop", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-171", "cat-4", "Merman", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-172", "cat-4", "Ninja Turtle", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-173", "cat-4", "Ocean Water", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-174", "cat-4", "Prickly Pear Margarita", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-175", "cat-4", "Rockford Peach", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-176", "cat-4", "Sour Patch", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-177", "cat-4", "Strawberry Kiwi", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-178", "cat-4", "Strawberry Lemonade", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-179", "cat-4", "Strawberry Watermelon", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-180", "cat-4", "Summer Surprise", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-181", "cat-4", "Swaggy D", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-182", "cat-4", "Sweet Tart", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-183", "cat-4", "Thunder Sleet", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-184", "cat-4", "Watermelon Thunder", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-185", "cat-4", "Waverunner", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-186", "cat-4", "Zen", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),

  // Loaded Tea - Tropical (cat-5)
  createMenuItem("item-187", "cat-5", "Beachin'", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-188", "cat-5", "Berry Medley", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-189", "cat-5", "Blackberry Pear", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-190", "cat-5", "Bob Marley", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-191", "cat-5", "Candy Crush", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-192", "cat-5", "Cran-Grape", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-193", "cat-5", "Fuji Falls", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-194", "cat-5", "Island Girl", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-195", "cat-5", "Jungle Juice", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-196", "cat-5", "Just Beachy", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-197", "cat-5", "Little Miss Sunshine", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-198", "cat-5", "Pacman", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-199", "cat-5", "Peach Passion", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-200", "cat-5", "Pina Colada", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95, true),
  createMenuItem("item-201", "cat-5", "Pipeline", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-202", "cat-5", "Quaran-Tea", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-203", "cat-5", "Rainbow Candy", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-204", "cat-5", "Savvy D", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-205", "cat-5", "Strawberry Colada", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-206", "cat-5", "Summer Breeze", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-207", "cat-5", "Sun-Kiss", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-208", "cat-5", "Tropical Blast", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-209", "cat-5", "Tropical Sunrise", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-210", "cat-5", "Zulu Coconut", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),
  createMenuItem("item-211", "cat-5", "Margarita (Peach, Lime, Strawberry, Watermelon, Tropical)", "175-200mg caffeine, 4 carbs, 24 calories, 0 sugar", 6.95),

  // Beauty Drinks - Berry (cat-6)
  createMenuItem("item-212", "cat-6", "Beast", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-213", "cat-6", "Black Beauty", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95, true),
  createMenuItem("item-214", "cat-6", "Black Widow", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-215", "cat-6", "Breezy", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-216", "cat-6", "Chanel", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95, true),
  createMenuItem("item-217", "cat-6", "Garden of Eden", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-218", "cat-6", "Juliette", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-219", "cat-6", "Spa Day", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-220", "cat-6", "Summer Lovin'", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),

  // Beauty Drinks - Lime (cat-7)
  createMenuItem("item-221", "cat-7", "Adam", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-222", "cat-7", "Beauty", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95, true),
  createMenuItem("item-223", "cat-7", "Eve", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-224", "cat-7", "Ocean Drive", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-225", "cat-7", "Poison Ivy", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-226", "cat-7", "Prickly Lady", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-227", "cat-7", "Queen Bee", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95, true),
  createMenuItem("item-228", "cat-7", "Sicily", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),

  // Beauty Drinks - Tropical (cat-8)
  createMenuItem("item-229", "cat-8", "Barbie", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95, true),
  createMenuItem("item-230", "cat-8", "Baywatch", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-231", "cat-8", "Beachin'", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-232", "cat-8", "Cabana Boy", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-233", "cat-8", "Kim K", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95, true),
  createMenuItem("item-234", "cat-8", "Malibu Barbie", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-235", "cat-8", "Mango Tango", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-236", "cat-8", "Moana", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-237", "cat-8", "Passion Berry", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-238", "cat-8", "Romeo", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-239", "cat-8", "Starstruck", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),

  // Beauty Drinks - Orange (cat-9)
  createMenuItem("item-240", "cat-9", "Aloha", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-241", "cat-9", "Dolly", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95, true),
  createMenuItem("item-242", "cat-9", "Joe Exotic", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),
  createMenuItem("item-243", "cat-9", "Sun-Kissed", "115mg caffeine, 6g carbs, 39 calories, 2g protein", 7.95),

  // Specialty Drinks - Berry (cat-10)
  createMenuItem("item-244", "cat-10", "Banana Berry", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-245", "cat-10", "Cherry Starburst", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95, true),
  createMenuItem("item-246", "cat-10", "Daisy Duke", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-247", "cat-10", "Galaxy", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-248", "cat-10", "Goldie", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-249", "cat-10", "Peach Ring", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-250", "cat-10", "Pretty in Pink", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95, true),
  createMenuItem("item-251", "cat-10", "Rambo", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-252", "cat-10", "Strawberry Starburst", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-253", "cat-10", "Summer Nights", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-254", "cat-10", "Superman", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95, true),
  createMenuItem("item-255", "cat-10", "Very Berry Lemonade", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-256", "cat-10", "Watermelon", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-257", "cat-10", "Wild Blue", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),

  // Specialty Drinks - Lime (cat-11)
  createMenuItem("item-258", "cat-11", "Axel", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-259", "cat-11", "Bae", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-260", "cat-11", "Beetle Juice", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-261", "cat-11", "Casanova", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-262", "cat-11", "Cosmo", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-263", "cat-11", "Cool Cucumber Breeze", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-264", "cat-11", "Desert Peach", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-265", "cat-11", "Emerald Isle", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-266", "cat-11", "Godfather", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95, true),
  createMenuItem("item-267", "cat-11", "Shotgun", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-268", "cat-11", "Snake Bite", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-269", "cat-11", "Train Wreck", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),

  // Specialty Drinks - Tropical (cat-12)
  createMenuItem("item-270", "cat-12", "Forever Young", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-271", "cat-12", "Georgia Vamp", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-272", "cat-12", "Hasselhoff", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-273", "cat-12", "Jimmy Buffet", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95, true),
  createMenuItem("item-274", "cat-12", "Martini", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-275", "cat-12", "Nola Vamp", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-276", "cat-12", "Paradise Punch", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-277", "cat-12", "Pretty Peachy Princess", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-278", "cat-12", "Southern Belle", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95, true),
  createMenuItem("item-279", "cat-12", "Strawberry Daiquiri", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-280", "cat-12", "The Mercedes", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-281", "cat-12", "Yellowstone", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),

  // Specialty Drinks - Orange (cat-13)
  createMenuItem("item-282", "cat-13", "Fruit Ninja", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-283", "cat-13", "Hercules", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95, true),
  createMenuItem("item-284", "cat-13", "Maniac", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-285", "cat-13", "Pixie Punch", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-286", "cat-13", "Prom Queen", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),
  createMenuItem("item-287", "cat-13", "Saint", "115mg caffeine, 9g carbs, 105-109 calories, 17g protein", 8.95),

  // Kids Drinks - Berry (cat-14)
  createMenuItem("item-288", "cat-14", "Batman", "Vitamins, hydration, electrolytes", 5.95, true),
  createMenuItem("item-289", "cat-14", "Barbie", "Vitamins, hydration, electrolytes", 5.95, true),
  createMenuItem("item-290", "cat-14", "Captain America", "Vitamins, hydration, electrolytes", 5.95, true),
  createMenuItem("item-291", "cat-14", "Catboy", "Vitamins, hydration, electrolytes", 5.95),
  createMenuItem("item-292", "cat-14", "Ironman", "Vitamins, hydration, electrolytes", 5.95, true),
  createMenuItem("item-293", "cat-14", "Peppa Pig", "Vitamins, hydration, electrolytes", 5.95, true),
  createMenuItem("item-294", "cat-14", "Spiderman", "Vitamins, hydration, electrolytes", 5.95, true),
  createMenuItem("item-295", "cat-14", "Sweet Tart", "Vitamins, hydration, electrolytes", 5.95),
  createMenuItem("item-296", "cat-14", "Unicorn", "Vitamins, hydration, electrolytes", 5.95, true),

  // Kids Drinks - Orange (cat-15)
  createMenuItem("item-297", "cat-15", "Gummi Worm", "Vitamins, hydration, electrolytes", 5.95),
  createMenuItem("item-298", "cat-15", "Hulk", "Vitamins, hydration, electrolytes", 5.95, true),
  createMenuItem("item-299", "cat-15", "Little Mermaid", "Vitamins, hydration, electrolytes", 5.95, true),
  createMenuItem("item-300", "cat-15", "Lollipop", "Vitamins, hydration, electrolytes", 5.95),
  createMenuItem("item-301", "cat-15", "Nemo", "Vitamins, hydration, electrolytes", 5.95, true),
  createMenuItem("item-302", "cat-15", "Wonder Woman", "Vitamins, hydration, electrolytes", 5.95, true),

  // Power Bowl (cat-power-bowl)
  {
    id: "item-power-bowl-1",
    category_id: "cat-power-bowl",
    name: "Build Your Own Power Bowl",
    description: "Build your own açaí, pitaya, or oatmeal bowl with fresh fruits, granola, and premium toppings",
    base_price: 10.95,
    image_url: "/acai-bowl.jpg",
    is_available: true,
    is_featured: true,
    prep_time_minutes: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-power-bowl-2",
    category_id: "cat-power-bowl",
    name: "Classic Açaí Bowl",
    description: "Açaí base with banana, blueberry, strawberry, granola, and honey drizzle",
    base_price: 10.95,
    image_url: "/acai-bowl.jpg",
    is_available: true,
    is_featured: false,
    prep_time_minutes: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-power-bowl-3",
    category_id: "cat-power-bowl",
    name: "Tropical Pitaya Bowl",
    description: "Pitaya base with pineapple, kiwi, banana, coconut flakes, and chia seeds",
    base_price: 11.95,
    image_url: "/acai-bowl.jpg",
    is_available: true,
    is_featured: false,
    prep_time_minutes: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-power-bowl-4",
    category_id: "cat-power-bowl",
    name: "Protein Oatmeal Bowl",
    description: "Oatmeal base with blueberry, strawberry, almond, honey, and protein boost",
    base_price: 9.95,
    image_url: "/acai-bowl.jpg",
    is_available: true,
    is_featured: false,
    prep_time_minutes: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Oat Milk Chai Tea Latte (cat-16)
  {
    id: "item-303",
    category_id: "cat-16",
    name: "Irish Cream",
    description: "Slow sips, sweet moments. Protein-packed chai tea latte with oat milk and Irish cream flavor",
    base_price: 8.95,
    image_url: "/chai-latte-with-cinnamon-spices.jpg",
    is_available: true,
    is_featured: true,
    prep_time_minutes: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-304",
    category_id: "cat-16",
    name: "Banana Foster",
    description: "Slow sips, sweet moments. Protein-packed chai tea latte with oat milk and banana foster flavor",
    base_price: 8.95,
    image_url: "/chai-latte-with-cinnamon-spices.jpg",
    is_available: true,
    is_featured: true,
    prep_time_minutes: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-305",
    category_id: "cat-16",
    name: "Caramel Brown Sugar",
    description: "Slow sips, sweet moments. Protein-packed chai tea latte with oat milk and caramel brown sugar flavor",
    base_price: 8.95,
    image_url: "/chai-latte-with-cinnamon-spices.jpg",
    is_available: true,
    is_featured: true,
    prep_time_minutes: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-306",
    category_id: "cat-16",
    name: "White Chocolate Mocha",
    description: "Slow sips, sweet moments. Protein-packed chai tea latte with oat milk and white chocolate mocha flavor",
    base_price: 8.95,
    image_url: "/chai-latte-with-cinnamon-spices.jpg",
    is_available: true,
    is_featured: true,
    prep_time_minutes: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-307",
    category_id: "cat-16",
    name: "French Vanilla Cappuccino",
    description: "Slow sips, sweet moments. Protein-packed chai tea latte with oat milk and French vanilla cappuccino flavor",
    base_price: 8.95,
    image_url: "/chai-latte-with-cinnamon-spices.jpg",
    is_available: true,
    is_featured: true,
    prep_time_minutes: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "item-308",
    category_id: "cat-16",
    name: "Cherry Amaretto Sour",
    description: "Slow sips, sweet moments. Protein-packed chai tea latte with oat milk and cherry amaretto sour flavor",
    base_price: 8.95,
    image_url: "/chai-latte-with-cinnamon-spices.jpg",
    is_available: true,
    is_featured: true,
    prep_time_minutes: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Protein Waffles (cat-17)
  {
    id: "item-309",
    category_id: "cat-17",
    name: "Build Your Own Protein Waffle",
    description: "Build Your Own Waffle! Low carbs, 33g protein, 230-260 calories",
    base_price: 9.95,
    image_url: "/placeholder.svg?height=300&width=300",
    is_available: true,
    is_featured: true,
    prep_time_minutes: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Coffee Bar - Blended Coffee (cat-22)
  createMenuItem("item-310", "cat-22", "Mocha Frappe", "Rich chocolate blended with ice and monk fruit sweetener", 6.95, true),
  createMenuItem("item-311", "cat-22", "Caramel Frappe", "Smooth caramel blended with ice and monk fruit sweetener", 6.95, true),
  createMenuItem("item-312", "cat-22", "Vanilla Frappe", "Creamy vanilla blended with ice and monk fruit sweetener", 6.95),
  createMenuItem("item-313", "cat-22", "Coffee Frappe", "Classic coffee blended with ice and monk fruit sweetener", 6.95),
  createMenuItem("item-314", "cat-22", "Mocha Chip Frappe", "Chocolate with chocolate chips, blended with ice and monk fruit sweetener", 7.25, true),
  createMenuItem("item-315", "cat-22", "Caramel Macchiato Frappe", "Caramel and espresso blended with ice and monk fruit sweetener", 7.25, true),

  // Coffee Bar - Iced Coffee (cat-23)
  createMenuItem("item-316", "cat-23", "Iced Latte", "Espresso with milk over ice, sweetened with monk fruit", 5.95, true),
  createMenuItem("item-317", "cat-23", "Iced Americano", "Espresso shots over ice, sweetened with monk fruit", 4.95),
  createMenuItem("item-318", "cat-23", "Iced Mocha", "Espresso with chocolate and milk over ice, sweetened with monk fruit", 6.45, true),
  createMenuItem("item-319", "cat-23", "Iced Caramel Macchiato", "Espresso with caramel and milk over ice, sweetened with monk fruit", 6.45, true),
  createMenuItem("item-320", "cat-23", "Iced Vanilla Latte", "Espresso with vanilla and milk over ice, sweetened with monk fruit", 6.45),
  createMenuItem("item-321", "cat-23", "Iced Cappuccino", "Espresso with frothed milk over ice, sweetened with monk fruit", 5.95),
  createMenuItem("item-322", "cat-23", "Cold Brew", "Smooth cold brew coffee over ice, sweetened with monk fruit", 5.45, true),

  // Coffee Bar - Hot Coffee (cat-24)
  createMenuItem("item-323", "cat-24", "Hot Latte", "Espresso with steamed milk, sweetened with monk fruit", 5.95, true),
  createMenuItem("item-324", "cat-24", "Hot Americano", "Espresso shots with hot water, sweetened with monk fruit", 4.95),
  createMenuItem("item-325", "cat-24", "Hot Mocha", "Espresso with chocolate and steamed milk, sweetened with monk fruit", 6.45, true),
  createMenuItem("item-326", "cat-24", "Hot Caramel Macchiato", "Espresso with caramel and steamed milk, sweetened with monk fruit", 6.45, true),
  createMenuItem("item-327", "cat-24", "Hot Vanilla Latte", "Espresso with vanilla and steamed milk, sweetened with monk fruit", 6.45),
  createMenuItem("item-328", "cat-24", "Hot Cappuccino", "Espresso with frothed milk, sweetened with monk fruit", 5.95),
  createMenuItem("item-329", "cat-24", "Hot Drip Coffee", "Freshly brewed coffee, sweetened with monk fruit", 4.45, true),

  // Coffee Bar - Hot Tea (cat-25)
  createMenuItem("item-330", "cat-25", "English Breakfast Tea", "Classic black tea blend, sweetened with monk fruit", 4.95, true),
  createMenuItem("item-331", "cat-25", "Earl Grey Tea", "Bergamot-scented black tea, sweetened with monk fruit", 4.95, true),
]

export const mockCustomizationOptions: (CustomizationOption & { choices: CustomizationChoice[] })[] = [
  // Size options for all drinks (excluding waffles)
  ...mockMenuItems
    .filter((item) => item.category_id !== "cat-17")
    .map((item) => ({
    id: `opt-size-${item.id}`,
    menu_item_id: item.id,
    option_name: "Size",
    option_type: "single" as const,
    is_required: true,
    created_at: new Date().toISOString(),
    choices: [
      {
        id: `choice-small-${item.id}`,
        option_id: `opt-size-${item.id}`,
        choice_name: "Small (12oz)",
        price_modifier: -0.5,
        is_default: false,
        created_at: new Date().toISOString(),
      },
      {
        id: `choice-medium-${item.id}`,
        option_id: `opt-size-${item.id}`,
        choice_name: "Medium (16oz)",
        price_modifier: 0,
        is_default: true,
        created_at: new Date().toISOString(),
      },
      {
        id: `choice-large-${item.id}`,
        option_id: `opt-size-${item.id}`,
        choice_name: "Large (20oz)",
        price_modifier: 1.0,
        is_default: false,
        created_at: new Date().toISOString(),
      },
    ],
  })),

  // Milk options for meal replacement shakes, specialty drinks, and oat milk chai tea lattes
  ...mockMenuItems
    .filter(
      (item) =>
        item.category_id === "cat-1" || // Meal Replacement Shakes
        ["cat-10", "cat-11", "cat-12", "cat-13"].includes(item.category_id || "") || // Specialty Drinks
        item.category_id === "cat-16", // Oat Milk Chai Tea Latte
    )
    .map((item) => ({
      id: `opt-milk-${item.id}`,
      menu_item_id: item.id,
      option_name: "Milk Type",
      option_type: "single" as const,
      is_required: true,
      created_at: new Date().toISOString(),
      choices: [
        {
          id: `choice-whole-${item.id}`,
          option_id: `opt-milk-${item.id}`,
          choice_name: "Whole Milk",
          price_modifier: 0,
          is_default: item.category_id !== "cat-16",
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-skim-${item.id}`,
          option_id: `opt-milk-${item.id}`,
          choice_name: "Skim Milk",
          price_modifier: 0,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-almond-${item.id}`,
          option_id: `opt-milk-${item.id}`,
          choice_name: "Almond Milk",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-oat-${item.id}`,
          option_id: `opt-milk-${item.id}`,
          choice_name: "Oat Milk",
          price_modifier: item.category_id === "cat-16" ? 0 : 0.75,
          is_default: item.category_id === "cat-16",
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-coconut-${item.id}`,
          option_id: `opt-milk-${item.id}`,
          choice_name: "Coconut Milk",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
      ],
    })),

  // Sweetness level for loaded teas, beauty drinks, and kids drinks
  ...mockMenuItems
    .filter((item) => 
      ["cat-2", "cat-3", "cat-4", "cat-5"].includes(item.category_id || "") || // Loaded Teas
      ["cat-6", "cat-7", "cat-8", "cat-9"].includes(item.category_id || "") || // Beauty Drinks
      ["cat-14", "cat-15"].includes(item.category_id || "") // Kids Drinks
    )
    .map((item) => ({
      id: `opt-sweet-${item.id}`,
      menu_item_id: item.id,
      option_name: "Sweetness",
      option_type: "single" as const,
      is_required: false,
      created_at: new Date().toISOString(),
      choices: [
        {
          id: `choice-nosweet-${item.id}`,
          option_id: `opt-sweet-${item.id}`,
          choice_name: "No Sugar",
          price_modifier: 0,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-light-${item.id}`,
          option_id: `opt-sweet-${item.id}`,
          choice_name: "Light Sweet",
          price_modifier: 0,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-regular-${item.id}`,
          option_id: `opt-sweet-${item.id}`,
          choice_name: "Regular",
          price_modifier: 0,
          is_default: true,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-extra-${item.id}`,
          option_id: `opt-sweet-${item.id}`,
          choice_name: "Extra Sweet",
          price_modifier: 0,
          is_default: false,
          created_at: new Date().toISOString(),
        },
      ],
    })),

  // Protein type for meal replacement shakes, specialty drinks, and oat milk chai tea lattes
  ...mockMenuItems
    .filter((item) => 
      item.category_id === "cat-1" || // Meal Replacement Shakes
      ["cat-10", "cat-11", "cat-12", "cat-13"].includes(item.category_id || "") || // Specialty Drinks
      item.category_id === "cat-16" // Oat Milk Chai Tea Latte
    )
    .map((item) => ({
      id: `opt-protein-${item.id}`,
      menu_item_id: item.id,
      option_name: "Protein Type",
      option_type: "single" as const,
      is_required: true,
      created_at: new Date().toISOString(),
      choices: [
        {
          id: `choice-whey-${item.id}`,
          option_id: `opt-protein-${item.id}`,
          choice_name: "Whey Protein",
          price_modifier: 0,
          is_default: true,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-plant-${item.id}`,
          option_id: `opt-protein-${item.id}`,
          choice_name: "Plant Protein",
          price_modifier: 0.5,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-isolate-${item.id}`,
          option_id: `opt-protein-${item.id}`,
          choice_name: "Whey Isolate",
          price_modifier: 1.0,
          is_default: false,
          created_at: new Date().toISOString(),
        },
      ],
    })),

  // Add-ons for most drinks
  ...mockMenuItems.map((item) => ({
    id: `opt-addons-${item.id}`,
    menu_item_id: item.id,
    option_name: "Add-ons",
    option_type: "multiple" as const,
    is_required: false,
    created_at: new Date().toISOString(),
    choices:
      item.category_id === "cat-1" || // Meal Replacement Shakes
      ["cat-10", "cat-11", "cat-12", "cat-13"].includes(item.category_id || "") || // Specialty Drinks
      item.category_id === "cat-16" // Oat Milk Chai Tea Latte
        ? [
            // Protein shake and energy drink add-ons
            {
              id: `choice-creatine-${item.id}`,
              option_id: `opt-addons-${item.id}`,
              choice_name: "Creatine",
              price_modifier: 1.5,
              is_default: false,
              created_at: new Date().toISOString(),
            },
            {
              id: `choice-collagen-${item.id}`,
              option_id: `opt-addons-${item.id}`,
              choice_name: "Collagen",
              price_modifier: 1.5,
              is_default: false,
              created_at: new Date().toISOString(),
            },
            {
              id: `choice-chia-${item.id}`,
              option_id: `opt-addons-${item.id}`,
              choice_name: "Chia Seeds",
              price_modifier: 0.75,
              is_default: false,
              created_at: new Date().toISOString(),
            },
            {
              id: `choice-greens-${item.id}`,
              option_id: `opt-addons-${item.id}`,
              choice_name: "Super Greens",
              price_modifier: 1.25,
              is_default: false,
              created_at: new Date().toISOString(),
            },
          ]
        : [
            // Coffee and tea add-ons
            {
              id: `choice-whip-${item.id}`,
              option_id: `opt-addons-${item.id}`,
              choice_name: "Whipped Cream",
              price_modifier: 0.5,
              is_default: false,
              created_at: new Date().toISOString(),
            },
            {
              id: `choice-caramel-${item.id}`,
              option_id: `opt-addons-${item.id}`,
              choice_name: "Caramel Drizzle",
              price_modifier: 0.5,
              is_default: false,
              created_at: new Date().toISOString(),
            },
            {
              id: `choice-vanilla-${item.id}`,
              option_id: `opt-addons-${item.id}`,
              choice_name: "Vanilla Syrup",
              price_modifier: 0.5,
              is_default: false,
              created_at: new Date().toISOString(),
            },
            {
              id: `choice-honey-${item.id}`,
              option_id: `opt-addons-${item.id}`,
              choice_name: "Honey",
              price_modifier: 0.5,
              is_default: false,
              created_at: new Date().toISOString(),
            },
          ],
  })),

  // Toppings for Protein Waffles
  ...mockMenuItems
    .filter((item) => item.category_id === "cat-17")
    .map((item) => ({
      id: `opt-toppings-${item.id}`,
      menu_item_id: item.id,
      option_name: "Toppings",
      option_type: "multiple" as const,
      is_required: false,
      created_at: new Date().toISOString(),
      choices: [
        {
          id: `choice-caramel-${item.id}`,
          option_id: `opt-toppings-${item.id}`,
          choice_name: "Caramel",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-whip-cream-${item.id}`,
          option_id: `opt-toppings-${item.id}`,
          choice_name: "Whip Cream",
          price_modifier: 0.50,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-chocolate-${item.id}`,
          option_id: `opt-toppings-${item.id}`,
          choice_name: "Chocolate",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-pecans-${item.id}`,
          option_id: `opt-toppings-${item.id}`,
          choice_name: "Pecans",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-strawberries-${item.id}`,
          option_id: `opt-toppings-${item.id}`,
          choice_name: "Strawberries",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-blueberries-${item.id}`,
          option_id: `opt-toppings-${item.id}`,
          choice_name: "Blueberries",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
      ],
    })),

  // Size options removed for Coffee Bar items (cat-22, cat-23, cat-24, cat-25) - no size options

  // Milk type options for Coffee Bar coffee drinks (not tea)
  ...mockMenuItems
    .filter((item) => 
      ["cat-22", "cat-23", "cat-24"].includes(item.category_id || "")
    )
    .map((item) => ({
      id: `opt-milk-coffee-${item.id}`,
      menu_item_id: item.id,
      option_name: "Milk Type",
      option_type: "single" as const,
      is_required: false,
      created_at: new Date().toISOString(),
      choices: [
        {
          id: `choice-whole-coffee-${item.id}`,
          option_id: `opt-milk-coffee-${item.id}`,
          choice_name: "Whole Milk",
          price_modifier: 0,
          is_default: true,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-skim-coffee-${item.id}`,
          option_id: `opt-milk-coffee-${item.id}`,
          choice_name: "Skim Milk",
          price_modifier: 0,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-almond-coffee-${item.id}`,
          option_id: `opt-milk-coffee-${item.id}`,
          choice_name: "Almond Milk",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-oat-coffee-${item.id}`,
          option_id: `opt-milk-coffee-${item.id}`,
          choice_name: "Oat Milk",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-coconut-coffee-${item.id}`,
          option_id: `opt-milk-coffee-${item.id}`,
          choice_name: "Coconut Milk",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
      ],
    })),

  // Sweetener options for Coffee Bar items (monk fruit only, no sugar)
  ...mockMenuItems
    .filter((item) => 
      ["cat-22", "cat-23", "cat-24", "cat-25"].includes(item.category_id || "")
    )
    .map((item) => ({
      id: `opt-sweetener-${item.id}`,
      menu_item_id: item.id,
      option_name: "Sweetener",
      option_type: "single" as const,
      is_required: false,
      created_at: new Date().toISOString(),
      choices: [
        {
          id: `choice-no-sweetener-${item.id}`,
          option_id: `opt-sweetener-${item.id}`,
          choice_name: "No Sweetener",
          price_modifier: 0,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-monk-fruit-light-${item.id}`,
          option_id: `opt-sweetener-${item.id}`,
          choice_name: "Monk Fruit (Light)",
          price_modifier: 0,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-monk-fruit-regular-${item.id}`,
          option_id: `opt-sweetener-${item.id}`,
          choice_name: "Monk Fruit (Regular)",
          price_modifier: 0,
          is_default: true,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-monk-fruit-extra-${item.id}`,
          option_id: `opt-sweetener-${item.id}`,
          choice_name: "Monk Fruit (Extra)",
          price_modifier: 0,
          is_default: false,
          created_at: new Date().toISOString(),
        },
      ],
    })),

  // Add-ons for Coffee Bar coffee drinks
  ...mockMenuItems
    .filter((item) => 
      ["cat-22", "cat-23", "cat-24"].includes(item.category_id || "")
    )
    .map((item) => ({
      id: `opt-addons-coffee-${item.id}`,
      menu_item_id: item.id,
      option_name: "Add-ons",
      option_type: "multiple" as const,
      is_required: false,
      created_at: new Date().toISOString(),
      choices: [
        {
          id: `choice-whip-cream-coffee-${item.id}`,
          option_id: `opt-addons-coffee-${item.id}`,
          choice_name: "Whipped Cream",
          price_modifier: 0.50,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-caramel-drizzle-coffee-${item.id}`,
          option_id: `opt-addons-coffee-${item.id}`,
          choice_name: "Caramel Drizzle",
          price_modifier: 0.50,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-vanilla-syrup-coffee-${item.id}`,
          option_id: `opt-addons-coffee-${item.id}`,
          choice_name: "Vanilla Syrup",
          price_modifier: 0.50,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        {
          id: `choice-extra-shot-coffee-${item.id}`,
          option_id: `opt-addons-coffee-${item.id}`,
          choice_name: "Extra Shot",
          price_modifier: 0.75,
          is_default: false,
          created_at: new Date().toISOString(),
        },
      ],
    })),
]

// Combo Options Data
export const mockComboOptions: ComboOption[] = [
  {
    id: "combo-1",
    menu_item_id: "item-316", // Iced Latte
    name: "Coffee + Protein Bar Combo",
    description: "Get a protein bar with your coffee for just $2.50 more",
    combo_type: "addon",
    discount_type: "fixed",
    discount_value: 1.50, // Save $1.50 on the protein bar
    combo_price: null,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "combo-2",
    menu_item_id: "item-323", // Hot Latte
    name: "Coffee + Protein Bar Combo",
    description: "Get a protein bar with your coffee for just $2.50 more",
    combo_type: "addon",
    discount_type: "fixed",
    discount_value: 1.50,
    combo_price: null,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "combo-3",
    menu_item_id: "item-310", // Mocha Frappe
    name: "Frappe + Protein Ball Combo",
    description: "Add a protein ball for only $2.00",
    combo_type: "addon",
    discount_type: "fixed",
    discount_value: 1.00,
    combo_price: null,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "combo-4",
    menu_item_id: "item-1", // Meal Replacement Shake - Apple Pie
    name: "Shake + Protein Waffle Bundle",
    description: "Complete meal combo - Save $2.00",
    combo_type: "bundle",
    discount_type: "fixed",
    discount_value: 2.00,
    combo_price: null,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "combo-5",
    menu_item_id: "item-76", // Loaded Tea - Airhead Extreme
    name: "Tea + Fruit Cup Combo",
    description: "Add a fresh fruit cup for $3.00",
    combo_type: "addon",
    discount_type: "fixed",
    discount_value: 1.00,
    combo_price: null,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // Universal combos available for all items
  {
    id: "combo-universal-1",
    menu_item_id: null, // null = available for all items
    name: "Add Protein Bar",
    description: "Add a protein bar to your order - Save $1.00",
    combo_type: "addon",
    discount_type: "fixed",
    discount_value: 1.00,
    combo_price: null,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "combo-universal-2",
    menu_item_id: null,
    name: "Add Protein Ball",
    description: "Add a protein ball to your order - Save $0.50",
    combo_type: "addon",
    discount_type: "fixed",
    discount_value: 0.50,
    combo_price: null,
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "combo-universal-3",
    menu_item_id: null,
    name: "Add Fruit Cup",
    description: "Add a fresh fruit cup to your order - Save $1.00",
    combo_type: "addon",
    discount_type: "fixed",
    discount_value: 1.00,
    combo_price: null,
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "combo-universal-4",
    menu_item_id: null,
    name: "Add Overnight Oats",
    description: "Add overnight oats to your order - Save $1.50",
    combo_type: "addon",
    discount_type: "fixed",
    discount_value: 1.50,
    combo_price: null,
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Combo Items - Items included in combos
export const mockComboItems: ComboItem[] = [
  // Combo 1 & 2: Coffee + Protein Bar
  {
    id: "combo-item-1",
    combo_option_id: "combo-1",
    menu_item_id: "item-protein-bar-1", // We'll need to add a protein bar item or use existing
    quantity: 1,
    is_required: false, // User can choose to add it
    created_at: new Date().toISOString(),
  },
  {
    id: "combo-item-2",
    combo_option_id: "combo-2",
    menu_item_id: "item-protein-bar-1",
    quantity: 1,
    is_required: false,
    created_at: new Date().toISOString(),
  },
  // Combo 3: Frappe + Protein Ball
  {
    id: "combo-item-3",
    combo_option_id: "combo-3",
    menu_item_id: "item-protein-ball-1", // We'll need to add protein ball items
    quantity: 1,
    is_required: false,
    created_at: new Date().toISOString(),
  },
  // Combo 4: Shake + Protein Waffle (using existing item)
  {
    id: "combo-item-4",
    combo_option_id: "combo-4",
    menu_item_id: "item-309", // Build Your Own Protein Waffle - this exists
    quantity: 1,
    is_required: true, // Automatically included
    created_at: new Date().toISOString(),
  },
  // Combo 5: Tea + Fruit Cup
  {
    id: "combo-item-5",
    combo_option_id: "combo-5",
    menu_item_id: "item-fruit-cup-1", // We'll need to add fruit cup items
    quantity: 1,
    is_required: false,
    created_at: new Date().toISOString(),
  },
  
  // Universal combo items
  {
    id: "combo-item-universal-1",
    combo_option_id: "combo-universal-1",
    menu_item_id: "item-protein-bar-universal", // Protein bar for universal combo
    quantity: 1,
    is_required: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "combo-item-universal-2",
    combo_option_id: "combo-universal-2",
    menu_item_id: "item-protein-ball-universal", // Protein ball for universal combo
    quantity: 1,
    is_required: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "combo-item-universal-3",
    combo_option_id: "combo-universal-3",
    menu_item_id: "item-fruit-cup-universal", // Fruit cup for universal combo
    quantity: 1,
    is_required: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "combo-item-universal-4",
    combo_option_id: "combo-universal-4",
    menu_item_id: "item-overnight-oats-universal", // Overnight oats for universal combo
    quantity: 1,
    is_required: false,
    created_at: new Date().toISOString(),
  },
]

// Helper function to get combos for a menu item
export const getCombosForItem = (menuItemId: string): ComboOption[] => {
  return mockComboOptions.filter(combo => 
    (combo.menu_item_id === menuItemId || combo.menu_item_id === null) && combo.is_active
  )
}

// Helper function to get combo items for a combo option
export const getComboItems = (comboOptionId: string): ComboItem[] => {
  return mockComboItems.filter(item => item.combo_option_id === comboOptionId)
}
