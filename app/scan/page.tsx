"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, X, AlertCircle } from "lucide-react"

export default function ScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState("")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    startCamera()

    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      streamRef.current = stream
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      setIsScanning(true)
      scanQRCode()
    } catch (err) {
      console.error("[v0] Camera error:", err)
      setHasPermission(false)
      setError("Camera access denied. Please enable camera permissions to scan QR codes.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const scanQRCode = () => {
    // Simulate QR code scanning
    // In production, you would use a library like @zxing/browser or jsQR
    const scanInterval = setInterval(() => {
      if (!isScanning) {
        clearInterval(scanInterval)
        return
      }

      // For demo: simulate QR code detection after 2 seconds
      // In real implementation, you'd analyze the video feed
    }, 100)

    // Simulate successful scan after 2 seconds for demo
    setTimeout(() => {
      if (isScanning) {
        handleQRCodeDetected("MENU_QR_CODE")
        clearInterval(scanInterval)
      }
    }, 2000)
  }

  const handleQRCodeDetected = (qrData: string) => {
    setIsScanning(false)
    stopCamera()

    // Navigate to menu when QR code is detected
    if (qrData.includes("MENU")) {
      router.push("/menu")
    }
  }

  const handleManualEntry = () => {
    stopCamera()
    router.push("/menu")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border" style={{ backgroundColor: '#181511' }}>
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
          <h1 className="font-serif text-lg sm:text-xl font-bold text-foreground">Scan QR Code</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="h-9 w-9 sm:h-10 sm:w-10">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="overflow-hidden">
          {hasPermission === false ? (
            <div className="p-6 sm:p-8 text-center">
              <AlertCircle className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-warning" />
              <h2 className="mb-2 font-serif text-lg sm:text-xl font-semibold text-foreground">
                Camera Access Required
              </h2>
              <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground px-2">{error}</p>
              <Button onClick={startCamera} className="bg-brand text-white hover:bg-brand-dark min-h-[44px]">
                <Camera className="mr-2 h-4 w-4" />
                Enable Camera
              </Button>
            </div>
          ) : (
            <div className="relative aspect-square bg-black">
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative h-56 w-56 sm:h-64 sm:w-64 border-4 border-white/50 rounded-2xl">
                  <div className="absolute top-0 left-0 h-6 w-6 sm:h-8 sm:w-8 border-t-4 border-l-4 border-brand rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 h-6 w-6 sm:h-8 sm:w-8 border-t-4 border-r-4 border-brand rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 h-6 w-6 sm:h-8 sm:w-8 border-b-4 border-l-4 border-brand rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 h-6 w-6 sm:h-8 sm:w-8 border-b-4 border-r-4 border-brand rounded-br-2xl" />

                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-1 w-full bg-brand/50 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground px-2">
            Position the QR code within the frame to scan
          </p>
          <Button variant="outline" onClick={handleManualEntry} className="bg-transparent min-h-[44px]">
            Enter Manually
          </Button>
        </div>

        <Card className="mt-4 sm:mt-6 bg-brand/5 p-3 sm:p-4">
          <p className="text-center text-xs sm:text-sm text-muted-foreground px-2">
            <strong className="text-foreground">Demo Mode:</strong> Automatically redirects to menu after 2 seconds
          </p>
        </Card>
      </div>
    </div>
  )
}
