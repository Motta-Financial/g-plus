-- Create users table for authentication and personalization
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  theme_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workstreams table (School, Work, Life, Side Quests)
CREATE TABLE IF NOT EXISTS workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('school', 'work', 'life', 'side_quest')),
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table (for organizing tasks within workstreams)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workstream_id UUID REFERENCES workstreams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create classes table for academic courses
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workstream_id UUID REFERENCES workstreams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  course_code TEXT,
  description TEXT,
  color TEXT,
  instructor TEXT,
  canvas_course_id TEXT,
  canvas_course_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table with priority rocks system
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workstream_id UUID REFERENCES workstreams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'small_rock' CHECK (priority IN ('big_rock', 'medium_rock', 'small_rock')),
  urgency TEXT CHECK (urgency IN ('urgent', 'look_out', 'chill')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')),
  timeframe TEXT CHECK (timeframe IN ('this_week', 'next_week')),
  due_date TIMESTAMPTZ,
  scheduled_time TIMESTAMPTZ,
  scheduled_end_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  linked_canvas_assignment_id TEXT,
  external_id TEXT,
  external_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create canvas_assignments table for Canvas LMS integration
CREATE TABLE IF NOT EXISTS canvas_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'announcement', 'event')),
  course_id TEXT NOT NULL,
  course_code TEXT,
  course_name TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')),
  urgency TEXT CHECK (urgency IN ('urgent', 'look_out', 'chill')),
  scheduled_time TIMESTAMPTZ,
  scheduled_end_time TIMESTAMPTZ,
  points_possible NUMERIC,
  submission_types TEXT[],
  canvas_url TEXT,
  posted_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar_events table for integrated calendars
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workstream_id UUID REFERENCES workstreams(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  calendar_source TEXT CHECK (calendar_source IN ('google', 'outlook', 'apple', 'canvas', 'manual')),
  external_id TEXT,
  color TEXT,
  all_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table for customization
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#8b5cf6',
  accent_color TEXT DEFAULT '#ec4899',
  canvas_api_token TEXT,
  canvas_base_url TEXT DEFAULT 'https://canvas.suffolk.edu',
  google_calendar_connected BOOLEAN DEFAULT FALSE,
  outlook_calendar_connected BOOLEAN DEFAULT FALSE,
  apple_calendar_connected BOOLEAN DEFAULT FALSE,
  ai_assistant_name TEXT DEFAULT 'Mermaid',
  ai_assistant_personality TEXT DEFAULT 'helpful',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workstream_id ON tasks(workstream_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_class_id ON tasks(class_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_timeframe ON tasks(timeframe);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_projects_workstream_id ON projects(workstream_id);
CREATE INDEX IF NOT EXISTS idx_classes_workstream_id ON classes(workstream_id);
CREATE INDEX IF NOT EXISTS idx_workstreams_user_id ON workstreams(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_class_id ON canvas_assignments(class_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workstreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for workstreams
CREATE POLICY "Users can view their own workstreams" ON workstreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workstreams" ON workstreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workstreams" ON workstreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workstreams" ON workstreams
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for classes
CREATE POLICY "Users can view their own classes" ON classes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own classes" ON classes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes" ON classes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes" ON classes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for canvas_assignments (public read for now)
CREATE POLICY "Anyone can view canvas assignments" ON canvas_assignments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create canvas assignments" ON canvas_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update canvas assignments" ON canvas_assignments
  FOR UPDATE USING (true);

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view their own calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
