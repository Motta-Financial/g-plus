# User Management & Authentication Guide

Your app now has comprehensive Supabase authentication and user management capabilities!

## Features Implemented

### 1. Authentication System
- **Sign Up**: `/auth/sign-up` - New user registration with email verification
- **Sign In**: `/auth/login` - Email/password authentication
- **Password Reset**: `/auth/forgot-password` - Request password reset
- **Reset Confirmation**: `/auth/reset-password` - Complete password reset

### 2. User Profile Management
- **Profile Page**: `/dashboard/profile` - View and edit personal information
  - Full name
  - Bio
  - Avatar URL
  - Account creation date
- **Real-time Updates**: Profile changes reflect immediately across the app

### 3. Account Settings
- **Account Page**: `/dashboard/account` - Manage account security
  - Change email address (with verification)
  - Change password
  - Delete account (danger zone)

### 4. User Interface Integration
- **Sidebar**: User dropdown menu with quick access to:
  - Profile
  - Account Settings
  - Sign Out
- **Avatar Display**: Shows user avatar throughout the app
- **Real-time Auth State**: Automatic updates when user signs in/out

## Environment Variables Required

Make sure these are set in your Vercel project (already configured):

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://lpfqfpkmmwbbhwtzaagl.supabase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000 (for development)
\`\`\`

## Database Setup

Run the migration script to create the user profiles table:

\`\`\`sql
-- Run scripts/009-create-user-profiles-table.sql in Supabase SQL Editor
\`\`\`

This creates:
- `user_profiles` table for extended user metadata
- Row Level Security (RLS) policies
- Automatic profile creation on user signup
- Trigger for updated_at timestamps

## User Flow

### New User Registration
1. User visits `/auth/sign-up`
2. Enters email and password
3. Receives verification email
4. Clicks verification link
5. Redirected to login page
6. Signs in and accesses dashboard
7. Profile automatically created in database

### Existing User Login
1. User visits `/auth/login`
2. Enters credentials
3. Redirected to dashboard
4. Session maintained via cookies

### Profile Management
1. User clicks avatar in sidebar
2. Selects "Profile" from dropdown
3. Updates name, bio, or avatar
4. Changes saved to Supabase user metadata
5. Updates reflect immediately in UI

### Password Reset
1. User clicks "Forgot password?" on login page
2. Enters email address
3. Receives reset email
4. Clicks reset link
5. Enters new password
6. Redirected to login page

## Security Features

### Row Level Security (RLS)
All user data is protected with RLS policies:
- Users can only view/edit their own data
- Automatic user_id filtering on all queries
- Enforced at database level

### Session Management
- HTTP-only cookies for session storage
- Automatic session refresh via middleware
- Secure token handling

### Password Requirements
- Minimum 6 characters
- Hashed and stored securely by Supabase
- Never exposed in client code

## Customization

### User Metadata
User metadata is stored in Supabase auth.users table:
\`\`\`typescript
user.user_metadata = {
  full_name: string
  bio: string
  avatar_url: string
}
\`\`\`

### Extended Profile Data
Additional user data can be stored in the `user_profiles` table:
\`\`\`sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  preferences JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
\`\`\`

## Next Steps

1. **Email Templates**: Customize email templates in Supabase dashboard
   - Go to: Authentication > Email Templates
   - Customize: Confirmation, Password Reset, Magic Link

2. **OAuth Providers**: Add social login (optional)
   - Google, GitHub, etc.
   - Configure in Supabase dashboard

3. **Two-Factor Authentication**: Enable 2FA (optional)
   - Requires additional setup in Supabase

4. **User Roles**: Implement role-based access control
   - Add roles to user_metadata
   - Create policies based on roles

## Troubleshooting

### Email Not Received
- Check spam folder
- Verify email settings in Supabase dashboard
- Check Supabase logs for delivery status

### Profile Not Updating
- Check browser console for errors
- Verify RLS policies are correct
- Ensure user is authenticated

### Session Expired
- User will be automatically redirected to login
- Sessions expire based on JWT expiration time
- Can be configured in Supabase dashboard

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [User Management Guide](https://supabase.com/docs/guides/auth/managing-user-data)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
