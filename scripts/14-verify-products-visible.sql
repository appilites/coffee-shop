-- ========================================
-- Verify Products Are Visible to Shop
-- ========================================
-- Run this to check if products can be read by anonymous users

-- Test 1: Check total products
SELECT 
  '📊 Total Products in Database:' as check_type,
  COUNT(*) as count
FROM menu_items;

-- Test 2: Check products with categories
SELECT 
  '📊 Products with Categories:' as check_type,
  COUNT(*) FILTER (WHERE category_id IS NOT NULL) as with_category,
  COUNT(*) FILTER (WHERE category_id IS NULL) as without_category
FROM menu_items;

-- Test 3: Check RLS policies
SELECT 
  '🔒 RLS Policies:' as check_type,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' AND qual = 'true' THEN '✅ OK'
    ELSE '❌ Check'
  END as status
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY cmd;

-- Test 4: Check grants for anon role
SELECT 
  '🔐 Anon Role Grants:' as check_type,
  grantee,
  privilege_type,
  CASE 
    WHEN privilege_type = 'SELECT' THEN '✅ OK'
    ELSE '⚠️ Check'
  END as status
FROM information_schema.role_table_grants 
WHERE table_name = 'menu_items' 
  AND grantee = 'anon';

-- Test 5: Simulate anonymous user query
-- This tests if anon can actually read products
DO $$
DECLARE
    product_count INTEGER;
BEGIN
    SET ROLE anon;
    SELECT COUNT(*) INTO product_count FROM menu_items;
    RESET ROLE;
    
    RAISE NOTICE '✅ Anonymous user can read % products', product_count;
    
    IF product_count = 0 THEN
        RAISE WARNING '❌ Anonymous user cannot read products! Run 13-FINAL-FIX-PRODUCTS-SHOP.sql';
    ELSE
        RAISE NOTICE '✅ Products are visible to shop website!';
    END IF;
END $$;

-- Test 6: Sample products (what shop will see)
SELECT 
  '📦 Sample Products (First 5):' as check_type,
  id,
  name,
  category_id,
  base_price,
  is_available,
  created_at
FROM menu_items
ORDER BY created_at DESC
LIMIT 5;

-- Test 7: Summary
SELECT 
  '📋 Summary:' as check_type,
  (SELECT COUNT(*) FROM menu_items) as total_products,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'menu_items' AND cmd = 'SELECT') as select_policies,
  (SELECT COUNT(*) FROM information_schema.role_table_grants WHERE table_name = 'menu_items' AND grantee = 'anon' AND privilege_type = 'SELECT') as anon_select_grants,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'menu_items' AND cmd = 'SELECT' AND qual = 'true') > 0 
         AND (SELECT COUNT(*) FROM information_schema.role_table_grants WHERE table_name = 'menu_items' AND grantee = 'anon' AND privilege_type = 'SELECT') > 0
    THEN '✅ Products should be visible on shop'
    ELSE '❌ Run 13-FINAL-FIX-PRODUCTS-SHOP.sql'
  END as status;
