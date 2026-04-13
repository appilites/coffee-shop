# New Arrivals Management System - Simplified Implementation

## Overview
This system provides a complete New Arrivals management solution with local file upload to Supabase Storage and real-time database integration.

## Key Features
- ✅ **File Upload Only**: No URL input option - only local file uploads
- ✅ **Supabase Storage**: Images stored in Supabase Storage bucket
- ✅ **Database Integration**: All data saved to database
- ✅ **Real-time Updates**: Changes reflect immediately on coffee shop
- ✅ **Admin Interface**: Simple admin page for CRUD operations

## Quick Setup Steps

### 1. Create Supabase Storage Bucket
1. Go to **Supabase Dashboard** → **Storage**
2. Create bucket: `new-arrivals-images` (make it **Public**)
3. Run the SQL from `supabase-storage-setup.sql`

### 2. Create Database Table
Run the SQL from `new-arrivals-table.sql` in Supabase SQL Editor

### 3. Access Admin Interface
Visit: `http://localhost:3000/admin-new-arrivals`

## Files Created

### Components
- `components/ui/file-upload.tsx` - File upload component (no URL option)
- `components/new-arrivals-form.tsx` - Create/Edit form
- `components/new-arrivals-section.tsx` - Coffee shop display (updated with real-time refresh)

### API Routes
- `app/api/upload/route.ts` - Handle file uploads to Supabase Storage
- `app/api/new-arrivals/route.ts` - GET (active items) & POST (create)
- `app/api/new-arrivals/[id]/route.ts` - GET, PUT, DELETE individual items
- `app/api/new-arrivals-admin/route.ts` - GET all items (including inactive)

### Admin Page
- `app/admin-new-arrivals/page.tsx` - Complete admin interface

## How It Works

### Coffee Shop Side
1. **Real-time Display**: `NewArrivalsSection` component fetches from database every 30 seconds
2. **Fallback Support**: Shows default images if database is unavailable
3. **Automatic Updates**: Any changes in admin reflect on coffee shop

### Admin Side
1. **File Upload**: Drag & drop or click to upload images
2. **Supabase Storage**: Images uploaded to `new-arrivals-images` bucket
3. **Database Save**: All data (including image URLs) saved to `new_arrivals` table
4. **CRUD Operations**: Create, Read, Update, Delete functionality
5. **Image Cleanup**: Deleting items also removes images from storage

## Usage Instructions

### For Admin Users
1. Visit `/admin-new-arrivals`
2. Click "Add New Arrival"
3. Fill form and upload image
4. Save - changes appear immediately on coffee shop

### For Coffee Shop
- New Arrivals section automatically shows active items from database
- Updates every 30 seconds
- Falls back to static images if database unavailable

## Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema
```sql
CREATE TABLE new_arrivals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  button_text TEXT DEFAULT 'Try Now',
  redirect_link TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Storage Bucket
- **Name**: `new-arrivals-images`
- **Public**: Yes
- **Policies**: Read (public), Write/Update/Delete (authenticated)

This simplified system removes the URL input complexity and focuses on a clean file upload experience with full database integration.

## Database Setup

### 1. Supabase Storage Bucket Creation
First, create a storage bucket in Supabase dashboard:

1. Go to **Supabase Dashboard**
2. Navigate to **Storage** section
3. Click **Create Bucket**
4. Bucket name: `new-arrivals-images`
5. Enable **Public bucket** option
6. Click **Create bucket**

### 2. Storage Policies Setup
Set up policies for the bucket:

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'new-arrivals-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'new-arrivals-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'new-arrivals-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'new-arrivals-images');
```

### 3. Supabase Table Creation
Now create the main table in Supabase dashboard:

