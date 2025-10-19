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
  canvas_assignment_id?: string
  external_id?: string
  external_source?: string
  created_at: string
  updated_at: string
  workstream?: Workstream
  project?: Project
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
