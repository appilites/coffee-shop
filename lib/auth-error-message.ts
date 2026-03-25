/**
 * Map Supabase Auth / network errors to clear customer-facing copy.
 * Pass `meta` from the Supabase client error (code / status) when available.
 */
export type AuthErrorMeta = {
  code?: string
  status?: number
}

/** Use with Supabase `error` from signIn / signUp / resetPasswordForEmail / etc. */
export function authErrorMeta(error: unknown): AuthErrorMeta {
  if (!error || typeof error !== "object") return {}
  const e = error as { code?: string; status?: number }
  return {
    code: typeof e.code === "string" ? e.code : undefined,
    status: typeof e.status === "number" ? e.status : undefined,
  }
}

export function formatAuthErrorMessage(raw: string | undefined | null, meta?: AuthErrorMeta): string {
  const original = (raw || "").trim()
  const m = original.toLowerCase()
  const code = (meta?.code || "").toLowerCase()

  if (meta?.status === 429 || code === "over_email_send_rate_limit") {
    return "Too many confirmation emails were sent from this project recently (Supabase safety limit). Your second email isn’t blocked forever — wait about 30–60 minutes and try again. For testing or busy shops: in Supabase open Authentication → SMTP and add a custom provider (e.g. Resend/SendGrid), or adjust Authentication → Rate limits if your plan allows."
  }

  if (!m && !code) return "Something went wrong. Try again."

  if (
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already exists") ||
    m.includes("email address is already") ||
    m.includes("email already") ||
    m.includes("duplicate key value") ||
    m.includes("unique constraint") ||
    m.includes("users_email_partial_key")
  ) {
    return "This email is already in use. Sign in with your password, or use Forgot password if you need a new one."
  }

  if (
    m.includes("rate limit") ||
    m.includes("email rate limit") ||
    m.includes("too many requests") ||
    m.includes("over_email_send_rate_limit") ||
    m.includes("429") ||
    (m.includes("security purposes") && m.includes("once every"))
  ) {
    return "Too many emails or sign-up attempts for now (Supabase limit). Wait 30–60 minutes or connect Custom SMTP under Authentication → SMTP in your Supabase project for higher sending limits."
  }

  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
    return "Wrong email or password. Try again or use Forgot password."
  }

  return original || "Something went wrong. Try again."
}
