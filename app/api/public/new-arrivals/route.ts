import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { FALLBACK_NEW_ARRIVALS } from "@/lib/new-arrivals-fallback"

export const dynamic = "force-dynamic"

const FALLBACK_SUPABASE_URL = "https://xnmnklgmmeqpajxwrkir.supabase.co"
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ0MzgsImV4cCI6MjA4ODMxMDQzOH0.kQAaa27pr99vO8Ez1ffQJMrdFmiYD2uc00odwOmA9eM"

export async function GET(request: Request) {
  try {
    const allowFallback = process.env.NODE_ENV !== "production"
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (allowFallback ? FALLBACK_SUPABASE_URL : "")
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (allowFallback ? FALLBACK_SUPABASE_ANON_KEY : "")
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    const debug = new URL(request.url).searchParams.get("debug") === "1"
    const projectHost = supabaseUrl ? new URL(supabaseUrl).host : null

    const fallbackPayload = {
      success: true,
      data: FALLBACK_NEW_ARRIVALS,
      count: FALLBACK_NEW_ARRIVALS.length,
      source: "fallback",
    }

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({
        ...(allowFallback
          ? fallbackPayload
          : {
              success: true,
              data: [],
              count: 0,
              source: "database_unavailable",
            }),
        ...(debug
          ? {
              debug: {
                reason: "missing_env",
                projectHost,
                hasAnonKey: Boolean(anonKey),
                hasServiceRoleKey: Boolean(serviceRoleKey),
                fallbackEnabled: allowFallback,
              },
            }
          : {}),
      }, {
        headers: {
          "Cache-Control": "no-store",
        }
      })
    }

    const key = serviceRoleKey || anonKey
    const supabase = createClient(supabaseUrl, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await supabase
      .from("new_arrivals")
      .select("*")
      .eq("is_active", true)
      .order("display_order")

    if (error) {
      return NextResponse.json({
        ...(allowFallback
          ? fallbackPayload
          : {
              success: true,
              data: [],
              count: 0,
              source: "database_unavailable",
            }),
        ...(debug
          ? {
              debug: {
                reason: "query_failed",
                projectHost,
                keyMode: serviceRoleKey ? "service_role" : "anon",
                error: error.message,
                fallbackEnabled: allowFallback,
              },
            }
          : {}),
      }, {
        headers: {
          "Cache-Control": "no-store",
        }
      })
    }

    const transformedData = (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.image_url,
      buttonText: item.button_text,
      redirectLink: item.redirect_link,
      displayOrder: item.display_order,
    }))

    if (transformedData.length === 0) {
      return NextResponse.json({
        ...(allowFallback
          ? fallbackPayload
          : {
              success: true,
              data: [],
              count: 0,
              source: "database_empty",
            }),
        ...(debug
          ? {
              debug: {
                reason: "empty_rows",
                projectHost,
                keyMode: serviceRoleKey ? "service_role" : "anon",
                fallbackEnabled: allowFallback,
              },
            }
          : {}),
      }, {
        headers: {
          "Cache-Control": "no-store",
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length,
      source: "database",
      ...(debug
        ? {
            debug: {
              keyMode: serviceRoleKey ? "service_role" : "anon",
              projectHost,
            },
          }
        : {}),
    }, {
      headers: {
        "Cache-Control": "no-store",
      }
    })
  } catch (error) {
    return NextResponse.json({
      ...(process.env.NODE_ENV !== "production"
        ? {
            success: true,
            data: FALLBACK_NEW_ARRIVALS,
            count: FALLBACK_NEW_ARRIVALS.length,
            source: "fallback",
          }
        : {
            success: true,
            data: [],
            count: 0,
            source: "database_unavailable",
          }),
    }, {
      headers: {
        "Cache-Control": "no-store",
      }
    })
  }
}