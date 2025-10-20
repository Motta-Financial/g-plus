-- Create classes table for organizing tasks within school workstreams
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workstream_id UUID REFERENCES workstreams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  course_code TEXT,
  description TEXT,
  color TEXT,
  instructor TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add class_id to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_workstream_id ON classes(workstream_id);
CREATE INDEX IF NOT EXISTS idx_tasks_class_id ON tasks(class_id);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for classes
CREATE POLICY "Users can view their own classes" ON classes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own classes" ON classes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes" ON classes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes" ON classes
  FOR DELETE USING (auth.uid() = user_id);
