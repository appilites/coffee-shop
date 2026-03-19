"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import type { MenuItem } from "@/lib/types"

export function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    image_url: "",
    available: true,
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.from("menu_items").select("*").order("name")

    if (error) {
      console.error("[v0] Error fetching menu items:", error)
    } else {
      setItems((data || []) as MenuItem[])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createBrowserClient()

    const itemData: Record<string, unknown> = {
      name: formData.name,
      description: formData.description || null,
      category_id: formData.category_id || null,
      base_price: Number.parseFloat(formData.price) || 0,
      image_url: formData.image_url || null,
      is_available: formData.available,
      updated_at: new Date().toISOString(),
    }

    if (editingItem) {
      if (Array.isArray((editingItem as any).variations)) {
        itemData.variations = (editingItem as any).variations
      }
      const { error } = await supabase.from("menu_items").update(itemData).eq("id", editingItem.id)

      if (error) {
        console.error("[v0] Error updating item:", error)
        return
      }
    } else {
      const newId = `item-${Date.now()}`
      const { error } = await supabase.from("menu_items").insert([{
        id: newId,
        ...itemData,
        is_featured: false,
        prep_time_minutes: 5,
      }])

      if (error) {
        console.error("[v0] Error creating item:", error)
        return
      }
    }

    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({ name: "", description: "", category_id: "", price: "", image_url: "", available: true })
    fetchItems()
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    const row = item as any
    setFormData({
      name: item.name,
      description: item.description || "",
      category_id: row.category_id ?? "",
      price: String(row.base_price ?? item.base_price ?? 0),
      image_url: item.image_url || "",
      available: row.is_available ?? item.is_available ?? true,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    const supabase = createBrowserClient()
    const { error } = await supabase.from("menu_items").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting item:", error)
    } else {
      fetchItems()
    }
  }

  const toggleAvailability = async (id: string, available: boolean) => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from("menu_items").update({ is_available: !available, updated_at: new Date().toISOString() }).eq("id", id)

    if (error) {
      console.error("[v0] Error updating availability:", error)
    } else {
      fetchItems()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Menu Items</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null)
                setFormData({
                  name: "",
                  description: "",
                  category_id: "",
                  price: "",
                  image_url: "",
                  available: true,
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category_id">Category ID</Label>
                <Input
                  id="category_id"
                  placeholder="e.g. cat-power-bowl, cat-17"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Available</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const row = item as any
          const available = row.is_available ?? true
          const price = row.base_price ?? 0
          const variationsCount = Array.isArray(row.variations) ? row.variations.length : 0
          return (
          <Card key={item.id} className={`p-4 ${!available ? "opacity-60" : ""}`}>
            {item.image_url && (
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{row.category_id || "—"}</p>
              </div>
              <p className="font-bold text-foreground">${Number(price).toFixed(2)}</p>
            </div>
            {item.description && <p className="text-sm text-muted-foreground mb-3">{item.description}</p>}
            {variationsCount > 0 && (
              <p className="text-xs text-muted-foreground mb-2">{variationsCount} variation option(s)</p>
            )}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => toggleAvailability(item.id, available)}>
                {available ? "Disable" : "Enable"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
          )
        })}
      </div>
    </div>
  )
}
