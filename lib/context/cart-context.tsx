"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { MenuItem } from "@/lib/types"

export interface CartItemData {
  id: string
  menuItem: MenuItem
  quantity: number
  selectedCustomizations: Array<{
    optionId: string
    optionName: string
    choices: Array<{ id: string; name: string; priceModifier: number }>
  }>
  totalPrice: number
}

interface CartContextType {
  items: CartItemData[]
  addItem: (item: CartItemData) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  selectedLocation: string | null
  setSelectedLocation: (locationId: string | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("coffee-cart")
      const savedLocation = localStorage.getItem("coffee-location")
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (e) {
          console.error("Failed to parse cart:", e)
          localStorage.removeItem("coffee-cart")
        }
      }
      if (savedLocation) {
        setSelectedLocation(savedLocation)
      }
    } catch (e) {
      console.error("Failed to access localStorage:", e)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("coffee-cart", JSON.stringify(items))
    } catch (e) {
      console.error("Failed to save cart:", e)
    }
  }, [items])

  useEffect(() => {
    try {
      if (selectedLocation) {
        localStorage.setItem("coffee-location", selectedLocation)
      }
    } catch (e) {
      console.error("Failed to save location:", e)
    }
  }, [selectedLocation])

  const addItem = (item: CartItemData) => {
    setItems((prev) => [...prev, item])
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity, totalPrice: (item.totalPrice / item.quantity) * quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        selectedLocation,
        setSelectedLocation,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
