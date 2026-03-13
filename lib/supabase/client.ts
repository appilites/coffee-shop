import { createBrowserClient as createClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xnmnklgmmeqpajxwrkir.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ0MzgsImV4cCI6MjA4ODMxMDQzOH0.kQAaa27pr99vO8Ez1ffQJMrdFmiYD2uc00odwOmA9eM"

let client: ReturnType<typeof createClient> | null = null

export function createBrowserClient() {
  if (client) return client

  client = createClient(supabaseUrl, supabaseAnonKey)

  return client
}

export function getSupabaseBrowserClient() {
  return createBrowserClient()
}
