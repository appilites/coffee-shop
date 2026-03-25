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

export default function SignupPage() {
  const router = useRouter()
  const { signUpWithPassword } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  /** Email confirmation link flow — no session until user clicks link in inbox */
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setBusy(true)
    try {
      const { data, error } = await signUpWithPassword(email.trim(), password, fullName.trim())
      if (error) {
        setMessage(formatAuthErrorMessage(error.message, authErrorMeta(error)))
        setBusy(false)
        return
      }
      if (data.user && !data.session) {
        setAwaitingEmailConfirm(true)
        return
      }
      router.push("/menu")
      router.refresh()
    } catch {
      setMessage("Something went wrong. Try again.")
    } finally {
      setBusy(false)
    }
  }

  if (awaitingEmailConfirm) {
    return (
      <AuthPageShell
        title="Check your email"
        subtitle="We sent a confirmation link to finish creating your Druids Nutrition account."
      >
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-lg text-center">
          <p className="text-sm text-foreground">
            Open the email at <strong className="text-primary">{email.trim()}</strong> and tap{" "}
            <strong>Confirm your mail</strong> (or the button in that message). Then sign in here with your password.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Didn&rsquo;t get it? Check spam or wait a minute, then try signing up again if needed.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button className="w-full gradient-copper-gold text-white" asChild>
              <Link href="/login">Go to sign in</Link>
            </Button>
          </div>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell title="Create account" subtitle="Earn loyalty points on purchases when you’re signed in.">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-lg">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-background"
          />
        </div>
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
          <Label htmlFor="password">Password</Label>
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
          <p className="text-xs text-muted-foreground">At least 6 characters.</p>
        </div>
        {message ? <p className="text-sm text-destructive">{message}</p> : null}
        <Button type="submit" className="w-full gradient-copper-gold text-white" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign up"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          We&rsquo;ll email you a link to confirm your address before you can sign in.
        </p>
      </form>
    </AuthPageShell>
  )
}
