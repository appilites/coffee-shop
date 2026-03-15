"use client"
import { Suspense, useEffect, useState } from "react"
import { menuItemService, categoryService } from "@/lib/supabase/database"
import MenuContent from "@/components/menu/menu-content"
import { Skeleton } from "@/components/ui/skeleton"
import type { MenuItem, MenuCategory } from "@/lib/types"

interface MenuData {
  categories: MenuCategory[]
  menuItems: MenuItem[]
  customizations: any[]
}

export default function MenuPage() {
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMenuData()
  }, [])

  // Auto-refresh every 15 seconds to catch new products immediately
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing menu data...')
      fetchMenuData(false) // Don't show loading spinner on auto-refresh
    }, 15000) // 15 seconds - very fast refresh

    return () => clearInterval(interval)
  }, [])

  // Listen for visibility change to refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible - refreshing menu data...')
        fetchMenuData(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const fetchMenuData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      console.log('🔄 Fetching menu data from Supabase...', new Date().toISOString())
      const [categories, menuItems] = await Promise.all([
        categoryService.getAll(),
        menuItemService.getAll()
      ])

      console.log('📊 Menu data fetched:', {
        categories: categories.length,
        menuItems: menuItems.length,
        timestamp: new Date().toISOString()
      })

      // Log sample products for debugging
      if (menuItems.length > 0) {
        console.log('📝 Sample products:', menuItems.slice(0, 3).map(item => ({
          id: item.id,
          name: item.name,
          category_id: item.category_id,
          is_available: item.is_available,
          created_at: item.created_at
        })))
      } else {
        console.warn('⚠️ No products found in database!')
        console.warn('💡 Make sure products have is_available = true in database')
      }

      setMenuData({
        categories,
        menuItems,
        customizations: [] // Will be populated when needed
      })
    } catch (error) {
      console.error('❌ Error fetching menu data:', error)
      console.error('Full error details:', error)
      // Keep existing data if refresh fails
      if (menuData) {
        console.log('⚠️ Keeping existing menu data due to error')
      } else {
        setMenuData({
          categories: [],
          menuItems: [],
          customizations: [],
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Expose refresh function to window for manual testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshMenu = () => {
        console.log('🔄 Manual refresh triggered')
        fetchMenuData(true)
      }
    }
  }, [])

  if (loading || !menuData) {
    return <MenuSkeleton />
  }

  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuContent menuData={menuData} onRefresh={() => fetchMenuData(true)} />
    </Suspense>
  )
}

function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    </div>
  )
}
