-- Complete Variations Setup Script
-- This script does everything in one go:
-- 1. Fixes RLS policies
-- 2. Creates variations for all products
-- 3. Shows verification results

-- ============================================
-- STEP 1: Fix RLS Policies
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🔧 Step 1: Fixing RLS policies...';
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read options" ON customization_options;
DROP POLICY IF EXISTS "Allow authenticated read options" ON customization_options;
DROP POLICY IF EXISTS "Allow authenticated write options" ON customization_options;

DROP POLICY IF EXISTS "Allow anonymous read choices" ON customization_choices;
DROP POLICY IF EXISTS "Allow authenticated read choices" ON customization_choices;
DROP POLICY IF EXISTS "Allow authenticated write choices" ON customization_choices;

-- Enable RLS on tables
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_choices ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read (for shop website)
CREATE POLICY "Allow anonymous read options" 
ON customization_options FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow anonymous read choices" 
ON customization_choices FOR SELECT 
TO anon 
USING (true);

-- Allow authenticated users to read and write (for admin dashboard)
CREATE POLICY "Allow authenticated read options" 
ON customization_options FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated read choices" 
ON customization_choices FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated write options" 
ON customization_options FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated write choices" 
ON customization_choices FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies fixed!';
END $$;

-- ============================================
-- STEP 2: Create Variations
-- ============================================
-- (Include the main variation creation script here)
-- This will be the same as scripts/17-save-variations-to-db.sql

