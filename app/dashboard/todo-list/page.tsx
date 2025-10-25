"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TaskDialog } from "@/components/dashboard/task-dialog"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Plus, Circle, CheckCircle2, Clock, GripVertical } from "lucide-react"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

export default function TodoListPage() {
  const workstreams = useAppStore((state) => state.workstreams)
  const tasks = useAppStore((state) => state.tasks)
  const classes = useAppStore((state) => state.classes)
  const updateTask = useAppStore((state) => state.updateTask)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const activeTasks = tasks.filter((t) => t.status !== "completed")

  const tasksByWorkstream = useMemo(() => {
    const grouped = workstreams
      .map((workstream) => {
        const workstreamTasks = activeTasks.filter((t) => t.workstream_id === workstream.id)

        // Group by priority within this workstream
        const bigRocks = workstreamTasks.filter((t) => t.priority === "big_rock")
        const mediumRocks = workstreamTasks.filter((t) => t.priority === "medium_rock")
        const smallRocks = workstreamTasks.filter((t) => t.priority === "small_rock")
        const noPriority = workstreamTasks.filter((t) => !t.priority)

        return {
          workstream,
          priorityGroups: [
            {
              priority: "big_rock",
              label: "Big Rock",
              tasks: bigRocks,
              color: "bg-red-100 text-red-700 border-red-200",
            },
            {
              priority: "medium_rock",
              label: "Medium Rock",
              tasks: mediumRocks,
              color: "bg-yellow-100 text-yellow-700 border-yellow-200",
            },
            {
              priority: "small_rock",
              label: "Small Rock",
              tasks: smallRocks,
              color: "bg-green-100 text-green-700 border-green-200",
            },
            {
              priority: "none",
              label: "No Priority",
              tasks: noPriority,
              color: "bg-gray-100 text-gray-700 border-gray-200",
            },
          ].filter((group) => group.tasks.length > 0),
          totalTasks: workstreamTasks.length,
        }
      })
      .filter((group) => group.totalTasks > 0)

    return grouped
  }, [activeTasks, workstreams])

  const handleToggleComplete = (task: Task) => {
    updateTask(task.id, {
      status: task.status === "completed" ? "todo" : "completed",
    })
  }

  const getClassName = (classId?: string) => {
    if (!classId) return null
    const classItem = classes.find((c) => c.id === classId)
    return classItem?.course_code || classItem?.name
  }

  const renderTaskItem = (task: Task) => {
    const className = getClassName(task.class_id)
    const isCompleted = task.status === "completed"

    return (
      <div
        key={task.id}
        className={cn(
          "group flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer",
          isCompleted && "opacity-60",
        )}
        onClick={() => setEditingTask(task)}
      >
        <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleToggleComplete(task)
          }}
          className="flex-shrink-0"
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("font-medium text-gray-900", isCompleted && "line-through")}>{task.title}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            {className && (
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium">{className}</span>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Clock className="h-4 w-4" />
                {format(new Date(task.due_date), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderPriorityGroup = (priorityGroup: { priority: string; label: string; tasks: Task[]; color: string }) => {
    return (
      <div key={priorityGroup.priority} className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm px-3 py-1 rounded-full font-semibold border", priorityGroup.color)}>
            {priorityGroup.label}
          </span>
          <span className="text-xs text-gray-500">({priorityGroup.tasks.length})</span>
        </div>
        <div className="space-y-2 pl-4">{priorityGroup.tasks.map(renderTaskItem)}</div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">TO DO LIST</h1>
            <p className="text-sm text-gray-600 font-medium">Consolidated view of all your tasks across workstreams</p>
          </div>
          <Button
            onClick={() => setIsTaskDialogOpen(true)}
            className="gap-2 bg-[oklch(0.55_0.08_300)] hover:bg-[oklch(0.50_0.08_300)] border border-gray-300 rounded-lg px-5 py-2.5 font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {tasksByWorkstream.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No active todos</p>
            <p className="text-sm">Create a new task to get started</p>
          </div>
        ) : (
          <div className="space-y-8">
            {tasksByWorkstream.map(({ workstream, priorityGroups, totalTasks }) => (
              <div key={workstream.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: workstream.color }} />
                  <span className="text-2xl">{workstream.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900">{workstream.name}</h3>
                  <span className="text-sm text-gray-500">({totalTasks})</span>
                </div>
                <div className="space-y-4 pl-7">{priorityGroups.map(renderPriorityGroup)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Task Dialogs */}
        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          workstreams={workstreams}
          onTaskCreated={() => setIsTaskDialogOpen(false)}
        />

        {editingTask && (
          <TaskDialog
            open={!!editingTask}
            onOpenChange={(open) => !open && setEditingTask(null)}
            workstreams={workstreams}
            editTask={editingTask}
            mode="edit"
            onTaskCreated={() => setEditingTask(null)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
