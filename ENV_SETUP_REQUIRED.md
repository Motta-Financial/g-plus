# Environment Variables Setup Required

## Critical Issue: Missing Environment Variables

Your app is experiencing login failures because the required Supabase environment variables are not configured in your production deployment.

## Required Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables):

### 1. NEXT_PUBLIC_SUPABASE_URL
\`\`\`
https://lpfqfpkmmwbbhwtzaagl.supabase.co
\`\`\`

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZnFmcGttbXdiYmh3dHphYWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODQxNDcsImV4cCI6MjA3NjQ2MDE0N30.TPXQ7SXKqBYP974vTDJhfaOUfKh9osvRBNOCVjEd0rE
\`\`\`

### 3. SUPABASE_SERVICE_ROLE_KEY (for server-side operations)
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZnFmcGttbXdiYmh3dHphYWdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4NDE0NywiZXhwIjoyMDc2NDYwMTQ3fQ.xigeYrXOOa1Jxuq6pykM8tziVl4cte9QFJ8twSVJwIo
\`\`\`

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable:
   - Variable name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://lpfqfpkmmwbbhwtzaagl.supabase.co`
   - Environment: Select "Production", "Preview", and "Development"
   - Click "Save"
5. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
6. Redeploy your application

## Alternative: Use v0 Vars Section

You can also add these variables in the v0 interface:
1. Click "Vars" in the left sidebar of v0
2. Add each environment variable
3. The variables will automatically sync to your Vercel deployment

## After Adding Variables

Once you've added the environment variables:
1. Redeploy your application (or wait for automatic redeployment)
2. Clear your browser cache
3. Try logging in again

The "Failed to fetch" error should be resolved once these variables are properly configured.
