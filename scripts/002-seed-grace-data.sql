-- Seed initial data for Grace Cha
-- Note: This assumes Grace's user ID will be created through Supabase Auth
-- You'll need to replace the user_id with the actual UUID after authentication

-- Insert default workstreams for Grace
INSERT INTO workstreams (name, type, color, icon, description) VALUES
  ('Suffolk University', 'school', '#3b82f6', '🎓', 'Suffolk University coursework and assignments'),
  ('Motta Financial', 'work', '#10b981', '💼', 'Work tasks and projects at Motta Financial'),
  ('Life', 'life', '#f59e0b', '🏠', 'Personal tasks, chores, and life management'),
  ('Side Quests', 'side_quest', '#8b5cf6', '🚀', 'Extra curriculars, app building, and competitions')
ON CONFLICT DO NOTHING;

-- Note: Additional seed data will be added after user authentication is set up
