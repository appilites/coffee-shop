/**
 * Resolves which `menu_categories.id` values should receive the unified Add-ons variation.
 * See `docs/UNIFIED_ADDONS_DATABASE.md` for usage with the setup API route.
 */

export type CategoryRow = {
  id: string
  name: string
  parent_id: string | null
}

/** Subtree roots we never attach drink add-ons to (food / bowls). */
const EXCLUDED_SUBTREE_ROOT_IDS = new Set([
  "cat-power-bowl",
  "cat-quick-snacks",
])

/**
 * Café parent ids (seed / production). Subcategories inherit scope.
 * `cat-coffee-bar` matches this repo’s mock menu; hot/cold ids match common seed names.
 */
const CAFE_PARENT_IDS = new Set([
  "cat-hot-beverages",
  "cat-cold-beverages",
  "cat-coffee-bar",
])

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\u2013/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

function buildById(categories: CategoryRow[]): Map<string, CategoryRow> {
  const m = new Map<string, CategoryRow>()
  for (const c of categories) {
    m.set(c.id, c)
  }
  return m
}

function ancestors(cat: CategoryRow, byId: Map<string, CategoryRow>): CategoryRow[] {
  const out: CategoryRow[] = []
  let cur: CategoryRow | undefined = cat
  const seen = new Set<string>()
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id)
    out.push(cur)
    cur = cur.parent_id ? byId.get(cur.parent_id) : undefined
  }
  return out
}

function isUnderExcludedSubtree(cat: CategoryRow, byId: Map<string, CategoryRow>): boolean {
  for (const a of ancestors(cat, byId)) {
    if (EXCLUDED_SUBTREE_ROOT_IDS.has(a.id)) return true
  }
  return false
}

function isUnderCafeTree(cat: CategoryRow, byId: Map<string, CategoryRow>): boolean {
  for (const a of ancestors(cat, byId)) {
    if (CAFE_PARENT_IDS.has(a.id)) return true
    const n = norm(a.name)
    if (n.includes("hot beverage") || n.includes("cold beverage")) return true
  }
  return false
}

/**
 * Category ids from `lib/mock-data.ts` drink lines — merged when those rows exist in DB.
 * Alternate seed ids (e.g. `cat-meal-replacement`, `cat-loaded-tea-berry`) are included when present.
 */
export const UNIFIED_ADDONS_MOCK_CATEGORY_IDS: readonly string[] = [
  "cat-loaded-tea",
  "cat-loaded-tea-berry",
  "cat-loaded-tea-orange",
  "cat-loaded-tea-lime",
  "cat-loaded-tea-tropical",
  "cat-2",
  "cat-3",
  "cat-4",
  "cat-5",
  "cat-beauty-drinks",
  "cat-6",
  "cat-7",
  "cat-8",
  "cat-9",
  "cat-specialty-drinks",
  "cat-10",
  "cat-11",
  "cat-12",
  "cat-13",
  "cat-1",
  "cat-meal-replacement",
  "cat-kids-drinks",
  "cat-kids-berry",
  "cat-kids-orange",
  "cat-14",
  "cat-15",
  "cat-coffee-bar",
  "cat-22",
  "cat-23",
  "cat-24",
  "cat-25",
  "cat-16",
  "cat-cold-drinks",
] as const

const MOCK_ALLOWLIST = new Set<string>(UNIFIED_ADDONS_MOCK_CATEGORY_IDS)

function matchesNameRule(cat: CategoryRow, byId: Map<string, CategoryRow>): boolean {
  const chain = ancestors(cat, byId)
  const blob = chain.map((c) => norm(c.name)).join(" | ")
  const patterns = [
    /kids\s+drinks/,
    /meal\s+replacement/,
    /specialty\s+drinks/,
    /cold\s+drinks/,
    /beauty\s+drinks/,
    /loaded\s+tea/,
  ]
  return patterns.some((re) => re.test(blob))
}

function categoryInScope(cat: CategoryRow, byId: Map<string, CategoryRow>): boolean {
  if (isUnderExcludedSubtree(cat, byId)) return false
  if (MOCK_ALLOWLIST.has(cat.id)) return true
  if (matchesNameRule(cat, byId)) return true
  if (isUnderCafeTree(cat, byId)) return true
  return false
}

export type ResolveUnifiedAddonsOptions = {
  /** If set, only these ids (must exist in `categories`) are used. */
  explicitCategoryIds?: string[] | null
}

/**
 * Returns distinct category ids to update. When `explicitCategoryIds` is omitted or empty,
 * uses café tree + name rules + mock ID allowlist, excluding power bowl / quick snacks subtrees.
 */
export function resolveUnifiedAddonsCategoryIds(
  categories: CategoryRow[],
  options?: ResolveUnifiedAddonsOptions,
): string[] {
  const byId = buildById(categories)
  const explicit = options?.explicitCategoryIds?.filter(Boolean) ?? []
  if (explicit.length > 0) {
    const valid = new Set(categories.map((c) => c.id))
    return [...new Set(explicit.filter((id) => valid.has(id)))]
  }

  const out = new Set<string>()
  for (const cat of categories) {
    if (categoryInScope(cat, byId)) out.add(cat.id)
  }
  return [...out].sort()
}
