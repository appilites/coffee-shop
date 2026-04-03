import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { promotionRowToShop, type PromotionRow } from "@/lib/promotions"

const FALLBACK_SUPABASE_URL = "https://xnmnklgmmeqpajxwrkir.supabase.co"
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ0MzgsImV4cCI6MjA4ODMxMDQzOH0.kQAaa27pr99vO8Ez1ffQJMrdFmiYD2uc00odwOmA9eM"

/**
 * Active promotions for the shop (same Supabase as admin).
 * Uses anon key + RLS (`is_active = true`). Do not expose service role to the client.
 */
export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const reqUrl = new URL(request.url)
  const debug = reqUrl.searchParams.get("debug") === "1"
  const projectHost = url ? new URL(url).host : null

  if (!url || !anonKey) {
    console.error("[shop-promotions] Missing Supabase env vars on server")
    if (debug) {
      return NextResponse.json(
        {
          ok: false,
          reason: "missing_env",
          projectHost,
          hasAnonKey: Boolean(anonKey),
          hasServiceRoleKey: Boolean(serviceRoleKey),
        },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      )
    }
    return NextResponse.json([], {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    })
  }

  // Prefer service role on server (safe), fallback to anon key.
  // This avoids production issues when anon RLS for `promotions` is not configured yet.
  const key = serviceRoleKey || anonKey
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from("promotions")
    .select("id, name, image_url, description, menu_item_id, external_url, is_active, sort_order, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[shop-promotions] query failed:", error.message)
    if (debug) {
      return NextResponse.json(
        {
          ok: false,
          reason: "query_failed",
          projectHost,
          keyMode: serviceRoleKey ? "service_role" : "anon",
          error: error.message,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      )
    }
    return NextResponse.json([], { status: 200 })
  }

  const rows = (data ?? []) as PromotionRow[]
  const promotions = rows.map(promotionRowToShop)

  if (debug) {
    return NextResponse.json(
      {
        ok: true,
        count: promotions.length,
        projectHost,
        keyMode: serviceRoleKey ? "service_role" : "anon",
        sampleIds: promotions.slice(0, 5).map((p) => p.id),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  }

  return NextResponse.json(promotions, { headers: { "Cache-Control": "no-store" } })
}
