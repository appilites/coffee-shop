-- Remove all auto-generated variations (Size and Add-ons)
-- This will delete variations that were created by scripts
-- Only manually added variations from dashboard will remain

-- Delete Size variations
DELETE FROM customization_choices 
WHERE option_id IN (
    SELECT id FROM customization_options 
    WHERE LOWER(option_name) = 'size'
);

DELETE FROM customization_options 
WHERE LOWER(option_name) = 'size';

-- Delete Add-ons variations
DELETE FROM customization_choices 
WHERE option_id IN (
    SELECT id FROM customization_options 
    WHERE LOWER(option_name) = 'add-ons' OR LOWER(option_name) = 'addons'
);

DELETE FROM customization_options 
WHERE LOWER(option_name) = 'add-ons' OR LOWER(option_name) = 'addons';

-- Show remaining variations (only manually added ones)
SELECT 
    mi.name as product_name,
    co.option_name,
    co.option_type,
    co.is_required,
    COUNT(cc.id) as choices_count
FROM menu_items mi
INNER JOIN customization_options co ON co.menu_item_id = mi.id
LEFT JOIN customization_choices cc ON cc.option_id = co.id
WHERE mi.is_available = true
GROUP BY mi.id, mi.name, co.id, co.option_name, co.option_type, co.is_required
ORDER BY mi.name, co.option_name;

-- Summary
SELECT 
    COUNT(DISTINCT co.menu_item_id) as products_with_manual_variations,
    COUNT(DISTINCT co.id) as total_manual_variation_options,
    COUNT(DISTINCT cc.id) as total_manual_variation_choices
FROM customization_options co
LEFT JOIN customization_choices cc ON cc.option_id = co.id;