DO $$
DECLARE
    product_record RECORD;
    size_option_id UUID;
    addons_option_id UUID;
    category_id_val TEXT;
    category_name_val TEXT;
    is_beauty_specialty_kids BOOLEAN;
    is_meal_replacement BOOLEAN;
    is_loaded_tea BOOLEAN;
    is_coffee_bar BOOLEAN;
    is_liquid_item BOOLEAN;
    is_drink_or_shake BOOLEAN;
    has_size_option BOOLEAN;
    has_addons_option BOOLEAN;
    created_count INTEGER := 0;
    skipped_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Step 2: Creating variations for all products...';
    
    FOR product_record IN 
        SELECT mi.id, mi.category_id, mi.name, COALESCE(mc.name, '') as category_name
        FROM menu_items mi
        LEFT JOIN menu_categories mc ON mc.id = mi.category_id
        WHERE mi.is_available = true
        ORDER BY mi.name
    LOOP
        category_id_val := product_record.category_id;
        category_name_val := LOWER(COALESCE(product_record.category_name, ''));
        
        is_beauty_specialty_kids := category_id_val IN (
            'cat-beauty-drinks', 'cat-6', 'cat-7', 'cat-8', 'cat-9',
            'cat-specialty-drinks', 'cat-10', 'cat-11', 'cat-12', 'cat-13',
            'cat-kids-drinks', 'cat-14', 'cat-15'
        ) OR
        (category_name_val LIKE '%beauty%' AND (category_name_val LIKE '%drink%' OR category_name_val LIKE '%drinks%')) OR
        (category_name_val LIKE '%specialty%' AND (category_name_val LIKE '%drink%' OR category_name_val LIKE '%drinks%')) OR
        (category_name_val LIKE '%kids%' AND (category_name_val LIKE '%drink%' OR category_name_val LIKE '%drinks%'));
        
        is_meal_replacement := category_id_val = 'cat-1' OR
                              (category_name_val LIKE '%meal%' AND category_name_val LIKE '%replacement%');
        
        is_loaded_tea := category_id_val IN (
            'cat-loaded-tea', 'cat-2', 'cat-3', 'cat-4', 'cat-5'
        ) OR category_id_val LIKE 'cat-loaded-%' OR
        (category_name_val LIKE '%loaded%' AND category_name_val LIKE '%tea%');
        
        is_coffee_bar := category_id_val IN (
            'cat-coffee-bar', 'cat-22', 'cat-23', 'cat-24', 'cat-25'
        ) OR (category_name_val LIKE '%coffee%' AND category_name_val LIKE '%bar%');
        
        is_liquid_item := category_id_val IS NOT NULL AND 
                         NOT (category_name_val LIKE '%bowl%' OR 
                              category_name_val LIKE '%snack%' OR 
                              category_name_val LIKE '%food%' OR
                              category_name_val LIKE '%eat%' OR
                              category_name_val LIKE '%waffle%');
        
        is_drink_or_shake := is_beauty_specialty_kids OR is_meal_replacement OR
                            category_name_val LIKE '%drink%' OR 
                            category_name_val LIKE '%shake%' OR
                            LOWER(product_record.name) LIKE '%drink%' OR 
                            LOWER(product_record.name) LIKE '%shake%';
        
        SELECT EXISTS(
            SELECT 1 FROM customization_options 
            WHERE menu_item_id = product_record.id 
            AND LOWER(option_name) = 'size'
        ) INTO has_size_option;
        
        SELECT EXISTS(
            SELECT 1 FROM customization_options 
            WHERE menu_item_id = product_record.id 
            AND (LOWER(option_name) = 'add-ons' OR LOWER(option_name) = 'addons')
        ) INTO has_addons_option;
        
        IF is_liquid_item AND NOT is_loaded_tea AND NOT is_coffee_bar AND NOT has_size_option THEN
            BEGIN
                INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required, created_at)
                VALUES (product_record.id, 'Size', 'single', true, NOW())
                RETURNING id INTO size_option_id;
                
                IF is_beauty_specialty_kids THEN
                    INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                    VALUES 
                        (size_option_id, 'Mini (24oz)', 0, true, NOW()),
                        (size_option_id, 'Full (32oz)', 0, false, NOW());
                ELSIF is_meal_replacement THEN
                    INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                    VALUES (size_option_id, '24oz', 0, true, NOW());
                ELSE
                    INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                    VALUES 
                        (size_option_id, 'Small (12oz)', -0.50, false, NOW()),
                        (size_option_id, 'Medium (16oz)', 0, true, NOW()),
                        (size_option_id, 'Large (20oz)', 1.00, false, NOW());
                END IF;
                
                created_count := created_count + 1;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING '⚠️ Error creating size for %: %', product_record.name, SQLERRM;
            END;
        ELSIF has_size_option THEN
            skipped_count := skipped_count + 1;
        END IF;
        
        IF is_drink_or_shake AND NOT has_addons_option THEN
            BEGIN
                INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required, created_at)
                VALUES (product_record.id, 'Add-ons', 'multiple', false, NOW())
                RETURNING id INTO addons_option_id;
                
                IF is_beauty_specialty_kids THEN
                    INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                    VALUES 
                        (addons_option_id, 'Whipped Cream', 0.50, false, NOW()),
                        (addons_option_id, 'Caramel Drizzle', 0.50, false, NOW()),
                        (addons_option_id, 'Vanilla Syrup', 0.50, false, NOW()),
                        (addons_option_id, 'Honey', 0.50, false, NOW());
                ELSIF is_meal_replacement THEN
                    INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                    VALUES 
                        (addons_option_id, 'Extra Lift off', 2.50, false, NOW()),
                        (addons_option_id, 'Extra NRG', 1.00, false, NOW()),
                        (addons_option_id, 'Extra Tea', 1.00, false, NOW()),
                        (addons_option_id, 'Extra Protein', 2.00, false, NOW()),
                        (addons_option_id, 'Defense Tablet', 1.50, false, NOW()),
                        (addons_option_id, 'Immunity Booster', 1.50, false, NOW()),
                        (addons_option_id, 'Probiotic', 1.00, false, NOW()),
                        (addons_option_id, 'Hibiscus Tea', 1.00, false, NOW()),
                        (addons_option_id, 'Green Tea', 1.00, false, NOW()),
                        (addons_option_id, 'Whip Cream', 0.00, false, NOW()),
                        (addons_option_id, 'Prolessa', 5.00, false, NOW());
                ELSE
                    INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                    VALUES 
                        (addons_option_id, 'Whipped Cream', 0.50, false, NOW()),
                        (addons_option_id, 'Caramel Drizzle', 0.50, false, NOW()),
                        (addons_option_id, 'Vanilla Syrup', 0.50, false, NOW()),
                        (addons_option_id, 'Honey', 0.50, false, NOW());
                END IF;
                
                created_count := created_count + 1;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING '⚠️ Error creating add-ons for %: %', product_record.name, SQLERRM;
            END;
        ELSIF has_addons_option THEN
            skipped_count := skipped_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Variations created! Created: %, Skipped: %', created_count, skipped_count;
END $$;

-- ============================================
-- STEP 3: Verification
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 Step 3: Verification Results...';
END $$;

-- Show products with variations
SELECT 
    mi.name as product_name,
    COALESCE(co.option_name, 'No variations') as option_name,
    co.option_type,
    co.is_required,
    COUNT(cc.id) as choices_count
FROM menu_items mi
LEFT JOIN customization_options co ON co.menu_item_id = mi.id
LEFT JOIN customization_choices cc ON cc.option_id = co.id
WHERE mi.is_available = true
GROUP BY mi.id, mi.name, co.id, co.option_name, co.option_type, co.is_required
ORDER BY mi.name, co.option_name
LIMIT 20;

-- Summary statistics
SELECT 
    COUNT(DISTINCT co.menu_item_id) as products_with_variations,
    COUNT(DISTINCT co.id) as total_variation_options,
    COUNT(DISTINCT cc.id) as total_variation_choices
FROM customization_options co
LEFT JOIN customization_choices cc ON cc.option_id = co.id;
