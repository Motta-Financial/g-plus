-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workstream_id UUID NOT NULL REFERENCES public.workstreams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  course_code TEXT,
  description TEXT,
  color TEXT,
  instructor TEXT,
  canvas_course_id TEXT,
  canvas_course_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON public.classes(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_workstream_id ON public.classes(workstream_id);
CREATE INDEX IF NOT EXISTS idx_classes_canvas_course_id ON public.classes(canvas_course_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON public.classes(status);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own classes"
  ON public.classes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own classes"
  ON public.classes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own classes"
  ON public.classes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own classes"
  ON public.classes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_classes ON public.classes;
CREATE TRIGGER set_updated_at_classes
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
