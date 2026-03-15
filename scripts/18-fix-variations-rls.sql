-- Fix RLS policies for variations tables
-- Run this BEFORE running the variations creation script

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read" ON customization_options;
DROP POLICY IF EXISTS "Allow authenticated read" ON customization_options;
DROP POLICY IF EXISTS "Allow authenticated write" ON customization_options;

DROP POLICY IF EXISTS "Allow anonymous read" ON customization_choices;
DROP POLICY IF EXISTS "Allow authenticated read" ON customization_choices;
DROP POLICY IF EXISTS "Allow authenticated write" ON customization_choices;

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

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read options" 
ON customization_options FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated read choices" 
ON customization_choices FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to write (for admin dashboard)
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

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('customization_options', 'customization_choices')
ORDER BY tablename, policyname;
