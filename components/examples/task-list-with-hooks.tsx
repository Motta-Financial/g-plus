// Example component showing how to use the custom Supabase hooks
"use client"

import { useFetch, useInsert, useUpdate, useDelete } from "@/hooks/useSupabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Task {
  id: string
  title: string
  status: string
  user_id: string
}

export function TaskListWithHooks() {
  // Fetch tasks with real-time updates
  const {
    data: tasks,
    loading,
    error,
  } = useFetch<Task>("tasks", (query) => query.order("created_at", { ascending: false }).limit(10))

  // Hook for inserting new tasks
  const { insert, loading: inserting } = useInsert("tasks")

  // Hook for updating tasks
  const { update, loading: updating } = useUpdate("tasks")

  // Hook for deleting tasks
  const { deleteRecord, loading: deleting } = useDelete("tasks")

  const handleAddTask = async () => {
    await insert({
      title: "New Task",
      status: "todo",
    })
  }

  const handleToggleStatus = async (task: Task) => {
    await update(task.id, {
      status: task.status === "todo" ? "done" : "todo",
    })
  }

  const handleDeleteTask = async (taskId: string) => {
    await deleteRecord(taskId)
  }

  if (loading) return <div>Loading tasks...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
      <Button onClick={handleAddTask} disabled={inserting}>
        {inserting ? "Adding..." : "Add Task"}
      </Button>

      <div className="space-y-2">
        {tasks?.map((task) => (
          <Card key={task.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground">Status: {task.status}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleToggleStatus(task)} disabled={updating}>
                Toggle
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteTask(task.id)} disabled={deleting}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
