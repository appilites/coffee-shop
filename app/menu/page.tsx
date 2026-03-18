"use client"
import { Suspense, useEffect, useRef, useState } from "react"
import { menuItemService, categoryService } from "@/lib/supabase/database"
import { createBrowserClient } from "@/lib/supabase/client"
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
  const menuDataRef = useRef<MenuData | null>(null)

  useEffect(() => {
    fetchMenuData()
  }, [])

  // Supabase Realtime: listen for ANY change on menu_items or menu_categories
  // and immediately re-fetch so the shop is always up to date with the dashboard
  useEffect(() => {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel("menu-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => {
          fetchMenuData(false)
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_categories" },
        () => {
          fetchMenuData(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Refresh when user switches back to this tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchMenuData(false)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  const fetchMenuData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      const [categories, menuItems] = await Promise.all([
        categoryService.getAll(),
        menuItemService.getAll(),
      ])

      const newData = {
        categories,
        menuItems,
        customizations: [],
      }
      menuDataRef.current = newData
      setMenuData(newData)
    } catch (error) {
      console.error("Error fetching menu data:", error)
      if (!menuDataRef.current) {
        setMenuData({ categories: [], menuItems: [], customizations: [] })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

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
