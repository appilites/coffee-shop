-- Complete Supabase Storage Setup for New Arrivals
-- Copy and paste this into Supabase SQL Editor

-- First, create the bucket (if not created via UI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('new-arrivals-images', 'new-arrivals-images', true);

-- Set up storage policies for the bucket
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'new-arrivals-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'new-arrivals-images');

CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'new-arrivals-images');

CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'new-arrivals-images');

-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'new-arrivals-images';

-- Test public URL generation (should return a URL)
SELECT storage.url('new-arrivals-images', 'test-file.jpg') as test_url;