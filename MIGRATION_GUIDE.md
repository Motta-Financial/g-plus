# Database Migration Guide

## Running Migrations

You have two options to push the database schema to Supabase:

### Option 1: Use the Migration Runner UI (Recommended)

1. Navigate to `/database/setup` in your app
2. Click "Run All Migrations"
3. Watch the progress as each migration executes
4. Verify all migrations completed successfully

### Option 2: Run Manually in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/lpfqfpkmmwbbhwtzaagl/sql
2. Copy and paste each SQL file from the `/scripts` folder in this order:
   - `000_setup_exec_function.sql` - Creates the exec_sql function
   - `009-create-user-profiles-table.sql` - User profiles
   - `010-create-workstreams-table.sql` - Workstreams
   - `011-create-projects-table.sql` - Projects
   - `012-create-classes-table.sql` - Classes
   - `001_create_tasks_table.sql` - Tasks
   - `013-create-canvas-assignments-table.sql` - Canvas assignments
   - `014-update-tasks-table-with-foreign-keys.sql` - Task relationships
   - `015-create-calendar-tables.sql` - Calendar integration
   - `016-create-email-tables.sql` - Email management
   - `017-create-finance-tables.sql` - Finance tracking

3. Execute each script one at a time
4. Verify no errors occurred

## What Gets Created

### Tables
- **user_profiles** - User profile information and settings
- **workstreams** - Top-level organizational units
- **projects** - Projects within workstreams
- **classes** - Academic classes
- **tasks** - Tasks linked to projects/classes
- **canvas_assignments** - Canvas LMS assignments
- **calendar_events** - Calendar events and meetings
- **calendar_integrations** - Calendar service connections
- **emails** - Email messages
- **email_threads** - Email conversation threads
- **transactions** - Financial transactions
- **budgets** - Budget tracking

### Security
- Row Level Security (RLS) policies on all tables
- Users can only access their own data
- Automatic user_id assignment on insert

### Performance
- Indexes on foreign keys and frequently queried columns
- Automatic timestamp triggers (created_at, updated_at)

## Verification

After running migrations, verify the setup:

\`\`\`sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
\`\`\`

## Troubleshooting

If migrations fail:

1. **Permission errors**: Ensure you're using the service role key
2. **Table already exists**: Drop the table first or skip that migration
3. **Foreign key errors**: Ensure parent tables are created first
4. **RLS errors**: Check that auth.uid() is available

## Next Steps

After successful migration:
1. Test creating a user profile
2. Create sample data in each table
3. Verify RLS policies work correctly
4. Test the application features
