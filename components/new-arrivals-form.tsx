"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/ui/file-upload"

interface NewArrival {
  id?: string
  title: string
  description: string | null
  imageUrl: string | null
  buttonText: string
  redirectLink: string | null
  isActive: boolean
  displayOrder: number
}

interface NewArrivalsFormProps {
  initialData?: NewArrival
  onSuccess?: () => void
  onCancel?: () => void
}

export function NewArrivalsForm({ initialData, onSuccess, onCancel }: NewArrivalsFormProps) {
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    buttonText: initialData?.buttonText || "Try Now",
    redirectLink: initialData?.redirectLink || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    displayOrder: initialData?.displayOrder || 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData?.id 
        ? `/api/new-arrivals/${initialData.id}`
        : '/api/new-arrivals'
      
      const method = initialData?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      toast({
        title: "Success",
        description: initialData?.id ? 'New arrival updated successfully' : 'New arrival created successfully',
      })
      onSuccess?.()
    } catch (error) {
      console.error('Error saving new arrival:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save new arrival',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData?.id ? 'Edit New Arrival' : 'Create New Arrival'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text *</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* File Upload Component */}
          <div className="space-y-2">
            <Label>Image</Label>
            <FileUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              onFileNameChange={setFileName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirectLink">Redirect Link</Label>
            <Input
              id="redirectLink"
              value={formData.redirectLink}
              onChange={(e) => setFormData(prev => ({ ...prev, redirectLink: e.target.value }))}
              placeholder="/menu?category=cat-example"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {initialData?.id ? 'Update' : 'Create'} New Arrival
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}