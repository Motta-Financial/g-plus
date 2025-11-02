-- Common Queries for G+ Application

-- ============================================
-- TASK QUERIES
-- ============================================

-- Get all tasks for current user with related data
CREATE OR REPLACE FUNCTION get_user_tasks(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  priority TEXT,
  urgency TEXT,
  status TEXT,
  timeframe TEXT,
  due_date TIMESTAMPTZ,
  workstream_name TEXT,
  project_name TEXT,
  class_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.priority,
    t.urgency,
    t.status,
    t.timeframe,
    t.due_date,
    w.name as workstream_name,
    p.name as project_name,
    c.name as class_name
  FROM public.tasks t
  LEFT JOIN public.workstreams w ON t.workstream_id = w.id
  LEFT JOIN public.projects p ON t.project_id = p.id
  LEFT JOIN public.classes c ON t.class_id = c.id
  WHERE t.user_id = p_user_id
  ORDER BY 
    CASE t.urgency
      WHEN 'urgent' THEN 1
      WHEN 'look_out' THEN 2
      WHEN 'chill' THEN 3
    END,
    t.due_date NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get tasks by timeframe
CREATE OR REPLACE FUNCTION get_tasks_by_timeframe(p_user_id UUID, p_timeframe TEXT)
RETURNS SETOF public.tasks AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.tasks
  WHERE user_id = p_user_id 
    AND timeframe = p_timeframe
    AND status != 'completed'
  ORDER BY 
    CASE urgency
      WHEN 'urgent' THEN 1
      WHEN 'look_out' THEN 2
      WHEN 'chill' THEN 3
    END,
    due_date NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CANVAS ASSIGNMENT QUERIES
-- ============================================

-- Get unscheduled Canvas assignments
CREATE OR REPLACE FUNCTION get_unscheduled_assignments(p_user_id UUID)
RETURNS SETOF public.canvas_assignments AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.canvas_assignments
  WHERE user_id = p_user_id 
    AND timeframe IS NULL
    AND due_date >= NOW()
  ORDER BY due_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Link Canvas assignment to class
CREATE OR REPLACE FUNCTION link_assignment_to_class(
  p_assignment_id UUID,
  p_class_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE public.canvas_assignments
  SET class_id = p_class_id
  WHERE id = p_assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CALENDAR QUERIES
-- ============================================

-- Get calendar events for date range
CREATE OR REPLACE FUNCTION get_calendar_events(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  workstream_name TEXT,
  task_title TEXT,
  calendar_source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.id,
    ce.title,
    ce.start_time,
    ce.end_time,
    w.name as workstream_name,
    t.title as task_title,
    ce.calendar_source
  FROM public.calendar_events ce
  LEFT JOIN public.workstreams w ON ce.workstream_id = w.id
  LEFT JOIN public.tasks t ON ce.task_id = t.id
  WHERE ce.user_id = p_user_id
    AND ce.start_time >= p_start_date
    AND ce.start_time <= p_end_date
  ORDER BY ce.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- EMAIL QUERIES
-- ============================================

-- Get pending emails for triage
CREATE OR REPLACE FUNCTION get_pending_emails(p_user_id UUID)
RETURNS SETOF public.emails AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.emails
  WHERE user_id = p_user_id 
    AND status = 'pending'
  ORDER BY received_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FINANCE QUERIES
-- ============================================

-- Get spending by category for date range
CREATE OR REPLACE FUNCTION get_spending_by_category(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  category TEXT,
  total_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.category,
    SUM(t.amount) as total_amount
  FROM public.transactions t
  WHERE t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.date >= p_start_date
    AND t.date <= p_end_date
  GROUP BY t.category
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get account balances summary
CREATE OR REPLACE FUNCTION get_account_summary(p_user_id UUID)
RETURNS TABLE (
  total_checking NUMERIC,
  total_savings NUMERIC,
  total_credit NUMERIC,
  net_worth NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'checking' THEN balance ELSE 0 END), 0) as total_checking,
    COALESCE(SUM(CASE WHEN type = 'savings' THEN balance ELSE 0 END), 0) as total_savings,
    COALESCE(SUM(CASE WHEN type = 'credit' THEN balance ELSE 0 END), 0) as total_credit,
    COALESCE(SUM(CASE WHEN type IN ('checking', 'savings') THEN balance ELSE -balance END), 0) as net_worth
  FROM public.accounts
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DASHBOARD QUERIES
-- ============================================

-- Get dashboard summary
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id UUID)
RETURNS TABLE (
  total_tasks INTEGER,
  urgent_tasks INTEGER,
  completed_today INTEGER,
  upcoming_events INTEGER,
  pending_emails INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE user_id = p_user_id AND status != 'completed'),
    (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE user_id = p_user_id AND urgency = 'urgent' AND status != 'completed'),
    (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE user_id = p_user_id AND DATE(completed_at) = CURRENT_DATE),
    (SELECT COUNT(*)::INTEGER FROM public.calendar_events WHERE user_id = p_user_id AND start_time >= NOW() AND start_time < NOW() + INTERVAL '7 days'),
    (SELECT COUNT(*)::INTEGER FROM public.emails WHERE user_id = p_user_id AND status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
