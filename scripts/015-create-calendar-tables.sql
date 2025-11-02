-- Create calendar_connections table
CREATE TABLE IF NOT EXISTS public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple')),
  email TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider, email)
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workstream_id UUID REFERENCES public.workstreams(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  calendar_source TEXT CHECK (calendar_source IN ('google', 'outlook', 'apple', 'canvas', 'manual')),
  external_id TEXT,
  color TEXT,
  all_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_calendar_connections_user_id ON public.calendar_connections(user_id);
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_events_workstream_id ON public.calendar_events(workstream_id);
CREATE INDEX idx_calendar_events_task_id ON public.calendar_events(task_id);

-- Enable RLS
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_connections
CREATE POLICY "Users can view own calendar connections"
  ON public.calendar_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar connections"
  ON public.calendar_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar connections"
  ON public.calendar_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar connections"
  ON public.calendar_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for calendar_events
CREATE POLICY "Users can view own calendar events"
  ON public.calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
  ON public.calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
  ON public.calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_calendar_connections ON public.calendar_connections;
CREATE TRIGGER set_updated_at_calendar_connections
  BEFORE UPDATE ON public.calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_calendar_events ON public.calendar_events;
CREATE TRIGGER set_updated_at_calendar_events
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
