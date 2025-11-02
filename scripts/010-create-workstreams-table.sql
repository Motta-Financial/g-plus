-- Create workstreams table
CREATE TABLE IF NOT EXISTS public.workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('school', 'work', 'life', 'side_quest')),
  color TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workstreams_user_id ON public.workstreams(user_id);
CREATE INDEX IF NOT EXISTS idx_workstreams_type ON public.workstreams(type);

-- Enable RLS
ALTER TABLE public.workstreams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own workstreams"
  ON public.workstreams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workstreams"
  ON public.workstreams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workstreams"
  ON public.workstreams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workstreams"
  ON public.workstreams FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_workstreams ON public.workstreams;
CREATE TRIGGER set_updated_at_workstreams
  BEFORE UPDATE ON public.workstreams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
