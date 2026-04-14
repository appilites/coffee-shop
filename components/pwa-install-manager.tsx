"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const INSTALL_EVENT_NAME = "pwa-install-request"
const AUTO_INSTALL_PROMPT_SEEN_KEY = "pwa-install-auto-prompt-seen-v1"

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches
  return iosStandalone || displayModeStandalone
}

export function requestPwaInstallPrompt() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(INSTALL_EVENT_NAME))
}

export function PwaInstallManager() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)

  const canPromptNatively = useMemo(() => Boolean(deferredPrompt), [deferredPrompt])

  useEffect(() => {
    if (typeof window === "undefined") return

    // Register service worker for offline shell + installability.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration failed:", err)
      })
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      maybeOpenDialog({ auto: true })
    }

    const onAppInstalled = () => {
      setDialogOpen(false)
      setDeferredPrompt(null)
    }

    const onInstallRequest = () => {
      if (!isStandaloneMode()) {
        maybeOpenDialog({ force: true })
      }
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)
    window.addEventListener(INSTALL_EVENT_NAME, onInstallRequest)

    // Open a custom install popup when site opens.
    const timer = window.setTimeout(() => {
      if (!isStandaloneMode()) {
        maybeOpenDialog({ auto: true })
      }
    }, 1400)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
      window.removeEventListener(INSTALL_EVENT_NAME, onInstallRequest)
    }
  }, [])

  const maybeOpenDialog = ({
    force = false,
    auto = false,
  }: {
    force?: boolean
    auto?: boolean
  } = {}) => {
    if (isStandaloneMode()) return
    if (!force && typeof window !== "undefined") {
      const alreadyShown = window.localStorage.getItem(AUTO_INSTALL_PROMPT_SEEN_KEY) === "1"
      if (alreadyShown) return
    }
    if (auto && typeof window !== "undefined") {
      window.localStorage.setItem(AUTO_INSTALL_PROMPT_SEEN_KEY, "1")
    }
    setDialogOpen(true)
  }

  const dismissDialog = () => {
    setDialogOpen(false)
  }

  const handleInstall = async () => {
    if (installing) return
    setInstalling(true)
    try {
      if (deferredPrompt) {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === "accepted") {
          setDialogOpen(false)
        }
        setDeferredPrompt(null)
      } else {
        // iOS/Safari fallback where beforeinstallprompt is not available.
        // Keep popup open and show install steps.
      }
    } finally {
      setInstalling(false)
    }
  }

  if (isStandaloneMode()) {
    return null
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Install Druids App</DialogTitle>
          <DialogDescription>
            Add this app to your home screen for faster ordering, better performance, and quick access.
          </DialogDescription>
        </DialogHeader>

        {!canPromptNatively && (
          <div className="rounded-md border border-border bg-black/20 p-3 text-xs text-muted-foreground">
            If install prompt doesn&apos;t appear automatically, open your browser menu and choose
            <span className="font-medium text-foreground"> Add to Home Screen</span>.
          </div>
        )}

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={dismissDialog}>
            Maybe later
          </Button>
          <Button onClick={handleInstall} disabled={installing}>
            {installing ? "Preparing..." : "Install App"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

