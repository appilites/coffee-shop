-- Create apothecary_items table
CREATE TABLE IF NOT EXISTS apothecary_items (
  id TEXT PRIMARY KEY DEFAULT ('apothecary-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 8)),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  button_text VARCHAR(100) DEFAULT 'DISCOVER',
  redirect_link TEXT,
  category VARCHAR(100) NOT NULL, -- 'loaded-teas', 'meal-shakes', 'beauty-drinks', 'power-snacks'
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO apothecary_items (title, description, image_url, button_text, redirect_link, category, display_order) VALUES
('Loaded Teas', 'Clean energy and mental clarity with zero sugar and metabolic boosting antioxidants.', '/loaded-tea.jpg', 'EXPLORE BLENDS', '/menu?category=cat-16', 'loaded-teas', 1),
('Meal Shakes', 'High-quality protein to keep you focused through the afternoon.', '/meal-shake.jpg', 'DISCOVER', '/menu?category=cat-protein', 'meal-shakes', 2),
('Beauty Drinks', 'Collagen-infused botanicals for glowing skin and cellular hydration.', '/beauty-drink.jpg', 'DISCOVER', '/menu?category=cat-specialty', 'beauty-drinks', 3),
('Power Snacks', 'Small-batch protein balls and sustenance crafted for the ambitious professional.', '/power-snacks.jpg', 'VIEW SNACKS', '/menu?category=cat-17', 'power-snacks', 4);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apothecary_items_active ON apothecary_items(is_active);
CREATE INDEX IF NOT EXISTS idx_apothecary_items_category ON apothecary_items(category);
CREATE INDEX IF NOT EXISTS idx_apothecary_items_order ON apothecary_items(display_order);