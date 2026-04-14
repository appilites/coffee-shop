# Vercel Deployment Setup Guide

## Step 1: Configure Environment Variables in Vercel Dashboard

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your coffee shop project
3. Click on the "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add the following environment variables one by one:

### Environment Variables to Add:

**Variable 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://xnmnklgmmeqpajxwrkir.supabase.co`
- Environment: Production, Preview, Development (select all)

**Variable 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ0MzgsImV4cCI6MjA4ODMxMDQzOH0.kQAaa27pr99vO8Ez1ffQJMrdFmiYD2uc00odwOmA9eM`
- Environment: Production, Preview, Development (select all)

**Variable 3:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjczNDQzOCwiZXhwIjoyMDg4MzEwNDM4fQ.swodebMA9Oz_YhxPyYiFsYv7QhTC94QXQScZYhkJ898`
- Environment: Production, Preview, Development (select all)

6. After adding all variables, click "Save" for each one
7. Redeploy your project by going to "Deployments" tab and clicking "Redeploy" on the latest deployment

## Step 2: Setup Supabase Database

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `xnmnklgmmeqpajxwrkir`
3. Click on "SQL Editor" in the left sidebar
4. Create a new query and copy-paste the following SQL code:

```sql
-- Complete Database Setup for New Arrivals System
-- Copy and paste this entire code block into Supabase SQL Editor

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
```

5. Click "Run" to execute the SQL code
6. You should see success messages and the sample data in the results

## Step 3: Verify Setup

1. After running the SQL code, check that you see:
   - "Database setup completed successfully!" message
   - 3 records in the new_arrivals table
   - Storage bucket created successfully

2. Go back to Vercel and redeploy your project:
   - Go to Vercel dashboard → Your project → Deployments
   - Click "Redeploy" on the latest deployment

3. Test the API endpoint:
   - Visit: `https://your-vercel-url.vercel.app/api/public/new-arrivals`
   - You should see JSON response with `"success": true` and 3 new arrival items

## Step 4: Test the Website

1. Visit your deployed website
2. Check that the "New Arrivals" section shows 3 items
3. Verify that the horizontal slider works if you have more than 3 items
4. Test the admin panel at `/admin-new-arrivals` to add/edit items

## Troubleshooting

If you still see errors:

1. **Check Environment Variables**: Make sure all 3 environment variables are added correctly in Vercel
2. **Check Database**: Run the SQL code again in Supabase SQL Editor
3. **Check Logs**: Go to Vercel → Functions → View logs to see any error messages
4. **Redeploy**: Always redeploy after adding environment variables

## Notes

- The API will show fallback data if Supabase is not configured properly
- All images should be placed in the `/public` folder of your project
- The system works offline with fallback data even without database connection