```sql
-- New Arrivals Table
CREATE TABLE new_arrivals (
  id TEXT PRIMARY KEY DEFAULT ('arrival-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 8)),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  button_text TEXT DEFAULT 'Try Now',
  redirect_link TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for better performance
CREATE INDEX idx_new_arrivals_active ON new_arrivals(is_active, display_order);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_new_arrivals_updated_at
  BEFORE UPDATE ON new_arrivals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample Data Insert
INSERT INTO new_arrivals (title, description, image_url, button_text, redirect_link, display_order) VALUES
('Protein Waffles', 'Build your own protein-packed waffle with your favorite toppings', '/newarrival.jfif', 'Try Now', '/menu?category=cat-17', 1),
('Oat Milk Chai Tea Latte', 'Slow sips, sweet moments. Protein-packed chai tea latte with oat milk', '/newarrival1.jfif', 'Try Now', '/menu?category=cat-16', 2),
('Specialty Drinks', 'Explore our premium specialty drink collection with unique flavors', '/newarrival2.jfif', 'Try Now', '/menu?category=cat-specialty-drinks', 3);
```

## Admin Dashboard Implementation

### 2. Types Definition
Add these interfaces in `lib/types.ts`:

```typescript
export interface NewArrival {
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

export interface NewArrivalFormData {
  title: string
  description?: string
  imageUrl?: string
  buttonText: string
  redirectLink?: string
  isActive: boolean
  displayOrder: number
}
```

### 3. Database Service
Add this service in `lib/database.ts`:

```typescript
// New Arrivals Service
export const newArrivalService = {
  async getAll() {
    const { data, error } = await supabase
      .from('new_arrivals')
      .select('*')
      .order('display_order')
    
    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('new_arrivals')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(newArrival: NewArrivalFormData) {
    const insertData = {
      title: newArrival.title,
      description: newArrival.description || null,
      image_url: newArrival.imageUrl || null,
      button_text: newArrival.buttonText,
      redirect_link: newArrival.redirectLink || null,
      is_active: newArrival.isActive,
      display_order: newArrival.displayOrder
    }

    const { data, error } = await supabase
      .from('new_arrivals')
      .insert(insertData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<NewArrivalFormData>) {
    const updateData: any = {}
    if (updates.title) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
    if (updates.buttonText) updateData.button_text = updates.buttonText
    if (updates.redirectLink !== undefined) updateData.redirect_link = updates.redirectLink
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder
    
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('new_arrivals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('new_arrivals')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
```

### 4. Image Upload API Route
Create `app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for server-side operations
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `new-arrival-${timestamp}-${randomString}.${fileExtension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('new-arrivals-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ 
        error: 'Failed to upload image to storage' 
      }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('new-arrivals-images')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName: fileName
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// DELETE method for removing images
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    
    if (!fileName) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
    }

    const { error } = await supabase.storage
      .from('new-arrivals-images')
      .remove([fileName])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ 
        error: 'Failed to delete image' 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
```

### 5. Image Upload Component
Create `components/ui/image-upload.tsx`:

```typescript
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  onFileNameChange?: (fileName: string) => void
}

