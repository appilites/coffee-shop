"use client"

import { Card } from "@/components/ui/card"
import { QrCode } from "lucide-react"

interface QRCodeDisplayProps {
  locationId: string
  locationName: string
}

export function QRCodeDisplay({ locationId, locationName }: QRCodeDisplayProps) {
  const qrCodeData = `DRUIDSNUTRITION_MENU_${locationId}`

  return (
    <Card className="p-6 text-center">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">{locationName}</h3>
        <p className="text-sm text-muted-foreground">Scan to order</p>
      </div>

      <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-lg border-4 border-brand/20 bg-card p-4">
        {/* Placeholder QR code - replace with actual QR generation */}
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className={`h-2 w-2 ${Math.random() > 0.5 ? "bg-foreground" : "bg-card"}`} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <QrCode className="h-4 w-4" />
        <span>Point your camera at this code</span>
      </div>
    </Card>
  )
}
