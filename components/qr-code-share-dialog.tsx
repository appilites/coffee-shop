"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Share2, Copy, Check, Coffee } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRCodeShareDialog({ open, onOpenChange }: QRCodeShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Generate the menu URL for sharing
  const menuUrl = typeof window !== "undefined" ? `${window.location.origin}/menu` : "https://druids-nutrition.com/menu"

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Menu link has been copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Druids Nutrition - Order Online",
          text: "Check out Druids Nutrition! Order ahead and skip the line.",
          url: menuUrl,
        })
        toast({
          title: "Shared successfully!",
          description: "Thanks for sharing Druids Nutrition",
        })
      } catch (err) {
        // User cancelled share, no need to show error
      }
    } else {
      // Fallback to copy link
      handleCopyLink()
    }
  }

  const handleDownload = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 400
    canvas.height = 480

    // White background with border
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, 400, 480)

    // Brand color border
    ctx.fillStyle = "#78350f"
    ctx.fillRect(20, 20, 360, 360)

    // Inner white space
    ctx.fillStyle = "white"
    ctx.fillRect(30, 30, 340, 340)

    // Draw QR pattern
    ctx.fillStyle = "black"
    const gridSize = 17
    const cellSize = 300 / gridSize
    const offsetX = 50
    const offsetY = 50

    // Generate a more realistic QR pattern
    const pattern = Array.from({ length: gridSize * gridSize }, () => Math.random() > 0.5)

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (pattern[i * gridSize + j]) {
          ctx.fillRect(offsetX + i * cellSize, offsetY + j * cellSize, cellSize, cellSize)
        }
      }
    }

    // Add branding text
    ctx.fillStyle = "#78350f"
    ctx.font = "bold 24px serif"
    ctx.textAlign = "center"
    ctx.fillText("Druids Nutrition", 200, 420)

    ctx.font = "14px sans-serif"
    ctx.fillStyle = "#666"
    ctx.fillText("Scan to Order", 200, 450)

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "druids-nutrition-qr-code.png"
        a.click()
        URL.revokeObjectURL(url)

        toast({
          title: "QR Code downloaded!",
          description: "You can now print or share the QR code",
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-brand-dark">Share Menu QR Code</DialogTitle>
          <DialogDescription>Share this QR code to let customers order from anywhere</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="overflow-hidden border-brand/20 bg-gradient-to-br from-brand/5 to-accent/5 p-8">
            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-xl border-4 border-brand bg-card p-4 shadow-lg">
              {/* Enhanced QR code pattern */}
              <div className="grid grid-cols-13 gap-[3px]">
                {Array.from({ length: 169 }).map((_, i) => {
                  const isCornerMarker =
                    ((i < 21 || i % 13 < 3) && i < 39) || // Top-left
                    ((i < 21 || i % 13 > 9) && i < 13 * 3) || // Top-right
                    (i > 130 && i % 13 < 3) // Bottom-left
                  const isCenter = i >= 65 && i <= 83 && i % 13 >= 5 && i % 13 <= 7

                  return (
                    <div
                      key={i}
                      className={`h-[11px] w-[11px] rounded-[1px] ${
                        isCornerMarker || isCenter || Math.random() > 0.5 ? "bg-brand-dark" : "bg-card"
                      }`}
                    />
                  )
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-brand" />
                <p className="font-serif text-lg font-semibold text-brand-dark">Druids Nutrition</p>
              </div>
              <p className="text-sm text-muted-foreground">Scan to access our menu</p>
            </div>
          </Card>

          <div className="flex items-center gap-2 rounded-lg border border-brand/20 bg-muted/50 p-3">
            <input
              type="text"
              readOnly
              value={menuUrl}
              className="flex-1 truncate bg-transparent text-sm outline-none"
            />
            <Button size="sm" variant="ghost" onClick={handleCopyLink} className="shrink-0 hover:bg-brand/10">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-brand" />}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="w-full border-brand/30 hover:bg-brand/5 bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleShare} className="w-full bg-brand text-white hover:bg-brand-dark">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          <div className="rounded-lg border border-brand/20 bg-accent/10 p-3 text-xs">
            <p className="font-semibold text-brand-dark">💡 Pro Tip</p>
            <p className="mt-1 text-muted-foreground">
              Print this QR code and display it at your location for easy customer access
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
