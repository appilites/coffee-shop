"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/context/auth-context"
import { authErrorMeta, formatAuthErrorMessage } from "@/lib/auth-error-message"
import { Loader2 } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const redirect = search.get("redirect") || "/menu"
  const err = search.get("error")
  const { signInWithPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setBusy(true)
    try {
      const { error } = await signInWithPassword(email.trim(), password)
      if (error) {
        setMessage(formatAuthErrorMessage(error.message, authErrorMeta(error)))
        setBusy(false)
        return
      }
      router.push(redirect.startsWith("/") ? redirect : "/menu")
      router.refresh()
    } catch {
      setMessage("Something went wrong. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {err ? (
        <p className="text-sm text-destructive text-center bg-destructive/10 rounded-md p-2">
          Sign-in link or code may have expired. Try again.
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-lg">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background"
          />
        </div>
        {message ? <p className="text-sm text-destructive">{message}</p> : null}
        <Button type="submit" className="w-full gradient-copper-gold text-white" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Welcome back"
      subtitle="Sign in to earn and redeem loyalty points on every order."
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/30" />}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  )
}
