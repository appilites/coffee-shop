/** Shop-facing promotion (camelCase), aligned with admin public API shape. */

export type ShopPromotion = {
  id: string
  name: string
  imageUrl: string
  description: string | null
  menuItemId: string | null
  externalUrl: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string | null
  updatedAt: string | null
}

export type PromotionRow = {
  id: string
  name: string
  image_url: string
  description: string | null
  menu_item_id: string | null
  external_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string | null
  updated_at: string | null
}

export function promotionRowToShop(row: PromotionRow): ShopPromotion {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url,
    description: row.description,
    menuItemId: row.menu_item_id,
    externalUrl: row.external_url,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
