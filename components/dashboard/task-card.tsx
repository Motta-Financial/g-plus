"use client"

import type { Task, Workstream } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Calendar, ExternalLink, MessageSquare, Send, FolderKanban, Pencil } from "lucide-react"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskDialog } from "./task-dialog"

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  workstreams?: Workstream[]
}

export function TaskCard({ task, isDragging = false, workstreams = [] }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === "completed")
  const [showComments, setShowComments] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [newComment, setNewComment] = useState("")
  const updateTask = useAppStore((state) => state.updateTask)
  const addTaskComment = useAppStore((state) => state.addTaskComment)
  const allProjects = useAppStore((state) => state.projects)

  const project = useMemo(() => {
    if (!task.project_id) return null
    return allProjects.find((p) => p.id === task.project_id) || task.project
  }, [task.project_id, task.project, allProjects])

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      addTaskComment(task.id, newComment.trim())
      setNewComment("")
    }
  }

  const priorityColors = {
    big_rock: "bg-red-500/10 text-red-600 border-red-500/20",
    medium_rock: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    small_rock: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`p-4 cursor-pointer fashion-card hover:border-primary/40 transition-all ${isCompleted ? "opacity-50" : ""}`}
        onClick={() => setShowComments(true)}
      >
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleCheckboxChange}
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-medium tracking-tight ${isCompleted ? "line-through" : ""}`}>{task.title}</h3>
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority.replace("_", " ")}
              </Badge>
            </div>
            {task.description && <p className="text-sm text-muted-foreground text-pretty">{task.description}</p>}
            <div className="flex items-center gap-2 flex-wrap">
              {workstream && (
                <Badge
                  variant="secondary"
                  className="font-normal"
                  style={{
                    backgroundColor: `${workstream.color}15`,
                    color: workstream.color,
                    borderColor: `${workstream.color}30`,
                  }}
                >
                  {workstream.icon} {workstream.name}
                </Badge>
              )}
              {project && (
                <Badge variant="outline" className="gap-1 font-normal bg-primary/5 text-primary border-primary/20">
                  <FolderKanban className="h-3 w-3" />
                  {project.name}
                </Badge>
              )}
              {task.due_date && (
                <Badge variant="outline" className="gap-1 font-normal">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.due_date), "MMM d")}
                </Badge>
              )}
              {task.canvas_url && (
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/5 font-normal" asChild>
                  <a
                    href={task.canvas_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Canvas
                  </a>
                </Badge>
              )}
              {task.comments && task.comments.length > 0 && (
                <Badge variant="outline" className="gap-1 font-normal">
                  <MessageSquare className="h-3 w-3" />
                  {task.comments.length}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="sm:max-w-[600px] fashion-card">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="font-semibold text-2xl tracking-tight">{task.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">{task.description}</DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowComments(false)
                  setShowEditDialog(true)
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Task Details */}
            <div className="flex items-center gap-2 flex-wrap">
              {workstream && (
                <Badge
                  variant="secondary"
                  className="font-normal"
                  style={{
                    backgroundColor: `${workstream.color}15`,
                    color: workstream.color,
                    borderColor: `${workstream.color}30`,
                  }}
                >
                  {workstream.icon} {workstream.name}
                </Badge>
              )}
              {project && (
                <Badge variant="outline" className="gap-1 font-normal bg-primary/5 text-primary border-primary/20">
                  <FolderKanban className="h-3 w-3" />
                  {project.name}
                </Badge>
              )}
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority.replace("_", " ")}
              </Badge>
              {task.due_date && (
                <Badge variant="outline" className="gap-1 font-normal">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.due_date), "MMM d, yyyy")}
                </Badge>
              )}
              {task.canvas_url && (
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/5 font-normal" asChild>
                  <a href={task.canvas_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                    View in Canvas
                  </a>
                </Badge>
              )}
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-tight uppercase text-muted-foreground">Comments & Notes</h3>

              {/* Existing Comments */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment) => (
                    <Card key={comment.id} className="p-3 fashion-card">
                      <p className="text-sm text-foreground">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment or note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 fashion-card"
                  rows={2}
                />
                <Button onClick={handleAddComment} size="icon" className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
