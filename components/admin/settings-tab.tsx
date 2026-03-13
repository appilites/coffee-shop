"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { Location } from "@/lib/types"

export function SettingsTab() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.from("locations").select("*").order("name")

    if (error) {
      console.error("[v0] Error fetching locations:", error)
    } else {
      setLocations(data || [])
    }
    setLoading(false)
  }

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    setSaving(true)
    const supabase = createBrowserClient()
    const { error } = await supabase.from("locations").update(updates).eq("id", id)

    if (error) {
      console.error("[v0] Error updating location:", error)
    } else {
      fetchLocations()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Store Locations</h2>
        <div className="space-y-4">
          {locations.map((location) => (
            <Card key={location.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{location.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={location.is_active}
                    onCheckedChange={(checked) => updateLocation(location.id, { is_active: checked })}
                  />
                  <Label className="text-sm">{location.is_active ? "Active" : "Inactive"}</Label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor={`phone-${location.id}`}>Phone</Label>
                  <Input
                    id={`phone-${location.id}`}
                    defaultValue={location.phone || ""}
                    onBlur={(e) => updateLocation(location.id, { phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`hours-${location.id}`}>Hours</Label>
                  <Input
                    id={`hours-${location.id}`}
                    defaultValue={location.hours || ""}
                    onBlur={(e) => updateLocation(location.id, { hours: e.target.value })}
                    placeholder="e.g., Mon-Fri 7am-6pm"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">System Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Send order updates to customers</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Accept Drive-Through Orders</Label>
              <p className="text-sm text-muted-foreground">Allow customers to place drive-through orders</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Accept In-Store Pickup</Label>
              <p className="text-sm text-muted-foreground">Allow customers to place in-store pickup orders</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
    </div>
  )
}
