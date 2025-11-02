-- Create tasks table with all fields from the Task type
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  workstream_id TEXT NOT NULL,
  project_id TEXT,
  class_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('big_rock', 'medium_rock', 'small_rock')),
  urgency TEXT CHECK (urgency IN ('urgent', 'look_out', 'chill')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')),
  timeframe TEXT CHECK (timeframe IN ('this_week', 'next_week')),
  due_date TIMESTAMPTZ,
  scheduled_time TIMESTAMPTZ,
  scheduled_end_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  linked_canvas_assignment_id TEXT,
  external_id TEXT,
  external_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workstream_id ON tasks(workstream_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
-- For now, we'll use simple policies based on user_id
-- In a real app with auth, you'd use auth.uid()
CREATE POLICY "Allow users to view their own tasks" 
  ON tasks FOR SELECT 
  USING (true); -- Allow all for now since we're using a hardcoded user_id

CREATE POLICY "Allow users to insert their own tasks" 
  ON tasks FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own tasks" 
  ON tasks FOR UPDATE 
  USING (true);

CREATE POLICY "Allow users to delete their own tasks" 
  ON tasks FOR DELETE 
  USING (true);

-- Create RLS policies for task_comments
CREATE POLICY "Allow users to view comments on their tasks" 
  ON task_comments FOR SELECT 
  USING (true);

CREATE POLICY "Allow users to insert comments on their tasks" 
  ON task_comments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own comments" 
  ON task_comments FOR UPDATE 
  USING (true);

CREATE POLICY "Allow users to delete their own comments" 
  ON task_comments FOR DELETE 
  USING (true);
