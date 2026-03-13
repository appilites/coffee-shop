"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Filter out MetaMask/wallet errors
    if (
      error.message?.includes("MetaMask") ||
      error.message?.includes("ethereum") ||
      error.message?.includes("wallet")
    ) {
      console.warn("External wallet extension error caught and suppressed:", error)
      this.setState({ hasError: false, error: null })
      return
    }
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="max-w-md p-6">
            <div className="flex items-center gap-2 text-error mb-4">
              <AlertCircle className="h-5 w-5" />
              <h2 className="font-serif text-xl font-semibold">Something went wrong</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
