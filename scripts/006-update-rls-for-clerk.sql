-- Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can create their own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can update their own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can delete their own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can create their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view their own canvas courses" ON canvas_courses;
DROP POLICY IF EXISTS "Users can create their own canvas courses" ON canvas_courses;
DROP POLICY IF EXISTS "Users can update their own canvas courses" ON canvas_courses;
DROP POLICY IF EXISTS "Users can delete their own canvas courses" ON canvas_courses;
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- Disable RLS temporarily to allow service role access
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE workstreams DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- Note: With Clerk, we'll handle authorization in the application layer
-- using the Clerk user ID. RLS is disabled to allow the service role
-- to access data, and we filter by user_id in our queries.
