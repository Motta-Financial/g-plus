-- Add class field to tasks table for Suffolk assignments
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS class TEXT;

-- Add index for class field
CREATE INDEX IF NOT EXISTS idx_tasks_class ON tasks(class);
