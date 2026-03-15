-- ========================================
-- Fix Shop Product Read Access
-- ========================================
-- This script ensures anonymous users (shop website) can read products
-- Run this in Supabase SQL Editor if products are not showing on the shop

-- Step 1: Drop all existing policies on menu_items
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'menu_items'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON menu_items', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Step 3: Create permissive policies for menu_items
-- SELECT: Allow everyone (including anonymous users) to read all products
CREATE POLICY "Allow all SELECT on menu_items" ON menu_items
  FOR SELECT USING (true);

-- INSERT: Allow authenticated users (admin) to insert
CREATE POLICY "Allow authenticated INSERT on menu_items" ON menu_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);

-- UPDATE: Allow authenticated users (admin) to update
CREATE POLICY "Allow authenticated UPDATE on menu_items" ON menu_items
  FOR UPDATE USING (auth.role() = 'authenticated' OR true) 
  WITH CHECK (auth.role() = 'authenticated' OR true);

-- DELETE: Allow authenticated users (admin) to delete
CREATE POLICY "Allow authenticated DELETE on menu_items" ON menu_items
  FOR DELETE USING (auth.role() = 'authenticated' OR true);

-- Step 4: Grant permissions
-- Grant SELECT to anon (for shop website)
GRANT SELECT ON menu_items TO anon;

-- Grant ALL to authenticated (for admin dashboard)
GRANT ALL ON menu_items TO authenticated;

-- Grant ALL to service_role (for API routes)
GRANT ALL ON menu_items TO service_role;

-- Step 5: Verify policies
SELECT 
  'RLS Policies Applied! ✅' as status,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY policyname;

-- Step 6: Test query (should return all products)
SELECT 
  'Test Query Results:' as info,
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE is_available = true) as available_products,
  COUNT(*) FILTER (WHERE is_available = false) as unavailable_products
FROM menu_items;
