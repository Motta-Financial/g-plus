-- This script seeds demo data for testing without authentication
-- Note: In production, data should be created through the app after user authentication

-- For demo purposes only: Insert a test user
-- In production, users are created through Supabase Auth
INSERT INTO users (id, email, full_name, theme_color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User', '#6366f1')
ON CONFLICT (id) DO NOTHING;

-- Insert default workstreams
INSERT INTO workstreams (id, user_id, name, type, color, icon, description) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Suffolk University', 'school', '#6366f1', '🎓', 'Suffolk University coursework and assignments'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Motta Financial', 'work', '#10b981', '💼', 'Work tasks and projects at Motta Financial'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Life', 'life', '#f59e0b', '🏠', 'Personal tasks, chores, and life management'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Side Quests', 'side_quest', '#ec4899', '🚀', 'Extra curriculars, app building, and competitions')
ON CONFLICT (id) DO NOTHING;
