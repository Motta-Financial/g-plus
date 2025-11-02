# Supabase Authentication Setup Guide

Your G+ app now has complete authentication functionality with Supabase. This guide will help you configure everything properly.

## ✅ What's Already Implemented

1. **Sign Up** - `/auth/sign-up`
   - Email and password registration
   - Password confirmation
   - Email verification flow
   - Automatic redirect after confirmation

2. **Sign In** - `/auth/login`
   - Email and password login
   - Error handling
   - Automatic redirect to dashboard

3. **Password Reset** - `/auth/forgot-password` and `/auth/reset-password`
   - Request password reset via email
   - Secure password update flow
   - Session validation

4. **Protected Routes**
   - Middleware automatically protects `/dashboard/*` routes
   - Redirects unauthenticated users to login
   - Session refresh on every request

5. **User Management**
   - User info display in sidebar
   - Sign out functionality
   - Session persistence

## 🔧 Required Configuration

### 1. Add Missing Environment Variable

Add this to your environment variables in the **Vars** section:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://lpfqfpkmmwbbhwtzaagl.supabase.com
\`\`\`

### 2. Configure Email Templates in Supabase

Go to your Supabase dashboard:
https://supabase.com/dashboard/project/lpfqfpkmmwbbhwtzaagl/auth/templates

#### Email Confirmation Template
- **Subject**: Confirm your email for G+
- **Body**: Include the confirmation link with `{{ .ConfirmationURL }}`

#### Password Reset Template
- **Subject**: Reset your password for G+
- **Body**: Include the reset link with `{{ .ConfirmationURL }}`

### 3. Configure Auth Settings

Go to: https://supabase.com/dashboard/project/lpfqfpkmmwbbhwtzaagl/auth/url-configuration

Set these URLs:

**Site URL**: 
- Development: `http://localhost:3000`
- Production: Your deployed URL (e.g., `https://your-app.vercel.app`)

**Redirect URLs** (add both):
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/auth/reset-password`
- Your production URLs

### 4. Email Provider Configuration

By default, Supabase uses their email service (limited to 3 emails per hour in development).

For production, configure a custom SMTP provider:
https://supabase.com/dashboard/project/lpfqfpkmmwbbhwtzaagl/settings/auth

Recommended providers:
- **SendGrid** (free tier: 100 emails/day)
- **Resend** (free tier: 100 emails/day)
- **AWS SES** (pay as you go)

## 🧪 Testing the Auth Flow

### Test Sign Up
1. Go to `/auth/sign-up`
2. Enter email and password
3. Check your email for confirmation link
4. Click the link to verify your account
5. You'll be redirected to the dashboard

### Test Sign In
1. Go to `/auth/login`
2. Enter your verified email and password
3. Click "Login"
4. You'll be redirected to the dashboard

### Test Password Reset
1. Go to `/auth/login`
2. Click "Forgot password?"
3. Enter your email
4. Check your email for reset link
5. Click the link and enter new password
6. Sign in with new password

### Test Protected Routes
1. Sign out from the dashboard
2. Try to access `/dashboard` directly
3. You should be redirected to `/auth/login`

## 🔒 Security Features

- **Password Requirements**: Minimum 6 characters (configurable in Supabase)
- **Email Verification**: Users must verify email before accessing protected routes
- **Session Management**: Automatic token refresh via middleware
- **Row Level Security**: Database policies protect user data
- **Secure Password Reset**: Time-limited reset tokens

## 📊 User Management

View and manage users:
https://supabase.com/dashboard/project/lpfqfpkmmwbbhwtzaagl/auth/users

You can:
- View all registered users
- Manually verify emails
- Delete users
- Reset passwords
- View user metadata

## 🚀 Next Steps

1. **Add the missing environment variable** (`NEXT_PUBLIC_SUPABASE_URL`)
2. **Configure email templates** in Supabase dashboard
3. **Set up redirect URLs** for your production domain
4. **Test the complete auth flow** in development
5. **Configure custom SMTP** for production email sending
6. **Enable additional auth providers** (Google, GitHub, etc.) if needed

## 🆘 Troubleshooting

### "Invalid login credentials"
- Check that the user has verified their email
- Verify the password is correct
- Check Supabase logs for detailed error

### Email not received
- Check spam folder
- Verify email provider is configured
- Check Supabase email rate limits (3/hour in development)

### Redirect not working
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- Check redirect URLs in Supabase dashboard
- Ensure `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is set for development

### Session not persisting
- Check that middleware is running
- Verify cookies are enabled in browser
- Check browser console for errors

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
