"use client"

import { useState } from "react"
import type { Task, Workstream } from "@/lib/types"
import { StickyNoteCard } from "./sticky-note-card"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useAppStore } from "@/lib/store"

interface KanbanBoardProps {
  tasks: Task[]
  workstreams: Workstream[]
  sortBy?: "due_date" | "urgency"
}

export function KanbanBoard({ tasks, workstreams, sortBy = "due_date" }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const updateTask = useAppStore((state) => state.updateTask)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event

    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    // Check if dropped on a status column within a workstream
    const columnId = over.id as string
    if (columnId.startsWith("column-")) {
      const newStatus = columnId.replace("column-", "").split("-")[0] as Task["status"]
      if (activeTask.status !== newStatus) {
        updateTask(activeTask.id, { status: newStatus })
      }
    }
  }

  const sortTasks = (taskList: Task[]) => {
    if (sortBy === "urgency") {
      const urgencyOrder = { urgent: 0, look_out: 1, chill: 2 }
      return [...taskList].sort((a, b) => {
        const aUrgency = a.urgency ? urgencyOrder[a.urgency] : 999
        const bUrgency = b.urgency ? urgencyOrder[b.urgency] : 999
        return aUrgency - bUrgency
      })
    } else {
      // Sort by due date
      return [...taskList].sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
    }
  }

  const dueNextTasks = sortTasks(
    tasks.filter((t) => t.status !== "completed" && (t.canvas_assignment_id || t.linked_canvas_assignment_id)),
  )

  const getPriorityLabel = (priority?: string) => {
    if (priority === "big_rock") return "Big Rock"
    if (priority === "medium_rock") return "Medium Rock"
    if (priority === "small_rock") return "Small Rock"
    return "No Priority"
  }

  const getPriorityOrder = (priority?: string) => {
    if (priority === "big_rock") return 0
    if (priority === "medium_rock") return 1
    if (priority === "small_rock") return 2
    return 3
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        {/* Due Next Section - School Assignments */}
        {dueNextTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="bg-rose-100 px-6 py-2.5 rounded-lg border border-gray-300 shadow-sm">
                <h3 className="font-bold text-gray-800 text-base tracking-wide uppercase">Due Next</h3>
              </div>
            </div>
            <div className="bg-white/50 rounded-lg border border-gray-200 p-4 space-y-3">
              {dueNextTasks.map((task) => (
                <StickyNoteCard key={task.id} task={task} workstreams={workstreams} />
              ))}
            </div>
          </div>
        )}

        {workstreams.map((workstream) => {
          const workstreamTasks = tasks.filter(
            (t) => t.workstream_id === workstream.id && !t.canvas_assignment_id && !t.linked_canvas_assignment_id,
          )

          if (workstreamTasks.length === 0) return null

          // Group tasks by priority
          const tasksByPriority = workstreamTasks.reduce(
            (acc, task) => {
              const priority = task.priority || "no_priority"
              if (!acc[priority]) acc[priority] = []
              acc[priority].push(task)
              return acc
            },
            {} as Record<string, Task[]>,
          )

          // Sort priority groups
          const priorityGroups = Object.entries(tasksByPriority).sort(
            ([a], [b]) => getPriorityOrder(a) - getPriorityOrder(b),
          )

          return (
            <div key={workstream.id} className="space-y-4">
              {/* Workstream Header */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: workstream.color }} />
                <span className="text-2xl">{workstream.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900">{workstream.name}</h2>
              </div>

              {/* Priority Groups */}
              {priorityGroups.map(([priority, priorityTasks]) => {
                const todoTasks = sortTasks(priorityTasks.filter((t) => t.status === "todo"))
                const inProgressTasks = sortTasks(priorityTasks.filter((t) => t.status === "in_progress"))
                const doneTasks = priorityTasks.filter((t) => t.status === "completed")

                return (
                  <div key={priority} className="space-y-3 pl-6">
                    {/* Priority Label */}
                    <h3 className="text-lg font-semibold text-gray-700">{getPriorityLabel(priority)}</h3>

                    {/* Status Columns for this Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <WorkstreamColumn
                        title="To Do"
                        tasks={todoTasks}
                        status="todo"
                        workstreams={workstreams}
                        workstreamId={`${workstream.id}-${priority}`}
                        color="bg-amber-100"
                      />
                      <WorkstreamColumn
                        title="In Progress"
                        tasks={inProgressTasks}
                        status="in_progress"
                        workstreams={workstreams}
                        workstreamId={`${workstream.id}-${priority}`}
                        color="bg-blue-100"
                      />
                      <WorkstreamColumn
                        title="Done"
                        tasks={doneTasks}
                        status="completed"
                        workstreams={workstreams}
                        workstreamId={`${workstream.id}-${priority}`}
                        color="bg-green-100"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <DragOverlay>{activeTask ? <StickyNoteCard task={activeTask} isDragging /> : null}</DragOverlay>
    </DndContext>
  )
}

interface WorkstreamColumnProps {
  title: string
  tasks: Task[]
  status: Task["status"]
  workstreams: Workstream[]
  workstreamId: string
  color: string
}

function WorkstreamColumn({ title, tasks, status, workstreams, workstreamId, color }: WorkstreamColumnProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        <div className={`${color} px-4 py-2 rounded-lg border border-gray-300 shadow-sm`}>
          <h3 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">{title}</h3>
        </div>
      </div>

      <div
        id={`column-${status}-${workstreamId}`}
        className="min-h-[300px] bg-white/50 rounded-lg border border-gray-200 p-3 space-y-3"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Drop tasks here</p>
            </div>
          ) : (
            tasks.map((task) => <StickyNoteCard key={task.id} task={task} workstreams={workstreams} />)
          )}
        </SortableContext>
      </div>
    </div>
  )
}
