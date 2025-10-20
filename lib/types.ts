export type WorkstreamType = "school" | "work" | "life" | "side_quest"
export type TaskPriority = "big_rock" | "medium_rock" | "small_rock"
export type TaskStatus = "todo" | "in_progress" | "completed" | "blocked"

export interface Workstream {
  id: string
  user_id: string
  name: string
  type: WorkstreamType
  color: string
  icon?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  workstream_id: string
  name: string
  description?: string
  color?: string
  status: "active" | "completed" | "archived"
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  workstream_id: string
  project_id?: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  due_date?: string
  completed_at?: string
  order_index: number
  class?: string
  canvas_assignment_id?: string
  canvas_course_id?: string
  canvas_url?: string
  external_id?: string
  external_source?: string
  comments?: TaskComment[]
  created_at: string
  updated_at: string
  workstream?: Workstream
  project?: Project
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  workstream_id?: string
  task_id?: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  calendar_source?: "google" | "outlook" | "apple" | "canvas" | "manual"
  external_id?: string
  color?: string
  all_day: boolean
  created_at: string
  updated_at: string
  workstream?: Workstream
  task?: Task
}

export interface CanvasCourse {
  id: string
  name: string
  course_code: string
  enrollment_state?: string
  created_at: string
  updated_at: string
}

export interface CanvasAnnouncement {
  id: string
  course_id: string
  course_name?: string
  course_code?: string
  title: string
  message: string
  posted_at: string
  author?: {
    display_name: string
    avatar_image_url?: string
  }
  read_state?: "read" | "unread"
}

export interface TriageItem {
  id: string
  type: "announcement" | "assignment" | "event"
  canvas_id: string
  course_id: string
  course_code?: string
  course_name?: string
  title: string
  description?: string
  due_date?: string
  posted_at: string
  canvas_url?: string
  priority?: TaskPriority
  status: "pending" | "processed" | "dismissed"
  created_at: string
  updated_at: string
}

export interface CalendarConnection {
  id: string
  user_id: string
  provider: "google" | "outlook" | "apple"
  email: string
  access_token?: string
  refresh_token?: string
  expires_at?: string
  is_active: boolean
  last_synced_at?: string
  created_at: string
  updated_at: string
}
