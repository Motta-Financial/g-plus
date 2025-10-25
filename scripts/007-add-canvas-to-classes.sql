-- Add Canvas course integration to classes table
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS canvas_course_id TEXT,
ADD COLUMN IF NOT EXISTS canvas_course_name TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_classes_canvas_course_id ON classes(canvas_course_id);

-- Update existing classes to match Canvas courses by course_code
-- This will auto-link classes that have matching course codes with Canvas courses
