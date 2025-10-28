"use client"

import type { Task, Workstream, CanvasAssignment } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Calendar, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import { TaskDialog } from "./task-dialog"

interface StickyNoteCardProps {
  task: Task
  isDragging?: boolean
  workstreams?: Workstream[]
  canvasAssignments?: CanvasAssignment[]
}

export function StickyNoteCard({
  task,
  isDragging = false,
  workstreams = [],
  canvasAssignments = [],
}: StickyNoteCardProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === "completed")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const updateTask = useAppStore((state) => state.updateTask)
  const allClasses = useAppStore((state) => state.classes)

  const classInfo = useMemo(() => {
    if (!task.class_id) return null
    return allClasses.find((c) => c.id === task.class_id) || task.class
  }, [task.class_id, task.class, allClasses])

  const linkedAssignment = useMemo(() => {
    if (!task.linked_canvas_assignment_id) return null
    return canvasAssignments.find((a) => a.id === task.linked_canvas_assignment_id)
  }, [task.linked_canvas_assignment_id, canvasAssignments])

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const workstream = workstreams.find((w) => w.id === task.workstream_id) || task.workstream

  const handleCheckboxChange = async (checked: boolean) => {
    setIsCompleted(checked)
    updateTask(task.id, {
      status: checked ? "completed" : "todo",
      completed_at: checked ? new Date().toISOString() : undefined,
    })
  }

  const stickyColors = {
    big_rock: "bg-red-100 border-red-300",
    medium_rock: "bg-yellow-100 border-yellow-300",
    small_rock: "bg-green-100 border-green-300",
  }

  const urgencyConfig = {
    urgent: { emoji: "🔴", label: "Urgent", color: "bg-red-100 border-red-400 text-red-700" },
    "look out": { emoji: "🟡", label: "Look Out", color: "bg-yellow-100 border-yellow-400 text-yellow-700" },
    chill: { emoji: "🟢", label: "Chill", color: "bg-green-100 border-green-400 text-green-700" },
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`${stickyColors[task.priority]} p-4 rounded-md border-l-4 cursor-pointer hover:shadow-md transition-all relative ${
          isCompleted ? "opacity-60" : ""
        }`}
        onClick={() => setShowEditDialog(true)}
      >
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="space-y-3 pr-6">
          <div className="flex items-start gap-2">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleCheckboxChange}
              className="mt-0.5"
              onClick={(e) => e.stopPropagation()}
            />
            <h3 className={`font-semibold text-gray-900 text-sm leading-snug ${isCompleted ? "line-through" : ""}`}>
              {task.title}
            </h3>
          </div>

          {task.description && <p className="text-xs text-gray-600 line-clamp-2 pl-6">{task.description}</p>}

          <div className="flex items-center gap-1.5 flex-wrap pl-6">
            {task.urgency && urgencyConfig[task.urgency] && (
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 font-medium rounded-md ${urgencyConfig[task.urgency].color}`}
              >
                {urgencyConfig[task.urgency].emoji} {urgencyConfig[task.urgency].label}
              </Badge>
            )}
            {workstream && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 font-medium rounded-md"
                style={{
                  backgroundColor: `${workstream.color}20`,
                  color: workstream.color,
                  borderColor: `${workstream.color}40`,
                }}
              >
                {workstream.icon} {workstream.name}
              </Badge>
            )}
            {classInfo && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 font-medium bg-purple-50 border-purple-300 rounded-md"
              >
                {classInfo.course_code || classInfo.name}
              </Badge>
            )}
            {task.due_date && (
              <Badge
                variant="outline"
                className="text-sm px-2.5 py-1 gap-1.5 font-bold bg-white rounded-md border-gray-300 text-gray-700"
              >
                <Calendar className="h-4 w-4" />
                {format(new Date(task.due_date), "MMM d, yyyy")}
              </Badge>
            )}
            {linkedAssignment && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 gap-1 font-medium bg-blue-50 border-blue-300 rounded-md"
              >
                <BookOpen className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </div>
      </div>

      <TaskDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        workstreams={workstreams}
        onTaskCreated={() => setShowEditDialog(false)}
        editTask={task}
        mode="edit"
      />
    </>
  )
}
