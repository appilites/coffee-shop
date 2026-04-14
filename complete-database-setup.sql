-- Complete Database Setup for New Arrivals System
-- Copy and paste this entire code block into Supabase SQL Editor and click RUN

-- Step 1: Create the new_arrivals table
CREATE TABLE IF NOT EXISTS new_arrivals (
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

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_new_arrivals_active ON new_arrivals(is_active, display_order);

-- Step 3: Create function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 4: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_new_arrivals_updated_at ON new_arrivals;
CREATE TRIGGER update_new_arrivals_updated_at
  BEFORE UPDATE ON new_arrivals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Insert sample data (only if table is empty)
INSERT INTO new_arrivals (title, description, image_url, button_text, redirect_link, display_order) 
SELECT * FROM (VALUES
  ('Protein Waffles', 'Build your own protein-packed waffle with your favorite toppings', '/newarrival.jfif', 'Try Now', '/menu?category=cat-17', 1),
  ('Oat Milk Chai Tea Latte', 'Slow sips, sweet moments. Protein-packed chai tea latte with oat milk', '/newarrival1.jfif', 'Try Now', '/menu?category=cat-16', 2),
  ('Specialty Drinks', 'Explore our premium specialty drink collection with unique flavors', '/newarrival2.jfif', 'Try Now', '/menu?category=cat-specialty-drinks', 3)
) AS v(title, description, image_url, button_text, redirect_link, display_order)
WHERE NOT EXISTS (SELECT 1 FROM new_arrivals);

-- Step 6: Create storage bucket for images (if not exists)
INSERT INTO storage.buckets (id, name, public) 
SELECT 'new-arrivals-images', 'new-arrivals-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'new-arrivals-images');

-- Step 7: Set up storage policies for the bucket
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'new-arrivals-images');

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'new-arrivals-images');

DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'new-arrivals-images');

DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'new-arrivals-images');

-- Step 8: Verification queries
SELECT 'Database setup completed successfully!' as status;
SELECT 'New arrivals table:' as info, count(*) as total_records FROM new_arrivals;
SELECT 'Storage bucket:' as info, id, name, public FROM storage.buckets WHERE id = 'new-arrivals-images';
SELECT * FROM new_arrivals ORDER BY display_order;