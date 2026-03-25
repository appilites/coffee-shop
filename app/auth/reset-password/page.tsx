"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/context/auth-context"
import { authErrorMeta, formatAuthErrorMessage } from "@/lib/auth-error-message"
import { Loader2 } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const { updatePassword, user, loading } = useAuth()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.")
      return
    }
    setBusy(true)
    try {
      const { error } = await updatePassword(password)
      if (error) {
        setMessage(formatAuthErrorMessage(error.message, authErrorMeta(error)))
        setBusy(false)
        return
      }
      router.push("/login?redirect=/menu")
      router.refresh()
    } catch {
      setMessage("Could not update password.")
    } finally {
      setBusy(false)
    }
  }

  if (!loading && !user) {
    return (
      <AuthPageShell title="Reset password" subtitle="">
        <div className="rounded-xl border border-border bg-card p-5 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Open the reset link from your email first, or verify with a code from the forgot-password flow.
          </p>
          <Button asChild className="w-full gradient-copper-gold text-white">
            <Link href="/auth/forgot-password">Request reset</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell title="Choose a new password" subtitle="You’re signed in for recovery — set a new password below.">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-lg">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="bg-background"
          />
        </div>
        {message ? <p className="text-sm text-destructive">{message}</p> : null}
        <Button type="submit" className="w-full gradient-copper-gold text-white" disabled={busy || loading}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
        </Button>
      </form>
    </AuthPageShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#181511]" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
