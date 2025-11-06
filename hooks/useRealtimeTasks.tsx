// hooks/useRealtimeTasks.ts
// Specialized hook for real-time task updates

"use client"

import { useState, useCallback } from "react"
import { useRealtimeSubscription } from "./useRealtimeSubscription"
import type { Task } from "@/lib/types"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface UseRealtimeTasksOptions {
  workstreamId?: string
  projectId?: string
  classId?: string
  status?: string
  enabled?: boolean
}

export function useRealtimeTasks(options: UseRealtimeTasksOptions = {}) {
  const { workstreamId, projectId, classId, status, enabled = true } = options
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  // Build filter string for realtime subscription
  const buildFilter = () => {
    const filters: string[] = []
    if (workstreamId) filters.push(`workstream_id=eq.${workstreamId}`)
    if (projectId) filters.push(`project_id=eq.${projectId}`)
    if (classId) filters.push(`class_id=eq.${classId}`)
    if (status) filters.push(`status=eq.${status}`)
    return filters.length > 0 ? filters.join(",") : undefined
  }

  // Initial data fetch
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from("tasks")
        .select(`
          *,
          workstream:workstreams(*),
          project:projects(*),
          class:classes(*),
          linkedCanvasAssignment:canvas_assignments(*)
        `)
        .order("order_index", { ascending: true })

      // Apply filters
      if (workstreamId) query = query.eq("workstream_id", workstreamId)
      if (projectId) query = query.eq("project_id", projectId)
      if (classId) query = query.eq("class_id", classId)
      if (status) query = query.eq("status", status)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setTasks(data as Task[])
    } catch (err) {
      setError(err as Error)
      console.error("Error fetching tasks:", err)
    } finally {
      setLoading(false)
    }
  }, [workstreamId, projectId, classId, status])

  // Fetch initial data
  useState(() => {
    if (enabled) {
      fetchTasks()
    }
  })

  // Handle real-time inserts
  const handleInsert = useCallback((newTask: Task) => {
    setTasks((prev) => {
      // Check if task already exists (prevent duplicates)
      if (prev.some((t) => t.id === newTask.id)) {
        return prev
      }
      // Add new task at the end
      return [...prev, newTask]
    })
  }, [])

  // Handle real-time updates
  const handleUpdate = useCallback((updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }, [])

  // Handle real-time deletes
  const handleDelete = useCallback(({ id }: { id: string }) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  // Subscribe to real-time changes
  useRealtimeSubscription<Task>({
    table: "tasks",
    filter: buildFilter(),
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onError: setError,
    enabled,
  })

  // Refresh tasks manually
  const refresh = useCallback(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    refresh,
  }
}

// Usage example:
/*
'use client'

import { useRealtimeTasks } from '@/hooks/useRealtimeTasks'
import { TaskCard } from '@/components/dashboard/task-card'

export function TaskBoard({ workstreamId }: { workstreamId?: string }) {
  const { tasks, loading, error, refresh } = useRealtimeTasks({
    workstreamId,
    status: 'todo',
    enabled: true,
  })

  if (loading) return <div>Loading tasks...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2>Tasks ({tasks.length})</h2>
        <button onClick={refresh}>Refresh</button>
      </div>
      
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
*/
