import { createServerClient as createClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xnmnklgmmeqpajxwrkir.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ0MzgsImV4cCI6MjA4ODMxMDQzOH0.kQAaa27pr99vO8Ez1ffQJMrdFmiYD2uc00odwOmA9eM"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // Handle cookie setting errors
        }
      },
    },
  })
}

export async function getSupabaseServerClient() {
  return createServerClient()
}
