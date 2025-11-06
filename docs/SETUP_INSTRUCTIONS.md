# G+ Supabase Integration Setup

This guide will help you complete the setup of real-time updates, file attachments, and authentication for the G+ app.

## Prerequisites

- Supabase project created and connected
- Environment variables configured in Vercel/local .env

## Step 1: Enable Realtime in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/database/replication
2. Enable Realtime for these tables:
   - `tasks`
   - `canvas_assignments`
   - `calendar_events`
   - `workstreams`
   - `projects`
   - `classes`
   - `emails`
3. Click **Save**

## Step 2: Run Database Migrations

Run these SQL scripts in your Supabase SQL Editor in this exact order:

### Migration 1: Setup Storage Buckets
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
2. Copy and paste the contents of `scripts/001_setup_storage.sql`
3. Click **Run**
4. Verify buckets were created by checking the Storage section

### Migration 2: Create Attachment Tables
1. Copy and paste the contents of `scripts/002_create_attachment_table.sql`
2. Click **Run**
3. Verify tables were created: `task_attachments`, `canvas_assignment_attachments`, `finance_transaction_attachments`

### Migration 3: Add Performance Indexes
1. Copy and paste the contents of `scripts/003_add_indexes.sql`
2. Click **Run**
3. This will optimize database query performance

## Step 3: Verify Installation

### Test Real-time Updates
1. Open your app in two browser tabs
2. Create a task in one tab
3. Verify it appears instantly in the other tab without refresh

### Test File Uploads
1. Open a task
2. Go to the "Attachments" tab
3. Upload a file (drag & drop or click to browse)
4. Verify the file appears in the list
5. Try downloading and deleting the file

### Test Authentication
1. Sign out and sign back in
2. Refresh the page while logged in
3. Verify your session persists

## Features Enabled

### Real-time Updates
- Tasks update instantly across all devices
- Canvas assignments sync in real-time
- Calendar events update automatically
- No page refresh needed

### File Attachments
- Upload files to tasks (up to 50MB)
- Upload profile avatars (up to 5MB)
- Upload finance documents (up to 50MB)
- Drag & drop support
- Progress indicators
- File preview and download

### Centralized Authentication
- Consistent auth state across the app
- Automatic token refresh
- Session persistence
- Easy access via `useAuth()` hook

## Troubleshooting

### "Realtime not enabled"
- Make sure you enabled Realtime in the Supabase Dashboard (Step 1)
- Check that you enabled it for the correct tables

### "Permission denied on storage"
- Run migration `001_setup_storage.sql` to create storage buckets and RLS policies
- Verify the buckets exist in Supabase Dashboard > Storage

### Files not uploading
- Check that storage buckets exist: `task-attachments`, `profile-avatars`, `finance-documents`
- Verify RLS policies are correct (they should be created by the migration)
- Check browser console for specific error messages

### "Cannot read properties of undefined" (auth errors)
- Verify `AuthProvider` wraps your app in `app/layout.tsx`
- Check that you're using `useAuth()` inside a component that's a child of `AuthProvider`

### Real-time not working
- Check browser console for connection errors
- Verify Realtime is enabled in Supabase Dashboard
- Check that your Supabase URL and anon key are correct

## Usage Examples

### Using Real-time Tasks
\`\`\`tsx
import { useRealtimeTasks } from '@/hooks/useRealtimeTasks'

export function TaskBoard({ workstreamId }: { workstreamId: string }) {
  const { tasks, loading, error } = useRealtimeTasks({
    workstreamId,
    status: 'todo',
    enabled: true,
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
\`\`\`

### Using File Upload
\`\`\`tsx
import { FileUpload } from '@/components/storage/file-upload'

export function TaskAttachments({ taskId }: { taskId: string }) {
  return (
    <FileUpload
      bucket="task-attachments"
      taskId={taskId}
      onUploadComplete={(filePath, publicUrl) => {
        console.log('File uploaded:', filePath)
      }}
      accept="image/*,.pdf,.doc,.docx"
      maxSizeMB={50}
    />
  )
}
\`\`\`

### Using Authentication
\`\`\`tsx
import { useAuth } from '@/context/AuthContext'

export function UserProfile() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
\`\`\`

## Next Steps

1. Add file attachments to your task dialogs
2. Implement real-time updates in other components
3. Add file upload to Canvas assignments
4. Add file upload to finance transactions
5. Customize the real-time status indicator

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all migrations were run successfully
3. Check Supabase Dashboard for RLS policy errors
4. Review the troubleshooting section above
