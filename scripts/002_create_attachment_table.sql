-- ================================================
-- MIGRATION 002: Create Attachment Tracking Tables
-- ================================================
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/lpfqfpkmmwbbhwtzaagl/sql/new

-- ================================================
-- Ensure handle_updated_at function exists
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Create task_attachments table
-- ================================================
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own attachments"
ON task_attachments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can upload their own attachments"
ON task_attachments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own attachments"
ON task_attachments FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_attachments_user_id ON task_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_created_at ON task_attachments(created_at DESC);

-- ================================================
-- Verification Query
-- ================================================
-- Run this to verify tables were created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'task_attachments';

-- Verify policies:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'task_attachments';
