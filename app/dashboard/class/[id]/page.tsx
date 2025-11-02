"use client"

import { useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, ExternalLink, CheckCircle2, Circle, Clock, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { TaskDialog } from "@/components/dashboard/task-dialog"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const classes = useAppStore((state) => state.classes)
  const tasks = useAppStore((state) => state.tasks)
  const canvasAssignments = useAppStore((state) => state.canvasAssignments)
  const workstreams = useAppStore((state) => state.workstreams)
  const updateTask = useAppStore((state) => state.updateTask)
  const updateCanvasAssignment = useAppStore((state) => state.updateCanvasAssignment)

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)

  const classItem = classes.find((c) => c.id === classId)
  const classTasks = tasks.filter((t) => t.class_id === classId)
  const classAssignments = canvasAssignments.filter(
    (a) =>
      a.class_id === classId ||
      a.course_id === classItem?.canvas_course_id ||
      a.course_code?.toLowerCase() === classItem?.course_code?.toLowerCase(),
  )

  const incompleteAssignments = classAssignments.filter((a) => a.status !== "completed")
  const completedAssignments = classAssignments.filter((a) => a.status === "completed")
  const incompleteTasks = classTasks.filter((t) => t.status !== "completed")
  const completedTasks = classTasks.filter((t) => t.status === "completed")

  const totalItems = classTasks.length + classAssignments.length
  const completedItems = completedTasks.length + completedAssignments.length
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  if (!classItem) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Class not found</p>
          <Button onClick={() => router.push("/dashboard/classes")} className="mt-4">
            Back to Classes
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed"
    updateTask(taskId, { status: newStatus })
  }

  const handleToggleAssignment = (assignmentId: string, currentStatus?: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed"
    updateCanvasAssignment(assignmentId, { status: newStatus })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/classes")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </Button>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-light tracking-wide">{classItem.course_code || classItem.name}</h1>
              {classItem.course_code && <p className="text-xl text-muted-foreground">{classItem.name}</p>}
              {classItem.instructor && (
                <p className="text-sm text-muted-foreground">Instructor: {classItem.instructor}</p>
              )}
            </div>
            <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>

          {/* Progress */}
          {totalItems > 0 && (
            <Card className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Course Progress</p>
                  <p className="text-2xl font-light">
                    {completedItems}/{totalItems}
                  </p>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
              </div>
            </Card>
          )}
        </div>

        {/* Canvas Assignments */}
        {incompleteAssignments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-light">Canvas Assignments ({incompleteAssignments.length})</h2>
            <div className="space-y-2">
              {incompleteAssignments.map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5" onClick={() => handleToggleAssignment(assignment.id, assignment.status)}>
                      {assignment.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-cyan-400" />
                      )}
                    </button>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{assignment.title}</p>
                        <Badge variant="outline">{assignment.type}</Badge>
                      </div>
                      {assignment.due_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Due {format(new Date(assignment.due_date), "MMM d, yyyy")}
                        </div>
                      )}
                      {assignment.canvas_url && (
                        <a
                          href={assignment.canvas_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open in Canvas
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        {incompleteTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-light">Your Tasks ({incompleteTasks.length})</h2>
            <div className="space-y-2">
              {incompleteTasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5" onClick={() => handleToggleTask(task.id, task.status)}>
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-cyan-400" />
                      )}
                    </button>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{task.title}</p>
                      {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                      {task.due_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Due {format(new Date(task.due_date), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setEditingTask(task.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Items */}
        {(completedAssignments.length > 0 || completedTasks.length > 0) && (
          <div className="space-y-4">
            <h2 className="text-2xl font-light text-muted-foreground">
              Completed ({completedAssignments.length + completedTasks.length})
            </h2>
            <div className="space-y-2 opacity-60">
              {[...completedAssignments, ...completedTasks].map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                    <p className="line-through text-muted-foreground">{item.title}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {totalItems === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No assignments or tasks yet for this class</p>
          </Card>
        )}

        <TaskDialog
          open={isTaskDialogOpen || !!editingTask}
          onOpenChange={(open) => {
            if (!open) {
              setIsTaskDialogOpen(false)
              setEditingTask(null)
            }
          }}
          workstreams={workstreams}
          onTaskCreated={() => {
            setIsTaskDialogOpen(false)
            setEditingTask(null)
          }}
          defaultWorkstreamId={classItem.workstream_id}
          defaultClassId={classId}
          editTask={editingTask ? tasks.find((t) => t.id === editingTask) : undefined}
        />
      </div>
    </DashboardLayout>
  )
}
