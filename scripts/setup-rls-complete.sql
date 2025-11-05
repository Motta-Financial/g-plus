-- 🔒 Complete Row Level Security (RLS) Setup Script
-- This script enables RLS on all tables and creates policies for user data isolation
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- ============================================================================
-- STEP 1: Enable RLS on All Tables
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workstreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Create User Profile Trigger
-- ============================================================================

-- Function to automatically create a user profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, created_at)
  VALUES (new.id, now())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 3: Create RLS Policies - User Profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
ON user_profiles FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Create RLS Policies - Tasks
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

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

-- ============================================================================
-- STEP 5: Create RLS Policies - Classes
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own classes" ON classes;
DROP POLICY IF EXISTS "Users can insert own classes" ON classes;
DROP POLICY IF EXISTS "Users can update own classes" ON classes;
DROP POLICY IF EXISTS "Users can delete own classes" ON classes;

CREATE POLICY "Users can view own classes"
ON classes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own classes"
ON classes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own classes"
ON classes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own classes"
ON classes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: Create RLS Policies - Canvas Assignments
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own canvas assignments" ON canvas_assignments;
DROP POLICY IF EXISTS "Users can insert own canvas assignments" ON canvas_assignments;
DROP POLICY IF EXISTS "Users can update own canvas assignments" ON canvas_assignments;
DROP POLICY IF EXISTS "Users can delete own canvas assignments" ON canvas_assignments;

CREATE POLICY "Users can view own canvas assignments"
ON canvas_assignments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own canvas assignments"
ON canvas_assignments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canvas assignments"
ON canvas_assignments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canvas assignments"
ON canvas_assignments FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 7: Create RLS Policies - Workstreams
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can insert own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can update own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can delete own workstreams" ON workstreams;

CREATE POLICY "Users can view own workstreams"
ON workstreams FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workstreams"
ON workstreams FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workstreams"
ON workstreams FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workstreams"
ON workstreams FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 8: Create RLS Policies - Projects
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 9: Create RLS Policies - Calendar Events
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON calendar_events;

CREATE POLICY "Users can view own calendar events"
ON calendar_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events"
ON calendar_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
ON calendar_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
ON calendar_events FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 10: Create RLS Policies - Emails
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own emails" ON emails;
DROP POLICY IF EXISTS "Users can insert own emails" ON emails;
DROP POLICY IF EXISTS "Users can update own emails" ON emails;
DROP POLICY IF EXISTS "Users can delete own emails" ON emails;

CREATE POLICY "Users can view own emails"
ON emails FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails"
ON emails FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails"
ON emails FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails"
ON emails FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 11: Create RLS Policies - Transactions
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
ON transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
ON transactions FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 12: Create RLS Policies - Accounts
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

CREATE POLICY "Users can view own accounts"
ON accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
ON accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
ON accounts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
ON accounts FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 13: Verify RLS Setup
-- ============================================================================

-- Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check policies created
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================================
-- SUCCESS! Your database is now secured with Row Level Security
-- ============================================================================
