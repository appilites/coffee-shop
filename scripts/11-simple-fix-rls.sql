-- ========================================
-- Simple RLS Fix - Allow All Admin Operations
-- ========================================
-- This script makes RLS policies permissive for admin operations

-- ========================================
-- MENU ITEMS (PRODUCTS)
-- ========================================

-- Drop all existing policies
DO $$
BEGIN
  -- Drop all policies on menu_items
  DROP POLICY IF EXISTS "Anyone can view all menu items" ON menu_items;
  DROP POLICY IF EXISTS "Anyone can view available menu items" ON menu_items;
  DROP POLICY IF EXISTS "Authenticated users can manage items" ON menu_items;
  DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON menu_items;
  DROP POLICY IF EXISTS "Authenticated users can insert menu items" ON menu_items;
  DROP POLICY IF EXISTS "Authenticated users can update menu items" ON menu_items;
  DROP POLICY IF EXISTS "Authenticated users can delete menu items" ON menu_items;
  DROP POLICY IF EXISTS "Allow insert menu items" ON menu_items;
  DROP POLICY IF EXISTS "Allow update menu items" ON menu_items;
  DROP POLICY IF EXISTS "Allow delete menu items" ON menu_items;
END $$;

-- Create simple permissive policies
CREATE POLICY "Allow all SELECT on menu_items" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Allow all INSERT on menu_items" ON menu_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on menu_items" ON menu_items
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all DELETE on menu_items" ON menu_items
  FOR DELETE USING (true);

-- ========================================
-- MENU CATEGORIES
-- ========================================

-- Drop all existing policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active categories" ON menu_categories;
  DROP POLICY IF EXISTS "Anyone can view active menu categories" ON menu_categories;
  DROP POLICY IF EXISTS "Authenticated users can manage categories" ON menu_categories;
  DROP POLICY IF EXISTS "Authenticated users can insert categories" ON menu_categories;
  DROP POLICY IF EXISTS "Authenticated users can update categories" ON menu_categories;
  DROP POLICY IF EXISTS "Authenticated users can delete categories" ON menu_categories;
  DROP POLICY IF EXISTS "Allow insert categories" ON menu_categories;
  DROP POLICY IF EXISTS "Allow update categories" ON menu_categories;
  DROP POLICY IF EXISTS "Allow delete categories" ON menu_categories;
END $$;

-- Create simple permissive policies
CREATE POLICY "Allow all SELECT on menu_categories" ON menu_categories
  FOR SELECT USING (true);

CREATE POLICY "Allow all INSERT on menu_categories" ON menu_categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on menu_categories" ON menu_categories
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all DELETE on menu_categories" ON menu_categories
  FOR DELETE USING (true);

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

GRANT ALL ON menu_items TO anon;
GRANT ALL ON menu_items TO authenticated;
GRANT ALL ON menu_categories TO anon;
GRANT ALL ON menu_categories TO authenticated;

-- ========================================
-- VERIFY
-- ========================================

SELECT 'menu_items policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'menu_items';

SELECT 'menu_categories policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'menu_categories';
