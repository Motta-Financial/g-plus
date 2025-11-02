-- Add timeframe column to canvas_assignments table so users can manually choose which assignments to add to their week

-- Add timeframe column to canvas_assignments table
ALTER TABLE canvas_assignments
ADD COLUMN IF NOT EXISTS timeframe TEXT CHECK (timeframe IN ('this_week', 'next_week'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_timeframe ON canvas_assignments(timeframe);

-- Add comment to explain the column
COMMENT ON COLUMN canvas_assignments.timeframe IS 'User-selected timeframe for when to work on this assignment (this_week, next_week, or NULL for unscheduled)';
