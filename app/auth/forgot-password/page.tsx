"use client"

import { useState } from "react"
import Link from "next/link"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/context/auth-context"
import { authErrorMeta, formatAuthErrorMessage } from "@/lib/auth-error-message"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [message, setMessage] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setBusy(true)
    try {
      const { error } = await resetPasswordForEmail(email.trim())
      if (error) {
        setMessage(formatAuthErrorMessage(error.message, authErrorMeta(error)))
        setBusy(false)
        return
      }
      setDone(true)
    } catch {
      setMessage("Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthPageShell
      title="Reset password"
      subtitle="We’ll email you a secure link to reset your password."
    >
      {done ? (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 text-center space-y-3">
          <p className="text-sm text-foreground">
            If an account exists for <strong>{email}</strong>, open the email and tap the reset link to choose a new password.
          </p>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
            />
          </div>
          {message ? <p className="text-sm text-destructive">{message}</p> : null}
          <Button type="submit" className="w-full gradient-copper-gold text-white" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset email"}
          </Button>
          <p className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthPageShell>
  )
}
