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
    category: "coffee",
    price: "",
    image_url: "",
    available: true,
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.from("menu_items").select("*").order("category").order("name")

    if (error) {
      console.error("[v0] Error fetching menu items:", error)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createBrowserClient()

    const itemData = {
      ...formData,
      price: Number.parseFloat(formData.price),
    }

    if (editingItem) {
      const { error } = await supabase.from("menu_items").update(itemData).eq("id", editingItem.id)

      if (error) {
        console.error("[v0] Error updating item:", error)
        return
      }
    } else {
      const { error } = await supabase.from("menu_items").insert([itemData])

      if (error) {
        console.error("[v0] Error creating item:", error)
        return
      }
    }

    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({ name: "", description: "", category: "coffee", price: "", image_url: "", available: true })
    fetchItems()
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category,
      price: item.price.toString(),
      image_url: item.image_url || "",
      available: item.available,
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
    const { error } = await supabase.from("menu_items").update({ available: !available }).eq("id", id)

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
                  category: "coffee",
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
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="coffee">Coffee</option>
                  <option value="espresso">Espresso</option>
                  <option value="tea">Tea</option>
                  <option value="food">Food</option>
                  <option value="other">Other</option>
                </select>
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
        {items.map((item) => (
          <Card key={item.id} className={`p-4 ${!item.available ? "opacity-60" : ""}`}>
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
                <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
              </div>
              <p className="font-bold text-foreground">${item.price.toFixed(2)}</p>
            </div>
            {item.description && <p className="text-sm text-muted-foreground mb-3">{item.description}</p>}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => toggleAvailability(item.id, item.available)}>
                {item.available ? "Disable" : "Enable"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
