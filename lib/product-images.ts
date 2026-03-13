/**
 * Product Image Mapping Utility
 * Maps product names and categories to relevant image URLs
 * 
 * HOW TO USE YANDEX IMAGES:
 * ==========================
 * 1. Go to https://yandex.com/images
 * 2. Search for your product (e.g., "protein shake", "chai latte", "smoothie")
 * 3. Right-click on an image and select "Copy image address" or "Copy image URL"
 * 4. Replace the corresponding URL in the mappings below
 * 
 * Example Yandex Image URL format:
 * https://avatars.mds.yandex.net/get-images/...
 * or
 * https://img.yandex.net/i?id=...
 * 
 * TIP: Use high-quality images (at least 800x800px) for best results
 */

// Product image mappings by name keywords
// Using local images from public folder for better reliability
export const productImageMap: Record<string, string> = {
  // Meal Replacement Shakes & Protein Drinks
  "apple pie": "/fruit-smoothie-drink.jpg",
  "bahama breeze": "/fruit-smoothie-drink.jpg",
  "banana": "/fruit-smoothie-drink.jpg",
  "blueberry": "/fruit-smoothie-drink.jpg",
  "brownie": "/mocha-chocolate-coffee.jpg",
  "butterfinger": "/mocha-chocolate-coffee.jpg",
  "butterscotch": "/caramel-macchiato-drizzle.jpg",
  "cake": "/mocha-coffee-with-whipped-cream-chocolate.jpg",
  "caramel": "/caramel-macchiato-drizzle.jpg",
  "cheesecake": "/mocha-coffee-with-whipped-cream-chocolate.jpg",
  "chocolate": "/mocha-chocolate-coffee.jpg",
  "cinnamon": "/chai-latte-with-cinnamon-spices.jpg",
  "cookies": "/mocha-coffee-with-whipped-cream-chocolate.jpg",
  "cookies and cream": "/mocha-coffee-with-whipped-cream-chocolate.jpg",
  "coffee": "/coffee-drink.png",
  "cappuccino": "/cappuccino-foam-art.jpg",
  "latte": "/caffe-latte-coffee-cup.jpg",
  "espresso": "/espresso-coffee-shot.jpg",
  "mocha": "/mocha-chocolate-coffee.jpg",
  "vanilla": "/vanilla-latte-foam.jpg",
  "strawberry": "/fruit-smoothie-drink.jpg",
  "peanut butter": "/mocha-chocolate-coffee.jpg",
  "pumpkin": "/chai-latte-spices.jpg",
  "smoothie": "/fruit-smoothie-drink.jpg",
  "shake": "/fruit-smoothie-drink.jpg",
  "protein": "/fruit-smoothie-drink.jpg",
  
  // Tea & Loaded Tea
  "tea": "/hot-tea-cup.jpg",
  "chai": "/chai-latte-spices.jpg",
  "matcha": "/matcha-green-tea-latte-vibrant.jpg",
  "berry": "/fruit-smoothie-drink.jpg",
  "orange": "/fruit-smoothie-drink.jpg",
  "lime": "/fruit-smoothie-drink.jpg",
  "tropical": "/fruit-smoothie-drink.jpg",
  "peach": "/fruit-smoothie-drink.jpg",
  "lemon": "/fruit-smoothie-drink.jpg",
  
  // Beauty Drinks
  "beauty": "/fruit-smoothie-drink.jpg",
  "collagen": "/fruit-smoothie-drink.jpg",
  
  // Energy Drinks
  "energy": "/fruit-smoothie-drink.jpg",
  "pre-workout": "/fruit-smoothie-drink.jpg",
  
  // Default fallback images
  "default": "/coffee-drink.png",
  "drink": "/coffee-drink.png",
}

// Category-based image mappings
export const categoryImageMap: Record<string, string> = {
  "meal replacement": "/fruit-smoothie-drink.jpg",
  "loaded tea": "/hot-tea-cup.jpg",
  "beauty drinks": "/fruit-smoothie-drink.jpg",
  "energy drinks": "/fruit-smoothie-drink.jpg",
  "coffee": "/coffee-drink.png",
  "tea": "/hot-tea-cup.jpg",
  "protein": "/fruit-smoothie-drink.jpg",
}

/**
 * Get product image URL based on product name and category
 * @param productName - The name of the product
 * @param categoryId - The category ID (optional)
 * @param categoryName - The category name (optional)
 * @returns Image URL string
 */
export function getProductImage(
  productName: string,
  categoryId?: string | null,
  categoryName?: string
): string {
  const name = productName.toLowerCase()
  
  // First, try to find exact or partial match in product image map
  for (const [key, url] of Object.entries(productImageMap)) {
    if (name.includes(key)) {
      return url
    }
  }
  
  // If no match, try category-based mapping
  if (categoryName) {
    const category = categoryName.toLowerCase()
    for (const [key, url] of Object.entries(categoryImageMap)) {
      if (category.includes(key)) {
        return url
      }
    }
  }
  
  // Default fallback
  return productImageMap.default
}

/**
 * Update this function to fetch images from Yandex Images API
 * Example implementation:
 * 
 * async function getYandexImage(searchQuery: string): Promise<string> {
 *   // Use Yandex Images API or web scraping
 *   // Return the image URL
 * }
 */
