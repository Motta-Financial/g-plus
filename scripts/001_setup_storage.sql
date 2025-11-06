-- ================================================
-- MIGRATION 001: Setup Storage Buckets and Policies
-- ================================================
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/lpfqfpkmmwbbhwtzaagl/sql/new

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'task-attachments', 
    'task-attachments', 
    false,
    52428800, -- 50MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
  ),
  (
    'profile-avatars', 
    'profile-avatars', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  ),
  (
    'finance-documents', 
    'finance-documents', 
    false,
    52428800, -- 50MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  )
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- Storage RLS Policies for task-attachments bucket
-- ================================================

-- Allow users to upload their own task attachments
CREATE POLICY "Users can upload their own task attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own task attachments
CREATE POLICY "Users can view their own task attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own task attachments
CREATE POLICY "Users can update their own task attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'task-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own task attachments
CREATE POLICY "Users can delete their own task attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================
-- Storage RLS Policies for profile-avatars bucket
-- ================================================

-- Allow users to upload their own profile avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view profile avatars (public bucket)
CREATE POLICY "Anyone can view profile avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================
-- Storage RLS Policies for finance-documents bucket
-- ================================================

-- Allow users to upload their own finance documents
CREATE POLICY "Users can upload their own finance documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'finance-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own finance documents
CREATE POLICY "Users can view their own finance documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'finance-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own finance documents
CREATE POLICY "Users can update their own finance documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'finance-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own finance documents
CREATE POLICY "Users can delete their own finance documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'finance-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================
-- Verification Query
-- ================================================
-- Run this to verify buckets were created:
SELECT * FROM storage.buckets;

-- Verify policies were created:
SELECT * FROM pg_policies WHERE tablename = 'objects';
