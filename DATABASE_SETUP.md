# Database Setup Guide

Your app uses Supabase as the database. The SQL migration scripts need to be executed in your Supabase dashboard to create the necessary tables.

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/lpfqfpkmmwbbhwtzaagl
2. Click on "SQL Editor" in the left sidebar

### Step 2: Run Migration Scripts
Copy and paste each script below into the SQL Editor and click "Run":

#### Script 1: Create Tasks Table
\`\`\`sql
-- Copy the entire content from scripts/001_create_tasks_table.sql
-- This creates the tasks and task_comments tables with proper indexes and RLS policies
\`\`\`

#### Script 2: Add Timeframe to Canvas Assignments
\`\`\`sql
-- Copy the entire content from scripts/002_add_timeframe_to_canvas_assignments.sql
-- This adds the timeframe column to canvas_assignments table
\`\`\`

#### Script 3: Add Class Field to Tasks
\`\`\`sql
-- Copy the entire content from scripts/003-add-class-field.sql
-- This adds the class field to tasks table
\`\`\`

#### Script 4: Add Canvas Integration to Classes
\`\`\`sql
-- Copy the entire content from scripts/007-add-canvas-to-classes.sql
-- This adds Canvas course integration columns to classes table
\`\`\`

### Step 3: Verify Setup
After running all scripts, verify the tables were created:
1. Go to "Table Editor" in Supabase dashboard
2. You should see: `tasks`, `task_comments`, `canvas_assignments`, `classes`

### Step 4: Test Your App
1. Refresh your app
2. The database should now be connected and working
3. Tasks, classes, and Canvas assignments will be stored in Supabase

## Why Can't Scripts Run Automatically?

For security reasons, Supabase's JavaScript client doesn't allow direct SQL execution from the browser or API routes. This prevents SQL injection attacks. The recommended approach is to run migrations through:
- Supabase Dashboard SQL Editor (easiest)
- Supabase CLI (for production workflows)
- Database functions via RPC (for specific operations)

## Troubleshooting

**Error: "relation does not exist"**
- The tables haven't been created yet. Run the migration scripts in Supabase dashboard.

**Error: "permission denied"**
- Check that Row Level Security (RLS) policies are enabled and configured correctly.

**App still using localStorage**
- Clear your browser's localStorage and refresh
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly in your environment variables