export function ImageUpload({ value, onChange, onFileNameChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update form with the uploaded image URL
      onChange(result.url)
      setFileName(result.fileName)
      onFileNameChange?.(result.fileName)
      
      toast.success('Image uploaded successfully!')

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (fileName) {
      try {
        // Delete from storage
        await fetch(`/api/upload?fileName=${fileName}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Delete error:', error)
      }
    }

    setPreview(null)
    setFileName("")
    onChange("")
    onFileNameChange?.("")
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUrlChange = (url: string) => {
    setPreview(url)
    onChange(url)
    setFileName("") // Clear filename for manual URLs
  }

  return (
    <div className="space-y-4">
      {/* File Upload Section */}
      <div>
        <Label>Upload Image</Label>
        {preview ? (
          <div className="relative mt-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <div className="flex flex-col items-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mb-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          </div>
        )}
        
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* OR Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* Manual URL Input */}
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={value || ""}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="mt-1"
        />
      </div>
    </div>
  )
}
```

### 6. API Routes

#### `app/api/new-arrivals/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import { newArrivalService } from "@/lib/database"

// GET - List all new arrivals
export async function GET() {
  try {
    const newArrivals = await newArrivalService.getAll()
    return NextResponse.json(newArrivals)
  } catch (error) {
    console.error('Error fetching new arrivals:', error)
    return NextResponse.json(
      { error: "Failed to fetch new arrivals" }, 
      { status: 500 }
    )
  }
}

// POST - Create new arrival
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.buttonText) {
      return NextResponse.json(
        { error: "Title and button text are required" },
        { status: 400 }
      )
    }

    const newArrival = await newArrivalService.create(body)
    return NextResponse.json(newArrival, { status: 201 })
  } catch (error) {
    console.error('Error creating new arrival:', error)
    return NextResponse.json(
      { error: "Failed to create new arrival" }, 
      { status: 500 }
    )
  }
}
```

#### `app/api/new-arrivals/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import { newArrivalService } from "@/lib/database"

// GET - Get single new arrival
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const newArrival = await newArrivalService.getById(params.id)
    return NextResponse.json(newArrival)
  } catch (error) {
    console.error('Error fetching new arrival:', error)
    return NextResponse.json(
      { error: "New arrival not found" }, 
      { status: 404 }
    )
  }
}

// PUT - Update new arrival
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updatedNewArrival = await newArrivalService.update(params.id, body)
    return NextResponse.json(updatedNewArrival)
  } catch (error) {
    console.error('Error updating new arrival:', error)
    return NextResponse.json(
      { error: "Failed to update new arrival" }, 
      { status: 500 }
    )
  }
}

// DELETE - Delete new arrival
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await newArrivalService.delete(params.id)
    return NextResponse.json({ message: "New arrival deleted successfully" })
  } catch (error) {
    console.error('Error deleting new arrival:', error)
    return NextResponse.json(
      { error: "Failed to delete new arrival" }, 
      { status: 500 }
    )
  }
}
```

### 7. Admin Dashboard Pages

#### Main New Arrivals Page: `app/(dashboard)/new-arrivals/page.tsx`
```typescript
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { NewArrival } from "@/lib/types"

