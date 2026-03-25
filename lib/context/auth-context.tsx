"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createBrowserClient } from "@/lib/supabase/client"

export type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<{
    error: Error | null
    data: Awaited<ReturnType<ReturnType<typeof createBrowserClient>["auth"]["signInWithPassword"]>>["data"]
  }>
  signUpWithPassword: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<Awaited<ReturnType<ReturnType<typeof createBrowserClient>["auth"]["signUp"]>>>
  signOut: () => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<{
    error: Error | null
    data: Awaited<ReturnType<ReturnType<typeof createBrowserClient>["auth"]["resetPasswordForEmail"]>>["data"]
  }>
  updatePassword: (newPassword: string) => Promise<Awaited<ReturnType<ReturnType<typeof createBrowserClient>["auth"]["updateUser"]>>>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getOrigin() {
  if (typeof window === "undefined") return ""
  return window.location.origin
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    }
    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshSession = useCallback(async () => {
    const supabase = createBrowserClient()
    const { data } = await supabase.auth.refreshSession()
    setSession(data.session)
    setUser(data.session?.user ?? null)
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    return createBrowserClient().auth.signInWithPassword({ email, password })
  }, [])

  const signUpWithPassword = useCallback(async (email: string, password: string, fullName: string) => {
    const origin = getOrigin()
    return createBrowserClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/menu`,
        data: { full_name: fullName, name: fullName },
      },
    })
  }, [])

  const signOut = useCallback(async () => {
    await createBrowserClient().auth.signOut()
    setSession(null)
    setUser(null)
  }, [])

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const origin = getOrigin()
    return createBrowserClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    })
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    return createBrowserClient().auth.updateUser({ password: newPassword })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      resetPasswordForEmail,
      updatePassword,
      refreshSession,
    }),
    [
      user,
      session,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      resetPasswordForEmail,
      updatePassword,
      refreshSession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
