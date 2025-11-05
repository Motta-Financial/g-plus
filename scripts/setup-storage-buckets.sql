-- SQL Script: Storage Bucket Setup for G+ App
-- Run this in your Supabase SQL Editor to create storage buckets
-- ===============================================================

-- 1. CREATE CANVAS MATERIALS BUCKET
-- ===============================================================

-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'canvas-materials',
  'canvas-materials',
  NULL,
  false,
  52428800,  -- 50MB in bytes
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip'
  ]::text[],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. CREATE TASK ATTACHMENTS BUCKET
-- ===============================================================

INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'task-attachments',
  'task-attachments',
  NULL,
  false,
  52428800,  -- 50MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip'
  ]::text[],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. CREATE USER AVATARS BUCKET
-- ===============================================================

INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'avatars',
  'avatars',
  NULL,
  true,  -- Public bucket for profile pictures
  5242880,  -- 5MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]::text[],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 4. STORAGE RLS POLICIES FOR CANVAS MATERIALS
-- ===============================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own canvas materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own canvas materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own canvas materials" ON storage.objects;

-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload own canvas materials"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'canvas-materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own files
CREATE POLICY "Users can view own canvas materials"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'canvas-materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own canvas materials"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'canvas-materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. STORAGE RLS POLICIES FOR TASK ATTACHMENTS
-- ===============================================================

DROP POLICY IF EXISTS "Users can upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete task attachments" ON storage.objects;

CREATE POLICY "Users can upload task attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'task-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view task attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'task-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete task attachments"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'task-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. STORAGE RLS POLICIES FOR AVATARS (PUBLIC)
-- ===============================================================

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Public read access for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can only upload to their own folder
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7. LIST ALL BUCKETS (VERIFICATION)
-- ===============================================================

-- Run this to verify buckets were created:
SELECT id, name, public, file_size_limit, created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- 8. LIST ALL STORAGE POLICIES (VERIFICATION)
-- ===============================================================

-- Run this to verify policies were created:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY policyname;
