# Authentication System Testing Checklist

## Environment Setup ✓

### Required Environment Variables
- [x] `NEXT_PUBLIC_SUPABASE_URL` - https://lpfqfpkmmwbbhwtzaagl.supabase.com
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Configured
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Configured (for admin operations)
- [x] `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Configured for development

### Supabase Configuration
- [ ] Email authentication enabled in Supabase dashboard
- [ ] Email templates configured (Sign up, Password reset, Email change)
- [ ] Site URL configured in Supabase dashboard
- [ ] Redirect URLs configured in Supabase dashboard

## Authentication Flows

### 1. Sign Up Flow
**Test Steps:**
1. Navigate to `/auth/sign-up`
2. Enter email and password (min 6 characters)
3. Confirm password matches
4. Click "Sign up"
5. Should redirect to `/auth/sign-up-success`
6. Check email for confirmation link
7. Click confirmation link
8. Should redirect to `/dashboard`

**Expected Behavior:**
- Form validation works (password length, matching passwords)
- Loading state shows during submission
- Error messages display for invalid inputs
- Success page shows after signup
- Email confirmation sent

**Common Issues:**
- Email not received → Check Supabase email settings
- Redirect fails → Check `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`
- "User already exists" → Email already registered

### 2. Sign In Flow
**Test Steps:**
1. Navigate to `/auth/login`
2. Enter registered email and password
3. Click "Login"
4. Should redirect to `/dashboard`

**Expected Behavior:**
- Form validation works
- Loading state shows during submission
- Error messages display for invalid credentials
- Successful login redirects to dashboard
- Session persists across page refreshes

**Common Issues:**
- "Invalid credentials" → Check email/password
- Redirect fails → Check middleware configuration
- Session not persisting → Check cookie settings

### 3. Password Reset Flow
**Test Steps:**
1. Navigate to `/auth/login`
2. Click "Forgot password?"
3. Enter registered email
4. Click "Send Reset Link"
5. Check email for reset link
6. Click reset link
7. Should redirect to `/auth/reset-password`
8. Enter new password
9. Confirm new password
10. Click "Reset Password"
11. Should redirect to `/dashboard`

**Expected Behavior:**
- Reset email sent successfully
- Reset link works and redirects correctly
- New password is validated
- Password successfully updated
- Can login with new password

**Common Issues:**
- Email not received → Check Supabase email settings
- Reset link expired → Links expire after 1 hour
- Redirect fails → Check URL configuration

### 4. Sign Out Flow
**Test Steps:**
1. While logged in, click user dropdown in sidebar
2. Click "Sign out"
3. Should redirect to `/auth/login`
4. Try accessing `/dashboard` directly
5. Should redirect back to `/auth/login`

**Expected Behavior:**
- Session cleared successfully
- Redirects to login page
- Protected routes inaccessible
- Can sign in again

### 5. Profile Management
**Test Steps:**
1. Navigate to `/dashboard/profile`
2. Update full name
3. Update bio
4. Update avatar URL
5. Click "Save Changes"
6. Refresh page
7. Changes should persist

**Expected Behavior:**
- Form fields populate with current data
- Changes save successfully
- Toast notification shows success
- Data persists after refresh

### 6. Account Settings
**Test Steps:**
1. Navigate to `/dashboard/account`
2. Test email change:
   - Enter new email
   - Click "Update Email"
   - Check both old and new email for confirmation
3. Test password change:
   - Enter new password
   - Confirm new password
   - Click "Update Password"
   - Sign out and sign in with new password

**Expected Behavior:**
- Email change requires confirmation from both emails
- Password change works immediately
- Toast notifications show success/errors
- Can login with new credentials

## Middleware & Route Protection

### Protected Routes
- `/dashboard/*` - All dashboard routes require authentication
- `/auth/*` - Auth routes redirect to dashboard if already logged in

**Test Steps:**
1. Sign out completely
2. Try accessing `/dashboard` directly
3. Should redirect to `/auth/login`
4. Sign in
5. Try accessing `/auth/login` directly
6. Should redirect to `/dashboard`

**Expected Behavior:**
- Unauthenticated users redirected to login
- Authenticated users redirected away from auth pages
- Session refreshed automatically by middleware

## Database Integration

### User Profiles Table
**Check:**
- [ ] `user_profiles` table exists in Supabase
- [ ] RLS policies enabled
- [ ] Trigger creates profile on signup
- [ ] Profile data syncs with auth metadata

**Test Steps:**
1. Sign up new user
2. Check Supabase dashboard → Table Editor → user_profiles
3. Should see new profile row
4. Update profile in app
5. Check database for updates

## Common Issues & Solutions

### Issue: CSS Error "@utility s is empty"
**Status:** Known issue with Tailwind CSS v4 in development
**Impact:** Visual only, doesn't affect functionality
**Solution:** Can be safely ignored, or update globals.css

### Issue: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"
**Solution:** Add environment variable in Vars section

### Issue: Middleware not protecting routes
**Check:**
- middleware.ts exists in root
- lib/supabase/middleware.ts exists
- Environment variables are set
- Supabase client configured correctly

### Issue: Email not sending
**Check:**
- Supabase email settings enabled
- Email templates configured
- SMTP settings (if custom)
- Check spam folder

### Issue: Session not persisting
**Check:**
- Cookies enabled in browser
- Middleware refreshing session
- Supabase client configured with cookies

## Performance Checks

- [ ] Auth pages load quickly
- [ ] No console errors (except CSS warning)
- [ ] Smooth transitions between pages
- [ ] Loading states show appropriately
- [ ] Error messages clear and helpful

## Security Checks

- [ ] Passwords hashed (handled by Supabase)
- [ ] RLS policies protect user data
- [ ] Service role key only used server-side
- [ ] HTTPS enforced (in production)
- [ ] Session tokens secure
- [ ] CORS configured correctly

## Next Steps

1. **Configure Supabase Email Settings:**
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Customize email templates
   - Set up custom SMTP (optional)

2. **Add NEXT_PUBLIC_SUPABASE_URL:**
   - Go to Vars section in v0
   - Add: `NEXT_PUBLIC_SUPABASE_URL=https://lpfqfpkmmwbbhwtzaagl.supabase.com`

3. **Run Database Migrations:**
   - Execute `scripts/009-create-user-profiles-table.sql` in Supabase SQL Editor
   - Verify RLS policies are active

4. **Test All Flows:**
   - Go through each test case above
   - Document any issues
   - Fix and retest

## Debug Mode

To enable detailed logging, look for console.log statements with `[v0]` prefix:
- `[v0] Error loading user profile:` - Profile loading issues
- `[v0] Error saving profile:` - Profile save issues
- `[v0] Error changing password:` - Password change issues
- `[v0] Error deleting account:` - Account deletion issues

These logs will help identify specific issues in the authentication flow.
