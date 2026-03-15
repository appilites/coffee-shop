-- ========================================
-- Fix All RLS Policies for Admin Operations
-- ========================================
-- This script ensures admin can create, update, and delete products and categories

-- ========================================
-- MENU ITEMS (PRODUCTS)
-- ========================================

-- Drop all existing policies on menu_items
DROP POLICY IF EXISTS "Anyone can view all menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can view available menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can delete menu items" ON menu_items;

-- Create new policies for menu_items
-- SELECT: Everyone can view all items
CREATE POLICY "Anyone can view all menu items" ON menu_items
  FOR SELECT USING (true);

-- INSERT: Allow all (for admin operations)
CREATE POLICY "Allow insert menu items" ON menu_items
  FOR INSERT WITH CHECK (true);

-- UPDATE: Allow all (for admin operations)  
CREATE POLICY "Allow update menu items" ON menu_items
  FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE: Allow all (for admin operations)
CREATE POLICY "Allow delete menu items" ON menu_items
  FOR DELETE USING (true);

-- ========================================
-- MENU CATEGORIES
-- ========================================

-- Drop all existing policies on menu_categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON menu_categories;
DROP POLICY IF EXISTS "Anyone can view active menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON menu_categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON menu_categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON menu_categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON menu_categories;

-- Create new policies for menu_categories
-- SELECT: Everyone can view active categories
CREATE POLICY "Anyone can view active categories" ON menu_categories
  FOR SELECT USING (is_active = true);

-- INSERT: Allow all (for admin operations)
CREATE POLICY "Allow insert categories" ON menu_categories
  FOR INSERT WITH CHECK (true);

-- UPDATE: Allow all (for admin operations)
CREATE POLICY "Allow update categories" ON menu_categories
  FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE: Allow all (for admin operations)
CREATE POLICY "Allow delete categories" ON menu_categories
  FOR DELETE USING (true);

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

-- Grant permissions to service_role (bypasses RLS)
GRANT ALL ON menu_items TO service_role;
GRANT ALL ON menu_categories TO service_role;

-- Grant permissions to authenticated role
GRANT ALL ON menu_items TO authenticated;
GRANT ALL ON menu_categories TO authenticated;

-- Grant SELECT to anon (public read)
GRANT SELECT ON menu_items TO anon;
GRANT SELECT ON menu_categories TO anon;

-- ========================================
-- VERIFY POLICIES
-- ========================================

SELECT 
  'menu_items' as table_name,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY policyname;

SELECT 
  'menu_categories' as table_name,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'menu_categories'
ORDER BY policyname;
