-- ========================================
-- Supabase RLS Policies for Wallpapers Table
-- ========================================
-- Run this SQL in your Supabase SQL Editor to fix the RLS policy errors
-- Dashboard > SQL Editor > New Query > Paste and Run

-- 1. Enable RLS on wallpapers table (if not already enabled)
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on storage bucket (wallpapers)
-- Note: This should be done via Supabase Storage UI:
-- Dashboard > Storage > wallpapers bucket > Configuration > Public bucket: ON

-- 3. Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for wallpapers" ON wallpapers;
DROP POLICY IF EXISTS "Authenticated users can insert wallpapers" ON wallpapers;
DROP POLICY IF EXISTS "Authenticated users can update wallpapers" ON wallpapers;
DROP POLICY IF EXISTS "Authenticated users can delete wallpapers" ON wallpapers;

-- 4. Create new policies

-- Allow anyone to read wallpapers (public gallery)
CREATE POLICY "Public read access for wallpapers"
ON wallpapers
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert wallpapers
CREATE POLICY "Authenticated users can insert wallpapers"
ON wallpapers
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update wallpapers
CREATE POLICY "Authenticated users can update wallpapers"
ON wallpapers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete wallpapers
CREATE POLICY "Authenticated users can delete wallpapers"
ON wallpapers
FOR DELETE
TO authenticated
USING (true);

-- ========================================
-- Storage Policies for wallpapers bucket
-- ========================================
-- Run these in SQL Editor as well

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Public read access for wallpapers storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload wallpapers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update wallpapers storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete wallpapers storage" ON storage.objects;

-- Allow public read access to wallpapers storage
CREATE POLICY "Public read access for wallpapers storage"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'wallpapers');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload wallpapers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wallpapers');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update wallpapers storage"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'wallpapers')
WITH CHECK (bucket_id = 'wallpapers');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete wallpapers storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'wallpapers');

-- ========================================
-- Verify Setup
-- ========================================
-- Run this query to verify your policies are set up correctly:
-- SELECT * FROM pg_policies WHERE tablename = 'wallpapers';
