# Complete Database Schema Documentation

## Overview
This document describes the complete database schema for the G+ application, a comprehensive student/project management system with Canvas LMS integration, calendar sync, email management, and personal finance tracking.

## Database Structure

### Core Tables

#### 1. **user_profiles**
Extended user metadata beyond Supabase auth.
- Automatically created on user signup via trigger
- Stores profile information, avatar, bio, preferences

#### 2. **workstreams**
Top-level organizational categories (school, work, life, side_quest)
- Users organize all work into workstreams
- Each workstream has a type, color, and icon

#### 3. **projects**
Sub-categories under workstreams for grouping related tasks
- Belongs to a workstream
- Has status (active, completed, archived)
- Optional due date

#### 4. **classes**
School classes/courses with Canvas LMS integration
- Belongs to a workstream
- Links to Canvas courses via canvas_course_id
- Tracks instructor, course code, status

#### 5. **tasks**
Individual work items with rich metadata
- Belongs to workstream, optionally to project or class
- Priority (big_rock, medium_rock, small_rock)
- Urgency (urgent, look_out, chill)
- Status (todo, in_progress, completed, blocked)
- Timeframe (this_week, next_week)
- Can link to Canvas assignments
- Supports scheduling with start/end times

#### 6. **task_comments**
Comments on tasks for collaboration and notes

#### 7. **canvas_assignments**
Assignments synced from Canvas LMS
- Links to classes via class_id
- Tracks due dates, points, submission types
- Can be scheduled into timeframes

### Calendar Integration

#### 8. **calendar_connections**
Connected calendar accounts (Google, Outlook, Apple)
- Stores OAuth tokens for syncing
- Tracks last sync time and active status

#### 9. **calendar_events**
Events from all calendar sources
- Can link to workstreams and tasks
- Supports all-day events
- Tracks source (google, outlook, apple, canvas, manual)

### Email Integration

#### 10. **email_accounts**
Connected email accounts (Gmail, Outlook, IMAP)
- Stores OAuth tokens for syncing
- Configurable sync settings

#### 11. **emails**
Email messages with triage capabilities
- Can be assigned to workstreams, projects, or classes
- Priority and status for processing
- Supports labels, starring, attachments

#### 12. **email_comments**
Comments on emails for notes and collaboration

### Finance Tracking

#### 13. **transactions**
Income and expense tracking
- Categorized transactions
- Date-based for reporting

#### 14. **savings_goals**
Savings targets with progress tracking
- Current vs target amounts
- Optional images and links

#### 15. **accounts**
Bank accounts (checking, savings, credit)
- Balance tracking
- Account type classification

#### 16. **subscriptions**
Recurring subscription tracking
- Monthly or yearly billing cycles
- Next billing date tracking

#### 17. **financial_goals**
Financial goal checklist items

## Key Relationships

\`\`\`
auth.users (Supabase Auth)
├── user_profiles (1:1)
├── workstreams (1:many)
│   ├── projects (1:many)
│   ├── classes (1:many)
│   ├── tasks (1:many)
│   ├── calendar_events (1:many)
│   └── emails (1:many)
├── tasks (1:many)
│   ├── task_comments (1:many)
│   └── canvas_assignments (via linked_canvas_assignment_id)
├── canvas_assignments (1:many)
├── calendar_connections (1:many)
├── calendar_events (1:many)
├── email_accounts (1:many)
│   └── emails (1:many)
│       └── email_comments (1:many)
├── transactions (1:many)
├── savings_goals (1:many)
├── accounts (1:many)
├── subscriptions (1:many)
└── financial_goals (1:many)
\`\`\`

## Security (Row Level Security)

All tables implement RLS policies ensuring:
- Users can only access their own data
- Policies use `auth.uid() = user_id` for enforcement
- Cascading deletes maintain referential integrity
- Comments inherit access from parent records

## Triggers

### updated_at Trigger
All tables have an `updated_at` column that automatically updates on modification via the `handle_updated_at()` trigger function.

### User Profile Creation
The `handle_new_user()` trigger automatically creates a user profile when a new user signs up via Supabase Auth.

## Indexes

Strategic indexes are created on:
- Foreign keys for join performance
- Frequently queried columns (status, date fields)
- User ID columns for RLS policy performance
- Composite indexes where needed

## Data Types

- **UUIDs**: Primary keys and foreign keys
- **TEXT**: String fields with CHECK constraints for enums
- **TIMESTAMPTZ**: All timestamps with timezone support
- **NUMERIC**: Financial amounts for precision
- **BOOLEAN**: Flags and status indicators
- **TEXT[]**: Arrays for multi-value fields (emails, labels)
- **JSONB**: Flexible preferences storage

## Migration Order

Execute scripts in this order:
1. `009-create-user-profiles-table.sql` (user profiles with triggers)
2. `010-create-workstreams-table.sql` (workstreams)
3. `011-create-projects-table.sql` (projects)
4. `012-create-classes-table.sql` (classes)
5. `013-create-canvas-assignments-table.sql` (canvas assignments)
6. `014-update-tasks-table-with-foreign-keys.sql` (tasks with proper FKs)
7. `015-create-calendar-tables.sql` (calendar integration)
8. `016-create-email-tables.sql` (email integration)
9. `017-create-finance-tables.sql` (finance tracking)

## Common Queries

See `COMMON_QUERIES.md` for frequently used query patterns.
