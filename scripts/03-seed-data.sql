-- Seed locations
INSERT INTO locations (name, address, city, state, zip_code, phone, opening_time, closing_time) VALUES
  ('Downtown Coffee Shop', '123 Main Street', 'San Francisco', 'CA', '94102', '(415) 555-0100', '06:00:00', '20:00:00'),
  ('Bay Area Coffee Shop', '456 Market Street', 'Oakland', 'CA', '94607', '(510) 555-0200', '06:00:00', '20:00:00'),
  ('Silicon Valley Coffee Shop', '789 University Ave', 'Palo Alto', 'CA', '94301', '(650) 555-0300', '06:00:00', '20:00:00');

-- Seed menu categories
INSERT INTO menu_categories (name, description, display_order) VALUES
  ('Hot Drinks', 'Classic hot beverages to warm your soul', 1),
  ('Cold Drinks', 'Refreshing iced and blended drinks', 2),
  ('Espresso', 'Premium espresso-based drinks', 3),
  ('Pastries', 'Freshly baked pastries and treats', 4);

-- Seed menu items
INSERT INTO menu_items (category_id, name, description, base_price, is_featured) 
SELECT 
  c.id,
  'Caffe Latte',
  'Rich espresso with steamed milk and a light layer of foam',
  4.95,
  true
FROM menu_categories c WHERE c.name = 'Hot Drinks';

INSERT INTO menu_items (category_id, name, description, base_price, is_featured)
SELECT 
  c.id,
  'Cappuccino',
  'Espresso with equal parts steamed milk and foam',
  4.75,
  true
FROM menu_categories c WHERE c.name = 'Hot Drinks';

INSERT INTO menu_items (category_id, name, description, base_price)
SELECT 
  c.id,
  'Americano',
  'Espresso shots with hot water for a smooth, full-bodied taste',
  3.95
FROM menu_categories c WHERE c.name = 'Hot Drinks';

INSERT INTO menu_items (category_id, name, description, base_price, is_featured)
SELECT 
  c.id,
  'Iced Latte',
  'Espresso over ice with cold milk',
  5.25,
  true
FROM menu_categories c WHERE c.name = 'Cold Drinks';

INSERT INTO menu_items (category_id, name, description, base_price)
SELECT 
  c.id,
  'Cold Brew',
  'Smooth, naturally sweet coffee steeped for 20 hours',
  4.50
FROM menu_categories c WHERE c.name = 'Cold Drinks';

INSERT INTO menu_items (category_id, name, description, base_price, is_featured)
SELECT 
  c.id,
  'Mocha Frappuccino',
  'Blended coffee with chocolate, milk, and ice',
  6.25,
  true
FROM menu_categories c WHERE c.name = 'Cold Drinks';

INSERT INTO menu_items (category_id, name, description, base_price)
SELECT 
  c.id,
  'Espresso',
  'Rich, full-bodied espresso shot',
  2.95
FROM menu_categories c WHERE c.name = 'Espresso';

INSERT INTO menu_items (category_id, name, description, base_price)
SELECT 
  c.id,
  'Macchiato',
  'Espresso marked with a dollop of foam',
  3.75
FROM menu_categories c WHERE c.name = 'Espresso';

INSERT INTO menu_items (category_id, name, description, base_price)
SELECT 
  c.id,
  'Croissant',
  'Buttery, flaky French pastry',
  3.50
FROM menu_categories c WHERE c.name = 'Pastries';

INSERT INTO menu_items (category_id, name, description, base_price)
SELECT 
  c.id,
  'Blueberry Muffin',
  'Fresh baked muffin loaded with blueberries',
  3.95
FROM menu_categories c WHERE c.name = 'Pastries';

-- Seed customization options for drinks
DO $$
DECLARE
  drink_item RECORD;
  size_option_id UUID;
  milk_option_id UUID;
  extras_option_id UUID;
BEGIN
  -- Add Size options to all drinks
  FOR drink_item IN 
    SELECT id FROM menu_items WHERE category_id IN (
      SELECT id FROM menu_categories WHERE name IN ('Hot Drinks', 'Cold Drinks', 'Espresso')
    )
  LOOP
    INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required)
    VALUES (drink_item.id, 'Size', 'single', true)
    RETURNING id INTO size_option_id;
    
    INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default) VALUES
      (size_option_id, 'Small', 0.00, true),
      (size_option_id, 'Medium', 0.75, false),
      (size_option_id, 'Large', 1.25, false);
    
    -- Add Milk options to lattes and cappuccinos
    IF drink_item.id IN (SELECT id FROM menu_items WHERE name LIKE '%Latte%' OR name LIKE '%Cappuccino%') THEN
      INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required)
      VALUES (drink_item.id, 'Milk Type', 'single', false)
      RETURNING id INTO milk_option_id;
      
      INSERT INTO customization_choices (option_id, choice_name, price_modifier, is_default) VALUES
        (milk_option_id, 'Whole Milk', 0.00, true),
        (milk_option_id, 'Oat Milk', 0.75, false),
        (milk_option_id, 'Almond Milk', 0.75, false),
        (milk_option_id, 'Soy Milk', 0.75, false);
    END IF;
    
    -- Add Extras option
    INSERT INTO customization_options (menu_item_id, option_name, option_type, is_required)
    VALUES (drink_item.id, 'Extras', 'multiple', false)
    RETURNING id INTO extras_option_id;
    
    INSERT INTO customization_choices (option_id, choice_name, price_modifier) VALUES
      (extras_option_id, 'Extra Shot', 0.75),
      (extras_option_id, 'Whipped Cream', 0.50),
      (extras_option_id, 'Caramel Drizzle', 0.50),
      (extras_option_id, 'Vanilla Syrup', 0.50);
  END LOOP;
END $$;
