"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/context/auth-context"
import { authErrorMeta, formatAuthErrorMessage } from "@/lib/auth-error-message"
import { Loader2 } from "lucide-react"

export default function ChangePasswordPage() {
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
      router.push("/menu")
      router.refresh()
    } catch {
      setMessage("Could not change password.")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-[#181511] flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
  }

  if (!user) {
    return null
  }

  return (
    <AuthPageShell title="Change password" subtitle={`Signed in as ${user.email ?? ""}`}>
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
          <Label htmlFor="confirm">Confirm new password</Label>
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
        <Button type="submit" className="w-full gradient-copper-gold text-white" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save new password"}
        </Button>
        <Button variant="outline" className="w-full" type="button" asChild>
          <Link href="/menu">Cancel</Link>
        </Button>
      </form>
    </AuthPageShell>
  )
}
