import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Workstream,
  Task,
  CalendarEvent,
  CanvasCourse,
  TriageItem,
  TaskPriority,
  CalendarConnection,
  Project,
} from "./types"

interface AppState {
  workstreams: Workstream[]
  projects: Project[]
  tasks: Task[]
  events: CalendarEvent[]
  courses: CanvasCourse[]
  triageItems: TriageItem[]
  calendarConnections: CalendarConnection[]
  settings: {
    theme: "light" | "dark" | "auto"
    primaryColor: string
    secondaryColor: string
    accentColor: string
    canvasApiToken?: string
    canvasBaseUrl?: string
    googleCalendarClientId?: string
    googleCalendarClientSecret?: string
    outlookClientId?: string
    outlookClientSecret?: string
  }
  addWorkstream: (workstream: Omit<Workstream, "id" | "created_at" | "updated_at">) => void
  updateWorkstream: (id: string, updates: Partial<Workstream>) => void
  deleteWorkstream: (id: string) => void
  addProject: (project: Omit<Project, "id" | "created_at" | "updated_at">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  addTask: (task: Omit<Task, "id" | "created_at" | "updated_at">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addTaskComment: (taskId: string, content: string) => void
  addEvent: (event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">) => void
  updateSettings: (settings: Partial<AppState["settings"]>) => void
  setCourses: (courses: CanvasCourse[]) => void
  addTriageItem: (item: Omit<TriageItem, "id" | "created_at" | "updated_at">) => void
  updateTriageItem: (id: string, updates: Partial<TriageItem>) => void
  deleteTriageItem: (id: string) => void
  setTriageItems: (items: TriageItem[]) => void
  processTriageItem: (triageItemId: string, priority: TaskPriority) => void
  addCalendarConnection: (connection: Omit<CalendarConnection, "id" | "created_at" | "updated_at">) => void
  updateCalendarConnection: (id: string, updates: Partial<CalendarConnection>) => void
  deleteCalendarConnection: (id: string) => void
  setCalendarConnections: (connections: CalendarConnection[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workstreams: [
        {
          id: "1",
          user_id: "grace",
          name: "Suffolk University",
          type: "school",
          color: "#6366f1",
          icon: "🎓",
          description: "School workstream for Suffolk University",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          user_id: "grace",
          name: "Motta Financial",
          type: "work",
          color: "#10b981",
          icon: "💼",
          description: "Work at Motta Financial",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "3",
          user_id: "grace",
          name: "Life",
          type: "life",
          color: "#f59e0b",
          icon: "🏠",
          description: "Personal life tasks and chores",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "4",
          user_id: "grace",
          name: "Side Quests",
          type: "side_quest",
          color: "#ec4899",
          icon: "🚀",
          description: "Extra curriculars and side projects",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      projects: [],
      tasks: [
        // Suffolk University (SCHOOL) tasks
        {
          id: "task-1",
          user_id: "grace",
          workstream_id: "1",
          title: "EXAM 1",
          description: "Online exam - Multiple Choice in class, 3 essays",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-02T00:00:00.000Z",
          order_index: 0,
          canvas_assignment_id: "14239",
          canvas_course_id: "ISOM-230",
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-2",
          user_id: "grace",
          workstream_id: "1",
          title: "EXAM 1",
          description: "Multiple Choice in class, 3 essays",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-06T00:00:00.000Z",
          order_index: 1,
          canvas_assignment_id: "14519",
          canvas_course_id: "ISOM-230",
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-3",
          user_id: "grace",
          workstream_id: "1",
          title: "SQL Assignment",
          description: "",
          status: "todo",
          priority: "medium_rock",
          due_date: "2025-10-01T00:00:00.000Z",
          order_index: 2,
          canvas_assignment_id: "14845",
          canvas_course_id: "ISOM-230",
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-4",
          user_id: "grace",
          workstream_id: "1",
          title: "ESSAY",
          description: "",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 3,
          canvas_assignment_id: "14880",
          canvas_course_id: "ISOM-230",
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // Motta Financial (MOTTA) tasks
        {
          id: "task-5",
          user_id: "grace",
          workstream_id: "2",
          title: "Zapier: Karbon -> Airtable",
          description: "14 oz of weed!",
          status: "in_progress",
          priority: "big_rock",
          due_date: "2025-10-06T00:00:00.000Z",
          order_index: 4,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-6",
          user_id: "grace",
          workstream_id: "2",
          title: "Zapier: Ignition -> Airtable",
          description: "$1500!!",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 5,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-7",
          user_id: "grace",
          workstream_id: "2",
          title: "Corey Howe tax prep",
          description: "Waiting on Sched E",
          status: "completed",
          priority: "small_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 6,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-8",
          user_id: "grace",
          workstream_id: "2",
          title: "Victoria Manton tax prep",
          description: "2021, 2022, 2023",
          status: "in_progress",
          priority: "small_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 7,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-9",
          user_id: "grace",
          workstream_id: "2",
          title: "Xia, Le 2024 Tax Prep",
          description: "",
          status: "completed",
          priority: "small_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 8,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-10",
          user_id: "grace",
          workstream_id: "2",
          title: "Kara Gibler 2024 Tax Prep",
          description: "Rollforward 2023 return, input new info",
          status: "completed",
          priority: "medium_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 9,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-11",
          user_id: "grace",
          workstream_id: "2",
          title: "Clay Cornette 2024 tax prep",
          description: "",
          status: "completed",
          priority: "medium_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 10,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-12",
          user_id: "grace",
          workstream_id: "2",
          title: "Workforce Housing (990) Tax Prep",
          description: "- Need amounts contributed to each program",
          status: "in_progress",
          priority: "small_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 11,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-13",
          user_id: "grace",
          workstream_id: "2",
          title: "Gavan Jason W-4",
          description: "",
          status: "completed",
          priority: "medium_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 12,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-14",
          user_id: "grace",
          workstream_id: "2",
          title: "Make PPT for Dat BAP",
          description: "",
          status: "todo",
          priority: "medium_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 13,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-15",
          user_id: "grace",
          workstream_id: "2",
          title: "DJ, Carly Roberts Tax prep",
          description: "- done with photography, need to schedule time with caroline",
          status: "completed",
          priority: "big_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 14,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-16",
          user_id: "grace",
          workstream_id: "2",
          title: "Paul Mccarthy Pricing Sheet?",
          description: "schedule time with caroline",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 15,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-17",
          user_id: "grace",
          workstream_id: "2",
          title: "Create automation for proposal creation",
          description: "$1,500 on the line.",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 16,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-18",
          user_id: "grace",
          workstream_id: "2",
          title: "Edit and make better tommy awards form",
          description: "",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 17,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-19",
          user_id: "grace",
          workstream_id: "2",
          title: "Kara Gibler Tax Prep (2023 & 2024)",
          description: "",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-08T00:00:00.000Z",
          order_index: 18,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // Life tasks
        {
          id: "task-20",
          user_id: "grace",
          workstream_id: "3",
          title: "MEET THE FIRMS",
          description: "Sargent",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-07T00:00:00.000Z",
          order_index: 19,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-21",
          user_id: "grace",
          workstream_id: "3",
          title: "Print Resume for MTF",
          description: "",
          status: "completed",
          priority: "medium_rock",
          due_date: "2025-10-07T00:00:00.000Z",
          order_index: 20,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-22",
          user_id: "grace",
          workstream_id: "3",
          title: "Laundry",
          description: "",
          status: "completed",
          priority: "small_rock",
          due_date: "2025-10-07T00:00:00.000Z",
          order_index: 21,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // Side Quests tasks
        {
          id: "task-23",
          user_id: "grace",
          workstream_id: "4",
          title: "AI Pitch Competition",
          description: "1. outline pitch presentation",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-07T00:00:00.000Z",
          order_index: 22,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-24",
          user_id: "grace",
          workstream_id: "4",
          title: "SEED SHIN",
          description: "seed prospect interviews database, Replace MJ",
          status: "todo",
          priority: "big_rock",
          due_date: "2025-10-07T00:00:00.000Z",
          order_index: 23,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-25",
          user_id: "grace",
          workstream_id: "4",
          title: "Develop G+",
          description: "",
          status: "in_progress",
          priority: "medium_rock",
          due_date: "2025-10-06T00:00:00.000Z",
          order_index: 24,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-26",
          user_id: "grace",
          workstream_id: "4",
          title: "Learn n8n",
          description: "",
          status: "completed",
          priority: "medium_rock",
          due_date: "2025-10-13T00:00:00.000Z",
          order_index: 25,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "task-27",
          user_id: "grace",
          workstream_id: "4",
          title: "Canvas -> Airtable",
          description: "",
          status: "in_progress",
          priority: "big_rock",
          due_date: "2025-10-07T00:00:00.000Z",
          order_index: 26,
          comments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      events: [
        {
          id: "event-1",
          user_id: "grace",
          workstream_id: "3",
          title: "Notre Dame Interview",
          description: "LIFE - INTERVIEW",
          start_time: "2025-10-07T10:00:00.000Z",
          end_time: "2025-10-07T11:00:00.000Z",
          location: "Notre Dame",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "event-2",
          user_id: "grace",
          workstream_id: "2",
          title: "Special Teams: Zapier Karbon",
          description: "MOTTA Special Teams - Half an oz.",
          start_time: "2025-10-07T00:00:00.000Z",
          end_time: "2025-10-07T23:59:59.000Z",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "event-3",
          user_id: "grace",
          workstream_id: "1",
          title: "EXAM",
          description: "ISOM-230 - Multiple Choice, 3 essays, Essays due by 10/13",
          start_time: "2025-10-08T15:30:00.000Z",
          end_time: "2025-10-08T17:00:00.000Z",
          canvas_assignment_id: "14239",
          canvas_course_id: "ISOM-230",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "event-4",
          user_id: "grace",
          workstream_id: "1",
          title: "ESSAY",
          description: "ISOM-230 - ASSIGNMENT",
          start_time: "2025-10-08T00:00:00.000Z",
          end_time: "2025-10-08T23:59:59.000Z",
          canvas_assignment_id: "14880",
          canvas_course_id: "ISOM-230",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      courses: [
        {
          id: "14239",
          name: "Information Systems Management",
          course_code: "ISOM-230",
          enrollment_state: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "14519",
          name: "Small Business Strategy",
          course_code: "SBS-400",
          enrollment_state: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "14845",
          name: "Business Law & Ethics",
          course_code: "BLE-214",
          enrollment_state: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "14880",
          name: "Intermediate Accounting I",
          course_code: "ACCT-431",
          enrollment_state: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "14890",
          name: "Cost Accounting",
          course_code: "ACCT-320",
          enrollment_state: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      triageItems: [],
      calendarConnections: [],
      settings: {
        theme: "light",
        primaryColor: "#6366f1",
        secondaryColor: "#8b5cf6",
        accentColor: "#ec4899",
        canvasBaseUrl: "https://canvas.suffolk.edu",
      },
      addWorkstream: (workstream) =>
        set((state) => ({
          workstreams: [
            ...state.workstreams,
            {
              ...workstream,
              id: Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })),
      updateWorkstream: (id, updates) =>
        set((state) => ({
          workstreams: state.workstreams.map((w) =>
            w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w,
          ),
        })),
      deleteWorkstream: (id) =>
        set((state) => ({
          workstreams: state.workstreams.filter((w) => w.id !== id),
          projects: state.projects.filter((p) => p.workstream_id !== id),
          tasks: state.tasks.filter((t) => t.workstream_id !== id),
        })),
      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id: Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p,
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.map((t) => (t.project_id === id ? { ...t, project_id: undefined } : t)),
        })),
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: Math.random().toString(36).substr(2, 9),
              comments: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      addTaskComment: (taskId, content) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  comments: [
                    ...(t.comments || []),
                    {
                      id: Math.random().toString(36).substr(2, 9),
                      task_id: taskId,
                      user_id: "grace",
                      content,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                  ],
                  updated_at: new Date().toISOString(),
                }
              : t,
          ),
        })),
      addEvent: (event) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              ...event,
              id: Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })),
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      setCourses: (courses) =>
        set(() => ({
          courses,
        })),
      addTriageItem: (item) =>
        set((state) => ({
          triageItems: [
            ...state.triageItems,
            {
              ...item,
              id: Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })),
      updateTriageItem: (id, updates) =>
        set((state) => ({
          triageItems: state.triageItems.map((item) =>
            item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item,
          ),
        })),
      deleteTriageItem: (id) =>
        set((state) => ({
          triageItems: state.triageItems.filter((item) => item.id !== id),
        })),
      setTriageItems: (items) =>
        set(() => ({
          triageItems: items,
        })),
      processTriageItem: (triageItemId, priority) =>
        set((state) => {
          const triageItem = state.triageItems.find((item) => item.id === triageItemId)
          if (!triageItem) return state

          const suffolkWorkstream = state.workstreams.find((ws) => ws.type === "school")
          if (!suffolkWorkstream) return state

          const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            user_id: "grace",
            workstream_id: suffolkWorkstream.id,
            title: triageItem.title,
            description: triageItem.description,
            priority,
            status: "todo",
            due_date: triageItem.due_date,
            canvas_assignment_id: triageItem.canvas_id,
            canvas_course_id: triageItem.course_id,
            canvas_url: triageItem.canvas_url,
            order_index: state.tasks.length,
            comments: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          return {
            tasks: [...state.tasks, newTask],
            triageItems: state.triageItems.map((item) =>
              item.id === triageItemId
                ? { ...item, status: "processed" as const, updated_at: new Date().toISOString() }
                : item,
            ),
          }
        }),
      addCalendarConnection: (connection) =>
        set((state) => ({
          calendarConnections: [
            ...state.calendarConnections,
            {
              ...connection,
              id: Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })),
      updateCalendarConnection: (id, updates) =>
        set((state) => ({
          calendarConnections: state.calendarConnections.map((conn) =>
            conn.id === id ? { ...conn, ...updates, updated_at: new Date().toISOString() } : conn,
          ),
        })),
      deleteCalendarConnection: (id) =>
        set((state) => ({
          calendarConnections: state.calendarConnections.filter((conn) => conn.id !== id),
        })),
      setCalendarConnections: (connections) =>
        set(() => ({
          calendarConnections: connections,
        })),
    }),
    {
      name: "grace-pm-storage",
    },
  ),
)
