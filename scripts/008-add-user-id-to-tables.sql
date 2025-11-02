-- Add user_id column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to canvas_assignments table if it exists
ALTER TABLE canvas_assignments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Create RLS policies for tasks
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- Enable Row Level Security on canvas_assignments
ALTER TABLE canvas_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own assignments" ON canvas_assignments;
DROP POLICY IF EXISTS "Users can insert own assignments" ON canvas_assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON canvas_assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON canvas_assignments;

-- Create RLS policies for canvas_assignments
CREATE POLICY "Users can view own assignments"
ON canvas_assignments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assignments"
ON canvas_assignments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments"
ON canvas_assignments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assignments"
ON canvas_assignments FOR DELETE
USING (auth.uid() = user_id);
