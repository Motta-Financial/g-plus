-- Create canvas_assignments table
CREATE TABLE IF NOT EXISTS public.canvas_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canvas_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'announcement', 'event')),
  course_id TEXT NOT NULL,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')),
  urgency TEXT CHECK (urgency IN ('urgent', 'look_out', 'chill')),
  timeframe TEXT CHECK (timeframe IN ('this_week', 'next_week')),
  scheduled_time TIMESTAMPTZ,
  scheduled_end_time TIMESTAMPTZ,
  points_possible NUMERIC,
  submission_types TEXT[],
  canvas_url TEXT,
  posted_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, canvas_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_user_id ON public.canvas_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_class_id ON public.canvas_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_due_date ON public.canvas_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_timeframe ON public.canvas_assignments(timeframe);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_canvas_id ON public.canvas_assignments(canvas_id);

-- Enable RLS
ALTER TABLE public.canvas_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own assignments"
  ON public.canvas_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assignments"
  ON public.canvas_assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments"
  ON public.canvas_assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assignments"
  ON public.canvas_assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_canvas_assignments ON public.canvas_assignments;
CREATE TRIGGER set_updated_at_canvas_assignments
  BEFORE UPDATE ON public.canvas_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
