"use client"

import type { Location } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Clock, Phone } from "lucide-react"

interface LocationSelectorProps {
  locations: Location[]
  onSelectLocation: (locationId: string) => void
}

export default function LocationSelector({ locations, onSelectLocation }: LocationSelectorProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Choose Your Location</h1>
          <p className="mt-2 text-muted-foreground">Select the coffee shop you'll pick up from</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          {locations.map((location) => (
            <Card key={location.id} className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4">
                <h3 className="font-serif text-xl font-semibold text-foreground">{location.name}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      {location.address}, {location.city}, {location.state} {location.zip_code}
                    </span>
                  </div>
                  {location.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{location.phone}</span>
                    </div>
                  )}
                  {location.opening_time && location.closing_time && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {location.opening_time.slice(0, 5)} - {location.closing_time.slice(0, 5)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={() => onSelectLocation(location.id)}
                className="w-full bg-brand text-white hover:bg-brand-dark"
              >
                Select This Location
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
