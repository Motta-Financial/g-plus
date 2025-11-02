-- Create email_accounts table
CREATE TABLE IF NOT EXISTS public.email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook', 'imap')),
  email_address TEXT NOT NULL,
  display_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, email_address)
);

-- Create emails table
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  workstream_id UUID REFERENCES public.workstreams(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  external_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT NOT NULL,
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[] DEFAULT '{}',
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  priority TEXT CHECK (priority IN ('big_rock', 'medium_rock', 'small_rock')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'dismissed', 'archived')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  has_attachments BOOLEAN NOT NULL DEFAULT false,
  labels TEXT[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email_account_id, external_id)
);

-- Create email_comments table
CREATE TABLE IF NOT EXISTS public.email_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_accounts_user_id ON public.email_accounts(user_id);
CREATE INDEX idx_emails_user_id ON public.emails(user_id);
CREATE INDEX idx_emails_email_account_id ON public.emails(email_account_id);
CREATE INDEX idx_emails_workstream_id ON public.emails(workstream_id);
CREATE INDEX idx_emails_status ON public.emails(status);
CREATE INDEX idx_emails_received_at ON public.emails(received_at);
CREATE INDEX idx_email_comments_email_id ON public.email_comments(email_id);

-- Enable RLS
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_accounts
CREATE POLICY "Users can view own email accounts"
  ON public.email_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email accounts"
  ON public.email_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email accounts"
  ON public.email_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email accounts"
  ON public.email_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for emails
CREATE POLICY "Users can view own emails"
  ON public.emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails"
  ON public.emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails"
  ON public.emails FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails"
  ON public.emails FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for email_comments
CREATE POLICY "Users can view comments on own emails"
  ON public.email_comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert comments on own emails"
  ON public.email_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.email_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.email_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_email_accounts ON public.email_accounts;
CREATE TRIGGER set_updated_at_email_accounts
  BEFORE UPDATE ON public.email_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_emails ON public.emails;
CREATE TRIGGER set_updated_at_emails
  BEFORE UPDATE ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_email_comments ON public.email_comments;
CREATE TRIGGER set_updated_at_email_comments
  BEFORE UPDATE ON public.email_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
