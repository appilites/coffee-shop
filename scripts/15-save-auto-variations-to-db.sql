-- Script to save auto-generated variations to database
-- This will create Size and Add-ons variations for products that don't have them
-- Based on the same logic used in customize-dialog.tsx

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
BEGIN
    -- Loop through all menu items
    FOR product_record IN 
        SELECT mi.id, mi.category_id, mi.name, mc.name as category_name
        FROM menu_items mi
        LEFT JOIN menu_categories mc ON mc.id = mi.category_id
        WHERE mi.is_available = true
    LOOP
        category_id_val := product_record.category_id;
        category_name_val := LOWER(COALESCE(product_record.category_name, ''));
        
        -- Check category types by ID (most reliable)
        is_beauty_specialty_kids := category_id_val IN (
            'cat-beauty-drinks', 'cat-6', 'cat-7', 'cat-8', 'cat-9',
            'cat-specialty-drinks', 'cat-10', 'cat-11', 'cat-12', 'cat-13',
            'cat-kids-drinks', 'cat-14', 'cat-15'
        ) OR
        -- Fallback: check by category name
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
        
        -- Determine if it's a liquid item (not solid food)
        -- Liquid items: drinks, shakes, teas (but not loaded tea or coffee bar for size)
        is_liquid_item := category_id_val IS NOT NULL AND 
                         NOT (category_name_val LIKE '%bowl%' OR 
                              category_name_val LIKE '%snack%' OR 
                              category_name_val LIKE '%food%' OR
                              category_name_val LIKE '%eat%');
        
        -- Determine if it's a drink or shake (for add-ons)
        is_drink_or_shake := is_beauty_specialty_kids OR is_meal_replacement OR
                            category_name_val LIKE '%drink%' OR 
                            category_name_val LIKE '%shake%' OR
                            LOWER(product_record.name) LIKE '%drink%' OR 
                            LOWER(product_record.name) LIKE '%shake%';
        
        -- Check if size option already exists
        SELECT EXISTS(
            SELECT 1 FROM customization_options 
            WHERE menu_item_id = product_record.id 
            AND LOWER(option_name) = 'size'
        ) INTO has_size_option;
        
        -- Check if add-ons option already exists
        SELECT EXISTS(
            SELECT 1 FROM customization_options 
            WHERE menu_item_id = product_record.id 
            AND (LOWER(option_name) = 'add-ons' OR LOWER(option_name) = 'addons')
        ) INTO has_addons_option;
        
        -- Create size option for liquid items (excluding loaded tea and coffee bar)
        IF is_liquid_item AND NOT is_loaded_tea AND NOT is_coffee_bar AND NOT has_size_option THEN
            -- Create size option
            INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required, created_at)
            VALUES (product_record.id, 'Size', 'single', true, NOW())
            RETURNING id INTO size_option_id;
            
            -- Create size choices based on category
            IF is_beauty_specialty_kids THEN
                -- Mini (24oz) and Full (32oz) for Beauty/Specialty/Kids Drinks
                INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                VALUES 
                    (size_option_id, 'Mini (24oz)', 0, true, NOW()),
                    (size_option_id, 'Full (32oz)', 0, false, NOW());
            ELSIF is_meal_replacement THEN
                -- 24oz only for Meal Replacement Shakes
                INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                VALUES (size_option_id, '24oz', 0, true, NOW());
            ELSE
                -- Small, Medium, Large for other liquid items
                INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                VALUES 
                    (size_option_id, 'Small', 0, true, NOW()),
                    (size_option_id, 'Medium', 0.50, false, NOW()),
                    (size_option_id, 'Large', 1.00, false, NOW());
            END IF;
            
            RAISE NOTICE '✅ Created size option for product: %', product_record.name;
        END IF;
        
        -- Create Add-ons option for drinks/shakes
        IF is_drink_or_shake AND NOT has_addons_option THEN
            -- Create add-ons option
            INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required, created_at)
            VALUES (product_record.id, 'Add-ons', 'multiple', false, NOW())
            RETURNING id INTO addons_option_id;
            
            -- Create add-ons choices based on category
            IF is_beauty_specialty_kids THEN
                -- Beauty/Specialty/Kids Drinks add-ons
                INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                VALUES 
                    (addons_option_id, 'Whipped Cream', 0.50, false, NOW()),
                    (addons_option_id, 'Caramel Drizzle', 0.50, false, NOW()),
                    (addons_option_id, 'Vanilla Syrup', 0.50, false, NOW()),
                    (addons_option_id, 'Honey', 0.50, false, NOW());
            ELSIF is_meal_replacement THEN
                -- Meal Replacement Shakes add-ons
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
                -- Default drink add-ons
                INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default, created_at)
                VALUES 
                    (addons_option_id, 'Whipped Cream', 0.50, false, NOW()),
                    (addons_option_id, 'Caramel Drizzle', 0.50, false, NOW()),
                    (addons_option_id, 'Vanilla Syrup', 0.50, false, NOW()),
                    (addons_option_id, 'Honey', 0.50, false, NOW());
            END IF;
            
            RAISE NOTICE '✅ Created add-ons option for product: %', product_record.name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Finished creating variations for all products';
END $$;

-- Verify the created variations
SELECT 
    mi.name as product_name,
    co.option_name,
    co.option_type,
    co.is_required,
    COUNT(cc.id) as choices_count
FROM menu_items mi
LEFT JOIN customization_options co ON co.menu_item_id = mi.id
LEFT JOIN customization_choices cc ON cc.option_id = co.id
WHERE mi.is_available = true
GROUP BY mi.id, mi.name, co.id, co.option_name, co.option_type, co.is_required
ORDER BY mi.name, co.option_name;
