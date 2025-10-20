-- Seed Suffolk University classes
-- Replace these with your actual classes from Airtable

-- First, get the Suffolk University workstream ID
DO $$
DECLARE
  suffolk_id UUID;
BEGIN
  SELECT id INTO suffolk_id FROM workstreams WHERE name = 'Suffolk University' LIMIT 1;
  
  IF suffolk_id IS NOT NULL THEN
    -- Insert example classes - REPLACE THESE WITH YOUR ACTUAL CLASSES
    INSERT INTO classes (workstream_id, name, course_code, description, color) VALUES
      (suffolk_id, 'Introduction to Computer Science', 'CS101', 'Fundamentals of programming and computer science', '#3b82f6'),
      (suffolk_id, 'Data Structures', 'CS201', 'Advanced data structures and algorithms', '#8b5cf6'),
      (suffolk_id, 'Database Systems', 'CS301', 'Database design and SQL', '#10b981'),
      (suffolk_id, 'Web Development', 'CS350', 'Full-stack web development', '#f59e0b'),
      (suffolk_id, 'Business Analytics', 'BUS220', 'Data analysis for business decisions', '#ec4899')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
