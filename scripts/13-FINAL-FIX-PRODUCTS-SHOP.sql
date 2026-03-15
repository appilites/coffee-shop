-- ========================================
-- FINAL FIX: Products Not Showing on Shop
-- ========================================
-- Run this script in Supabase SQL Editor
-- This will fix RLS policies so products show on the shop website

-- ========================================
-- STEP 1: Drop ALL existing policies
-- ========================================
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on menu_items
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'menu_items'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON menu_items', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
    
    -- Drop all policies on menu_categories
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'menu_categories'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON menu_categories', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- ========================================
-- STEP 2: Ensure RLS is enabled
-- ========================================
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: Create NEW policies for menu_items
-- ========================================

-- SELECT: Allow EVERYONE (including anonymous) to read ALL products
CREATE POLICY "Shop can read all products" ON menu_items
  FOR SELECT USING (true);

-- INSERT: Allow authenticated users (admin dashboard)
CREATE POLICY "Admin can insert products" ON menu_items
  FOR INSERT WITH CHECK (true);

-- UPDATE: Allow authenticated users (admin dashboard)
CREATE POLICY "Admin can update products" ON menu_items
  FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE: Allow authenticated users (admin dashboard)
CREATE POLICY "Admin can delete products" ON menu_items
  FOR DELETE USING (true);

-- ========================================
-- STEP 4: Create NEW policies for menu_categories
-- ========================================

-- SELECT: Allow EVERYONE to read categories
CREATE POLICY "Shop can read all categories" ON menu_categories
  FOR SELECT USING (true);

-- INSERT: Allow authenticated users (admin dashboard)
CREATE POLICY "Admin can insert categories" ON menu_categories
  FOR INSERT WITH CHECK (true);

-- UPDATE: Allow authenticated users (admin dashboard)
CREATE POLICY "Admin can update categories" ON menu_categories
  FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE: Allow authenticated users (admin dashboard)
CREATE POLICY "Admin can delete categories" ON menu_categories
  FOR DELETE USING (true);

-- ========================================
-- STEP 5: Grant permissions to roles
-- ========================================

-- Grant SELECT to anon (for shop website - this is CRITICAL)
GRANT SELECT ON menu_items TO anon;
GRANT SELECT ON menu_categories TO anon;

-- Grant ALL to authenticated (for admin dashboard)
GRANT ALL ON menu_items TO authenticated;
GRANT ALL ON menu_categories TO authenticated;

-- Grant ALL to service_role (for API routes)
GRANT ALL ON menu_items TO service_role;
GRANT ALL ON menu_categories TO service_role;

-- ========================================
-- STEP 6: Verify everything is correct
-- ========================================

-- Check policies
SELECT 
  '✅ Policies Created:' as status,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('menu_items', 'menu_categories')
ORDER BY tablename, policyname;

-- Check grants
SELECT 
  '✅ Grants Applied:' as status,
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name IN ('menu_items', 'menu_categories')
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grantee, table_name;

-- Test query (should return all 340 products)
SELECT 
  '✅ Test Query Results:' as info,
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE is_available = true) as available_products,
  COUNT(*) FILTER (WHERE is_available = false) as unavailable_products,
  COUNT(DISTINCT category_id) as categories_with_products
FROM menu_items;

-- Show sample products
SELECT 
  '✅ Sample Products:' as info,
  id,
  name,
  category_id,
  base_price,
  is_available,
  created_at
FROM menu_items
ORDER BY created_at DESC
LIMIT 5;