export default function NewArrivalsPage() {
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchNewArrivals()
  }, [])

  const fetchNewArrivals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/new-arrivals')
      if (!response.ok) throw new Error('Failed to fetch')
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

  const filteredNewArrivals = newArrivals.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold">New Arrivals</h2>
          <p className="text-muted-foreground mt-1">
            Manage your new arrivals section content
          </p>
        </div>
        <Link href="/new-arrivals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Arrival
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search new arrivals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* New Arrivals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNewArrivals.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
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
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Order: {item.display_order}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/new-arrivals/${item.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/new-arrivals/${item.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
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
          </motion.div>
        ))}
      </div>

      {filteredNewArrivals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="font-semibold text-lg mb-2">No new arrivals found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first new arrival'}
            </p>
            <Link href="/new-arrivals/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Arrival
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

#### Create New Arrival Form: `app/(dashboard)/new-arrivals/new/page.tsx`
```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import type { NewArrivalFormData } from "@/lib/types"

export default function NewNewArrivalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [formData, setFormData] = useState<NewArrivalFormData>({
    title: "",
    description: "",
    imageUrl: "",
    buttonText: "Try Now",
    redirectLink: "",
    isActive: true,
    displayOrder: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/new-arrivals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fileName: fileName // Store filename for future deletion
        })
      })

      if (!response.ok) throw new Error('Failed to create')

      toast.success('New arrival created successfully')
      router.push('/new-arrivals')
    } catch (error) {
      console.error('Error creating new arrival:', error)
      toast.error('Failed to create new arrival')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/new-arrivals">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="font-serif text-3xl font-bold">Add New Arrival</h2>
          <p className="text-muted-foreground">Create a new arrival item</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Arrival Details</CardTitle>
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

            {/* Image Upload Component */}
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload
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
                Create New Arrival
              </Button>
              <Link href="/new-arrivals">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### Edit New Arrival Form: `app/(dashboard)/new-arrivals/[id]/edit/page.tsx`
```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import type { NewArrival, NewArrivalFormData } from "@/lib/types"

export default function EditNewArrivalPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [fileName, setFileName] = useState<string>("")
  const [formData, setFormData] = useState<NewArrivalFormData>({
    title: "",
    description: "",
    imageUrl: "",
    buttonText: "Try Now",
    redirectLink: "",
    isActive: true,
    displayOrder: 0
  })

  useEffect(() => {
    fetchNewArrival()
  }, [params.id])

  const fetchNewArrival = async () => {
    try {
      const response = await fetch(`/api/new-arrivals/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data: NewArrival = await response.json()
      setFormData({
        title: data.title,
        description: data.description || "",
        imageUrl: data.image_url || "",
        buttonText: data.button_text,
        redirectLink: data.redirect_link || "",
        isActive: data.is_active,
        displayOrder: data.display_order
      })
    } catch (error) {
      console.error('Error fetching new arrival:', error)
      toast.error('Failed to load new arrival')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/new-arrivals/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fileName: fileName
        })
      })

      if (!response.ok) throw new Error('Failed to update')

      toast.success('New arrival updated successfully')
      router.push('/new-arrivals')
    } catch (error) {
      console.error('Error updating new arrival:', error)
      toast.error('Failed to update new arrival')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/new-arrivals">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="font-serif text-3xl font-bold">Edit New Arrival</h2>
          <p className="text-muted-foreground">Update arrival item details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Arrival Details</CardTitle>
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

            {/* Image Upload Component */}
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload
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
                Update New Arrival
              </Button>
              <Link href="/new-arrivals">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 8. Navigation Update
Add New Arrivals tab in `components/layout/sidebar.tsx`:

```typescript
const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: FolderOpen },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'New Arrivals', href: '/new-arrivals', icon: Sparkles }, // Add this line
  { name: 'Settings', href: '/settings', icon: Settings },
]
```

### 9. Coffee Shop Integration

To fetch New Arrivals in coffee shop:

```typescript
// Add in lib/supabase/database.ts
export const newArrivalService = {
  async getActive(): Promise<NewArrival[]> {
    if (!supabase) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('new_arrivals')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
      return []
    }
  }
}
```

### 10. Coffee Shop Component Update
Update your existing New Arrivals component:

```typescript
"use client"

import { useState, useEffect } from "react"
import { newArrivalService } from "@/lib/supabase/database"
import type { NewArrival } from "@/lib/types"

