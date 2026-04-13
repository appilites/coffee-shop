import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import type { ProductVariation } from "@/lib/types"
import { mergeUnifiedAddonsIntoVariations } from "@/lib/unified-addons-merge"
import {
  resolveUnifiedAddonsCategoryIds,
  type CategoryRow,
} from "@/lib/unified-addons-category-scope"
import { UNIFIED_ADDONS_VARIATION_ID } from "@/lib/unified-drink-shake-addons"

export const dynamic = "force-dynamic"

function hasServiceRoleKey(): boolean {
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  )
}

async function loadCategories(supabase: ReturnType<typeof getSupabaseAdminClient>) {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("id,name,parent_id")

  if (error) throw new Error(error.message)
  return (data || []) as CategoryRow[]
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const categories = await loadCategories(supabase)
    const resolvedCategoryIds = resolveUnifiedAddonsCategoryIds(categories)

    let productCount: number | null = null
    if (resolvedCategoryIds.length > 0) {
      const { count, error } = await supabase
        .from("menu_items")
        .select("*", { count: "exact", head: true })
        .in("category_id", resolvedCategoryIds)
      if (!error) productCount = count ?? null
    } else {
      productCount = 0
    }

    return NextResponse.json({
      resolvedCategoryIds,
      productCount,
      categoryCount: categories.length,
      hasServiceRoleKey: hasServiceRoleKey(),
      hint: "POST with { dryRun: true } for row-level preview; { dryRun: false } applies updates (service role required).",
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "failed" },
      { status: 500 },
    )
  }
}

type PostBody = {
  dryRun?: boolean
  categoryIds?: string[] | null
}

const UPDATE_CHUNK = 45

export async function POST(req: NextRequest) {
  try {
    let body: PostBody = {}
    try {
      body = (await req.json()) as PostBody
    } catch {
      body = {}
    }

    const dryRun = body.dryRun !== false
    const explicitIds = Array.isArray(body.categoryIds) ? body.categoryIds : undefined

    if (!dryRun && !hasServiceRoleKey()) {
      return NextResponse.json(
        {
          error:
            "Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY on the server to apply updates.",
        },
        { status: 503 },
      )
    }

    const supabase = getSupabaseAdminClient()
    const categories = await loadCategories(supabase)
    const resolvedCategoryIds = resolveUnifiedAddonsCategoryIds(categories, {
      explicitCategoryIds: explicitIds,
    })

    if (resolvedCategoryIds.length === 0) {
      return NextResponse.json({
        dryRun,
        resolvedCategoryIds,
        productCount: 0,
        updatedCount: 0,
        preview: [],
        message: "No categories resolved; check names, allowlist, or pass categoryIds.",
      })
    }

    const { data: items, error: itemsError } = await supabase
      .from("menu_items")
      .select("id,name,category_id,variations")
      .in("category_id", resolvedCategoryIds)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    const rows = items || []
    const productCount = rows.length

    const preview = rows.slice(0, 25).map((row: { id: string; name: string; variations: unknown }) => {
      const before = Array.isArray(row.variations) ? row.variations : []
      const after = mergeUnifiedAddonsIntoVariations(before as ProductVariation[])
      return {
        id: row.id,
        name: row.name,
        variationCountBefore: before.length,
        variationCountAfter: after.length,
        hasUnifiedAddonAfter: after.some((v) => v.id === UNIFIED_ADDONS_VARIATION_ID),
      }
    })

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        resolvedCategoryIds,
        productCount,
        preview,
      })
    }

    let updatedCount = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i += UPDATE_CHUNK) {
      const chunk = rows.slice(i, i + UPDATE_CHUNK)
      await Promise.all(
        chunk.map(async (row: { id: string; variations: unknown }) => {
          const merged = mergeUnifiedAddonsIntoVariations(
            (Array.isArray(row.variations) ? row.variations : []) as ProductVariation[],
          )
          const { error } = await supabase
            .from("menu_items")
            .update({
              variations: merged,
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id)

          if (error) {
            errors.push(`${row.id}: ${error.message}`)
          } else {
            updatedCount += 1
          }
        }),
      )
    }

    return NextResponse.json({
      dryRun: false,
      resolvedCategoryIds,
      productCount,
      updatedCount,
      errors: errors.length ? errors.slice(0, 50) : undefined,
      previewSample: preview.slice(0, 10),
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "failed" },
      { status: 500 },
    )
  }
}
