-- Power Bowl Variations SQL Script
-- Run this in your Supabase SQL Editor to add Power Bowl variations

-- First, find Power Bowl product IDs (adjust the WHERE clause based on your actual product names)
-- You can run this SELECT first to see your Power Bowl products:
-- SELECT id, name FROM menu_items WHERE name ILIKE '%power bowl%' OR category_id = 'cat-power-bowl';

-- =====================================================
-- OPTION 1: Base Selection (Required, Single Choice)
-- =====================================================
INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required)
SELECT id, 'Pick your Base', 'single', true
FROM menu_items 
WHERE name ILIKE '%power bowl%' OR category_id = 'cat-power-bowl'
ON CONFLICT DO NOTHING;

-- Base Choices
INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Açaí', 0, true
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Pick your Base' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Pitaya', 0, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Pick your Base' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Oatmeal', 0, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Pick your Base' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

-- =====================================================
-- OPTION 2: Granola Selection (Required, Single Choice)
-- =====================================================
INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required)
SELECT id, 'Add Granola or Not', 'single', true
FROM menu_items 
WHERE name ILIKE '%power bowl%' OR category_id = 'cat-power-bowl'
ON CONFLICT DO NOTHING;

-- Granola Choices
INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Granola', 0, true
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Add Granola or Not' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'No Granola', 0, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Add Granola or Not' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Blueberry Flax', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Add Granola or Not' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

-- =====================================================
-- OPTION 3: Fruits Selection (Required, Multiple Choice - Pick 3)
-- =====================================================
INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required)
SELECT id, 'Pick 3 Fruits', 'multiple', true
FROM menu_items 
WHERE name ILIKE '%power bowl%' OR category_id = 'cat-power-bowl'
ON CONFLICT DO NOTHING;

-- Fruit Choices
INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Banana', 0, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Pick 3 Fruits' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Blueberry', 0, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Pick 3 Fruits' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Kiwi', 0, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Pick 3 Fruits' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Pineapple', 0, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Pick 3 Fruits' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Strawberry', 0, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Pick 3 Fruits' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

-- =====================================================
-- OPTION 4: Agaves Boosta (Optional, Multiple Choice)
-- =====================================================
INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required)
SELECT id, 'Agaves Boosta', 'multiple', false
FROM menu_items 
WHERE name ILIKE '%power bowl%' OR category_id = 'cat-power-bowl'
ON CONFLICT DO NOTHING;

-- Boosta Choices
INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Almond', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Bee Pollen', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Cacao Nibs', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Caramel', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Coconut Flakes', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Chia Seeds', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Hemp Seeds', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Honey', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Nutella', 1.00, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default)
SELECT co.id, 'Peanut Butter', 0.50, false
FROM customization_options co
JOIN menu_items mi ON co.menu_item_id = mi.id
WHERE co.option_name = 'Agaves Boosta' AND (mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl')
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFY: Check inserted data
-- =====================================================
SELECT 
  mi.name as product_name,
  co.option_name,
  co.option_type,
  co.is_required,
  COUNT(cc.id) as choice_count
FROM menu_items mi
JOIN customization_options co ON co.menu_item_id = mi.id
LEFT JOIN customization_choices cc ON cc.option_id = co.id
WHERE mi.name ILIKE '%power bowl%' OR mi.category_id = 'cat-power-bowl'
GROUP BY mi.name, co.option_name, co.option_type, co.is_required
ORDER BY mi.name, co.option_name;
