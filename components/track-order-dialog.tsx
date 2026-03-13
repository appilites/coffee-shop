"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Search } from "lucide-react"

interface TrackOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TrackOrderDialog({ open, onOpenChange }: TrackOrderDialogProps) {
  const router = useRouter()
  const [orderId, setOrderId] = useState("")

  const handleTrackOrder = () => {
    if (orderId.trim()) {
      onOpenChange(false)
      router.push(`/order-status?orderId=${orderId.trim()}`)
      setOrderId("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTrackOrder()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-brand" />
            Track Your Order
          </DialogTitle>
          <DialogDescription>
            Enter your order ID to view real-time status updates and pickup details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="order-id" className="text-sm font-medium text-foreground">
              Order ID
            </label>
            <div className="flex gap-2">
              <Input
                id="order-id"
                placeholder="e.g., abc123de"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleTrackOrder}
                disabled={!orderId.trim()}
                size="icon"
                className="bg-brand hover:bg-brand-dark"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can find your order ID in your confirmation email or after completing checkout.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Need help finding your order?</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Check your confirmation email</li>
              <li>• Order ID is shown after payment</li>
              <li>• Format: 8 character alphanumeric code</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleTrackOrder} disabled={!orderId.trim()} className="flex-1 bg-brand hover:bg-brand-dark">
            Track Order
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
