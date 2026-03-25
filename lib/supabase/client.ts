import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xnmnklgmmeqpajxwrkir.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ0MzgsImV4cCI6MjA4ODMxMDQzOH0.kQAaa27pr99vO8Ez1ffQJMrdFmiYD2uc00odwOmA9eM"

let client: ReturnType<typeof createSupabaseBrowserClient> | null = null

/**
 * Next.js dev + React Strict Mode (and overlapping auth refresh) often pass an
 * AbortSignal that cancels the previous in-flight Supabase Auth request. That
 * surfaces as "signal is aborted without reason" inside auth-js. Dropping the
 * external signal for these fetches avoids benign auth abort noise; Supabase
 * still manages its own session lifecycle.
 */
function supabaseCompatibleFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!init || !("signal" in init) || init.signal == null) {
    return fetch(input, init)
  }
  const { signal: _ignored, ...rest } = init
  return fetch(input, rest)
}

export function createBrowserClient() {
  if (client) return client

  client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: supabaseCompatibleFetch,
    },
  })

  return client
}

export function getSupabaseBrowserClient() {
  return createBrowserClient()
}
