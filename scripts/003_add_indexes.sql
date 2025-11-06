-- ================================================
-- MIGRATION 003: Add Performance Indexes
-- ================================================
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/lpfqfpkmmwbbhwtzaagl/sql/new

-- ================================================
-- Tasks Table Indexes
-- ================================================

-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workstream_id ON tasks(workstream_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_class_id ON tasks(class_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_urgency ON tasks(urgency);
CREATE INDEX IF NOT EXISTS idx_tasks_timeframe ON tasks(timeframe);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_timeframe ON tasks(user_id, timeframe);
CREATE INDEX IF NOT EXISTS idx_tasks_user_workstream ON tasks(user_id, workstream_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_workstream_status ON tasks(workstream_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);

-- ================================================
-- Canvas Assignments Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_canvas_assignments_user_id ON canvas_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_class_id ON canvas_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_canvas_id ON canvas_assignments(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_type ON canvas_assignments(type);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_due_date ON canvas_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_status ON canvas_assignments(status);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_timeframe ON canvas_assignments(timeframe);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_posted_at ON canvas_assignments(posted_at DESC);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_canvas_user_due_date ON canvas_assignments(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_canvas_user_class ON canvas_assignments(user_id, class_id);

-- ================================================
-- Workstreams Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_workstreams_user_id ON workstreams(user_id);
CREATE INDEX IF NOT EXISTS idx_workstreams_type ON workstreams(type);
CREATE INDEX IF NOT EXISTS idx_workstreams_created_at ON workstreams(created_at DESC);

-- ================================================
-- Projects Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_workstream_id ON projects(workstream_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_workstream_status ON projects(workstream_id, status);

-- ================================================
-- Classes Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_classes_user_id ON classes(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_workstream_id ON classes(workstream_id);
CREATE INDEX IF NOT EXISTS idx_classes_canvas_course_id ON classes(canvas_course_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON classes(created_at DESC);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_classes_user_status ON classes(user_id, status);

-- ================================================
-- Calendar Events Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_workstream_id ON calendar_events(workstream_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id);
-- Fixed column name from 'source' to 'calendar_source'
CREATE INDEX IF NOT EXISTS idx_calendar_events_source ON calendar_events(calendar_source);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_time ON calendar_events(end_time);

-- Composite indexes for date range queries
CREATE INDEX IF NOT EXISTS idx_calendar_user_start_time ON calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_user_date_range ON calendar_events(user_id, start_time, end_time);

-- ================================================
-- Emails Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
-- Fixed column name from 'account_id' to 'email_account_id'
CREATE INDEX IF NOT EXISTS idx_emails_account_id ON emails(email_account_id);
CREATE INDEX IF NOT EXISTS idx_emails_workstream_id ON emails(workstream_id);
CREATE INDEX IF NOT EXISTS idx_emails_project_id ON emails(project_id);
CREATE INDEX IF NOT EXISTS idx_emails_class_id ON emails(class_id);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_priority ON emails(priority);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_is_starred ON emails(is_starred);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_emails_user_status ON emails(user_id, status);
CREATE INDEX IF NOT EXISTS idx_emails_user_priority ON emails(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_emails_user_received ON emails(user_id, received_at DESC);

-- Full-text search index on subject and sender
-- Fixed column name from 'from_email' to 'from_address'
CREATE INDEX IF NOT EXISTS idx_emails_subject_search ON emails USING gin(to_tsvector('english', subject));
CREATE INDEX IF NOT EXISTS idx_emails_from_search ON emails USING gin(to_tsvector('english', from_address));

-- ================================================
-- Transactions Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
-- Removed account_id index as this column doesn't exist in transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);

-- Composite indexes for financial reports
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date ON transactions(user_id, type, date DESC);

-- ================================================
-- Task Comments Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);

-- ================================================
-- Email Accounts Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_email_accounts_user_id ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_provider ON email_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_email_accounts_is_active ON email_accounts(is_active);

-- ================================================
-- Calendar Connections Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_calendar_connections_user_id ON calendar_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_connections_provider ON calendar_connections(provider);
CREATE INDEX IF NOT EXISTS idx_calendar_connections_is_active ON calendar_connections(is_active);

-- ================================================
-- Accounts Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);

-- ================================================
-- Savings Goals Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);

-- ================================================
-- Subscriptions Table Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);

-- ================================================
-- Analyze Tables for Query Planner
-- ================================================
-- This helps PostgreSQL optimize queries
ANALYZE tasks;
ANALYZE canvas_assignments;
ANALYZE workstreams;
ANALYZE projects;
ANALYZE classes;
ANALYZE calendar_events;
ANALYZE emails;
ANALYZE transactions;
ANALYZE task_comments;
ANALYZE email_accounts;
ANALYZE calendar_connections;
ANALYZE accounts;
ANALYZE savings_goals;
ANALYZE subscriptions;

-- ================================================
-- Verification Query
-- ================================================
-- Run this to see all indexes:
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index usage (run after app has been used for a while):
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
