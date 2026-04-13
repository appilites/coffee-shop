-- New Arrivals Table Creation Script
-- Copy and paste this directly into your Supabase SQL Editor

-- Create the new_arrivals table
CREATE TABLE new_arrivals (
  id TEXT PRIMARY KEY DEFAULT ('arrival-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 8)),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  button_text TEXT DEFAULT 'Try Now',
  redirect_link TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_new_arrivals_active ON new_arrivals(is_active, display_order);

-- Create function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_new_arrivals_updated_at
  BEFORE UPDATE ON new_arrivals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO new_arrivals (title, description, image_url, button_text, redirect_link, display_order) VALUES
('Protein Waffles', 'Build your own protein-packed waffle with your favorite toppings', '/newarrival.jfif', 'Try Now', '/menu?category=cat-17', 1),
('Oat Milk Chai Tea Latte', 'Slow sips, sweet moments. Protein-packed chai tea latte with oat milk', '/newarrival1.jfif', 'Try Now', '/menu?category=cat-16', 2),
('Specialty Drinks', 'Explore our premium specialty drink collection with unique flavors', '/newarrival2.jfif', 'Try Now', '/menu?category=cat-specialty-drinks', 3);

-- Verify the table was created successfully
SELECT 'New arrivals table created successfully!' as status;
SELECT * FROM new_arrivals ORDER BY display_order;