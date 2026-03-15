"use client"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function SettingsTab() {
  return (
    <div className="space-y-6">
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
