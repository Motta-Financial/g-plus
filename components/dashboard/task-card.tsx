"use client"

import type { Task, Workstream } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Calendar } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  workstreams?: Workstream[]
}

export function TaskCard({ task, isDragging = false, workstreams = [] }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === "completed")
  const updateTask = useAppStore((state) => state.updateTask)

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
      completed_at: checked ? new Date().toISOString() : null,
    })
  }

  const priorityColors = {
    big_rock: "bg-red-100 text-red-700 border-red-200",
    medium_rock: "bg-amber-100 text-amber-700 border-amber-200",
    small_rock: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${isCompleted ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <Checkbox checked={isCompleted} onCheckedChange={handleCheckboxChange} className="mt-1" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-medium text-balance ${isCompleted ? "line-through" : ""}`}>{task.title}</h3>
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority.replace("_", " ")}
            </Badge>
          </div>
          {task.description && <p className="text-sm text-muted-foreground text-pretty">{task.description}</p>}
          <div className="flex items-center gap-2 flex-wrap">
            {workstream && (
              <Badge variant="secondary" style={{ backgroundColor: `${workstream.color}20`, color: workstream.color }}>
                {workstream.icon} {workstream.name}
              </Badge>
            )}
            {task.due_date && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), "MMM d")}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
