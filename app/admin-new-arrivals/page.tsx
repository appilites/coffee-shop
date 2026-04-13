"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { NewArrivalsForm } from "@/components/new-arrivals-form"

interface NewArrival {
  id: string
  title: string
  description: string | null
  image_url: string | null
  button_text: string
  redirect_link: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export default function AdminNewArrivalsPage() {
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<NewArrival | null>(null)

  useEffect(() => {
    fetchNewArrivals()
  }, [])

  const fetchNewArrivals = async () => {
    try {
      setLoading(true)
      // Fetch all items (not just active ones) for admin
      const response = await fetch('/api/new-arrivals-admin')
      if (!response.ok) {
        // Fallback to regular endpoint
        const fallbackResponse = await fetch('/api/new-arrivals')
        const data = await fallbackResponse.json()
        setNewArrivals(data)
        return
      }
      const data = await response.json()
      setNewArrivals(data)
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
      toast.error('Failed to load new arrivals')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this new arrival?')) return

    try {
      const response = await fetch(`/api/new-arrivals/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete')
      
      toast.success('New arrival deleted successfully')
      fetchNewArrivals()
    } catch (error) {
      console.error('Error deleting new arrival:', error)
      toast.error('Failed to delete new arrival')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingItem(null)
    fetchNewArrivals()
  }

  const handleEdit = (item: NewArrival) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <NewArrivalsForm
          initialData={editingItem || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">New Arrivals Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your new arrivals section content
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Arrival
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newArrivals.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.image_url && (
                <div className="aspect-video relative">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Order: {item.display_order}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {newArrivals.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="font-semibold text-lg mb-2">No new arrivals found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first new arrival
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Arrival
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}