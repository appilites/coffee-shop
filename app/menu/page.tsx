"use client"
import { Suspense } from "react"
import { mockMenuItems, mockCategories, mockCustomizationOptions, mockLocations } from "@/lib/mock-data"
import MenuContent from "@/components/menu/menu-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function MenuPage() {
  const menuData = {
    categories: mockCategories,
    menuItems: mockMenuItems,
    customizations: mockCustomizationOptions,
  }

  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuContent menuData={menuData} locations={mockLocations} />
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
