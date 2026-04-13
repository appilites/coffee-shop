-- Supabase Storage Policies for New Arrivals Images
-- Run these queries in Supabase SQL Editor after creating the bucket

-- Allow public read access to images
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'new-arrivals-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'new-arrivals-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'new-arrivals-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'new-arrivals-images');