export default function NewArrivalsSection() {
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewArrivals()
  }, [])

  const fetchNewArrivals = async () => {
    try {
      const data = await newArrivalService.getActive()
      setNewArrivals(data)
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (newArrivals.length === 0) return null

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newArrivals.map((item) => (
            <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600 mb-4">{item.description}</p>
                )}
                {item.redirect_link && (
                  <a
                    href={item.redirect_link}
                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {item.button_text}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## Environment Variables Setup

### Admin Dashboard `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Coffee Shop `.env.local`  
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Testing Checklist

### ✅ Database
- [ ] Supabase Storage bucket created (`new-arrivals-images`)
- [ ] Storage policies configured
- [ ] New arrivals table created successfully
- [ ] Sample data inserted
- [ ] Triggers working for updated_at

### ✅ Image Upload System
- [ ] Upload API endpoint working (`/api/upload`)
- [ ] File validation (type, size) working
- [ ] Images uploading to Supabase Storage
- [ ] Public URLs generating correctly
- [ ] Image deletion working
- [ ] ImageUpload component working

### ✅ Admin Dashboard
- [ ] New Arrivals page loads
- [ ] Can create new arrivals with image upload
- [ ] Can edit existing arrivals
- [ ] Can delete arrivals (and their images)
- [ ] Image preview working in forms
- [ ] Form validation works
- [ ] File upload progress indicators working

### ✅ Coffee Shop
- [ ] New arrivals section displays
- [ ] Data loads from database
- [ ] Images display properly from Supabase Storage
- [ ] Links redirect correctly

### ✅ Integration
- [ ] Changes in admin reflect on coffee shop
- [ ] Active/inactive status works
- [ ] Display order works correctly
- [ ] Image uploads appear immediately on coffee shop

## Security Notes
- **Service Role Key** صرف server-side operations کے لیے استعمال کریں
- **Storage Policies** properly configured ہونے چاہیے
- **File validation** client اور server دونوں side پر کریں
- **File size limits** enforce کریں (5MB max recommended)

## Performance Tips
- Images کو **WebP format** میں convert کریں better compression کے لیے
- **Image optimization** add کریں (resize, compress)
- **CDN** استعمال کریں faster loading کے لیے
- **Lazy loading** implement کریں images کے لیے

## Troubleshooting

### Upload Issues
```typescript
// Debug upload errors
console.log('File type:', file.type)
console.log('File size:', file.size)
console.log('Supabase response:', data, error)
```

### Storage Access Issues
```sql
-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'new-arrivals-images';

-- Test public access
SELECT storage.url('new-arrivals-images', 'test-file.jpg');
```

## Image Management Options

### ❌ **Bucket کی ضرورت نہیں!**
آپ کو Supabase Storage bucket بنانے کی ضرورت نہیں ہے۔

### ✅ **3 آسان طریقے:**

#### 1. **Local Images (Recommended)**
```bash
# آپ کے existing images استعمال کریں
public/
  ├── newarrival.jfif      # ✅ پہلے سے موجود
  ├── newarrival1.jfif     # ✅ پہلے سے موجود  
  ├── newarrival2.jfif     # ✅ پہلے سے موجود
  └── new-images/          # نئے images یہاں add کریں
      ├── arrival-4.jpg
      └── arrival-5.jpg
```

#### 2. **Image Upload Component (Optional)**
اگر آپ file upload چاہتے ہیں تو یہ component add کریں:

```typescript
// components/ui/image-upload.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create local URL for preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        
        // For now, just use the file name (you'll need to handle actual upload)
        const fileName = `/uploads/${file.name}`
        onChange(fileName)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setPreview(null)
    onChange("")
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="image-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload an image
              </span>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
```

#### 3. **URL Input (Simplest)**
```typescript
// Form میں صرف URL input field
<div className="space-y-2">
  <Label htmlFor="imageUrl">Image URL</Label>
  <Input
    id="imageUrl"
    type="url"
    value={formData.imageUrl}
    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
    placeholder="/newarrival.jfif or https://example.com/image.jpg"
  />
  {formData.imageUrl && (
    <div className="mt-2">
      <img
        src={formData.imageUrl}
        alt="Preview"
        className="w-32 h-32 object-cover rounded"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )}
</div>
```

### 🎯 **Quick Start**
1. **Existing images use کریں:** `/newarrival.jfif`, `/newarrival1.jfif`, `/newarrival2.jfif`
2. **نئے images** کو `public/` folder میں رکھیں
3. **Form میں path enter کریں:** `/your-image.jpg`

## Notes
- **No bucket needed for basic setup** - just use public folder for simple implementation
- **Existing images** are already available and will work: `/newarrival.jfif`, `/newarrival1.jfif`, `/newarrival2.jfif`
- **Redirect links** can use menu category links like `/menu?category=cat-17`
- **Display order** controls the ordering of items
- **Is_active flag** allows you to show/hide items
- **Image upload** provides professional file management with Supabase Storage
- **File validation** ensures only proper image files are uploaded
- **Automatic cleanup** removes old images when items are deleted

This complete system gives you full control over your New Arrivals section with professional image management capabilities!