"use client"

import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, Pencil, Plus, FolderOpen } from "lucide-react"
import { format } from "date-fns"
import { TaskDialog } from "@/components/dashboard/task-dialog"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function SuffolkClassSections() {
  const classes = useAppStore((state) => state.classes)
  const tasks = useAppStore((state) => state.tasks)
  const workstreams = useAppStore((state) => state.workstreams)
  const updateTask = useAppStore((state) => state.updateTask)
  const addClass = useAppStore((state) => state.addClass)

  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [showNewClass, setShowNewClass] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [newClassCode, setNewClassCode] = useState("")

  // Get Suffolk workstream
  const suffolkWorkstream = workstreams.find((w) => w.type === "school")

  // Get Suffolk workstream tasks
  const suffolkTasks = tasks.filter((t) => t.workstream_id === suffolkWorkstream?.id)

  // Get Suffolk classes
  const suffolkClasses = classes.filter((c) => c.workstream_id === suffolkWorkstream?.id)

  // Group tasks by class
  const tasksByClass = suffolkClasses.map((classItem) => {
    const classTasks = suffolkTasks.filter((t) => t.class_id === classItem.id)
    const completedTasks = classTasks.filter((t) => t.status === "completed").length
    const totalTasks = classTasks.length
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return {
      class: classItem,
      tasks: classTasks,
      completedTasks,
      totalTasks,
      progress,
    }
  })

  // Tasks without a class
  const unclassifiedTasks = suffolkTasks.filter((t) => !t.class_id)

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed"
    updateTask(taskId, { status: newStatus })
  }

  const handleCreateClass = () => {
    if (newClassName.trim() && suffolkWorkstream) {
      addClass({
        user_id: "grace",
        workstream_id: suffolkWorkstream.id,
        name: newClassName.trim(),
        course_code: newClassCode.trim() || undefined,
        status: "active",
      })
      setShowNewClass(false)
      setNewClassName("")
      setNewClassCode("")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "big_rock":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium_rock":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "small_rock":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "big_rock":
        return "Big Rock"
      case "medium_rock":
        return "Medium Rock"
      case "small_rock":
        return "Small Rock"
      default:
        return priority
    }
  }

  const renderTaskItem = (task: any) => (
    <div
      key={task.id}
      className="flex items-start gap-3 p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors group"
    >
      <button className="mt-0.5 flex-shrink-0" onClick={() => handleToggleTask(task.id, task.status)}>
        {task.status === "completed" ? (
          <CheckCircle2 className="h-5 w-5 text-cyan-400" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-light ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </p>
          <Badge variant="outline" className={`flex-shrink-0 ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </Badge>
        </div>

        {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}

        <div className="flex items-center gap-2 flex-wrap">
          {task.project && (
            <Badge
              variant="outline"
              className="text-xs font-normal bg-purple-500/5 text-purple-600 border-purple-500/20"
            >
              <FolderOpen className="h-3 w-3 mr-1" />
              {task.project.name}
            </Badge>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Due {format(new Date(task.due_date), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setEditingTask(task.id)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={showNewClass} onOpenChange={setShowNewClass}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>Add a new class to organize your Suffolk University assignments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class-name">Class Name</Label>
                <Input
                  id="class-name"
                  placeholder="e.g., Information Systems Management"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-code">Course Code (Optional)</Label>
                <Input
                  id="class-code"
                  placeholder="e.g., ISOM-230"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewClass(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClass}>Create Class</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tasksByClass.map(({ class: classItem, tasks, completedTasks, totalTasks, progress }) => (
        <Card key={classItem.id} className="p-6 space-y-4 bg-card/50 backdrop-blur border-border/50">
          {/* Class Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-light tracking-wide">{classItem.course_code || classItem.name}</h3>
                {classItem.course_code && <p className="text-sm text-muted-foreground mt-1">{classItem.name}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-light">
                  {completedTasks}/{totalTasks}
                </p>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>
            </div>

            {/* Progress Bar */}
            {totalTasks > 0 && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
              </div>
            )}
          </div>

          {/* Tasks List */}
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks
                .sort((a, b) => {
                  if (a.status === "completed" && b.status !== "completed") return 1
                  if (a.status !== "completed" && b.status === "completed") return -1
                  if (a.due_date && b.due_date) {
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                  }
                  return 0
                })
                .map((task) => {
                  const taskWithRelations = {
                    ...task,
                    project: task.project_id
                      ? useAppStore.getState().projects.find((p) => p.id === task.project_id)
                      : undefined,
                  }
                  return renderTaskItem(taskWithRelations)
                })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No assignments for this class yet</p>
          )}
        </Card>
      ))}

      {unclassifiedTasks.length > 0 && (
        <Card className="p-6 space-y-4 bg-card/50 backdrop-blur border-border/50 border-dashed">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-light tracking-wide text-muted-foreground">Unclassified Assignments</h3>
                <p className="text-sm text-muted-foreground mt-1">Tasks not assigned to a class</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light text-muted-foreground">{unclassifiedTasks.length}</p>
                <p className="text-xs text-muted-foreground">tasks</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {unclassifiedTasks
              .sort((a, b) => {
                if (a.status === "completed" && b.status !== "completed") return 1
                if (a.status !== "completed" && b.status === "completed") return -1
                if (a.due_date && b.due_date) {
                  return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                }
                return 0
              })
              .map((task) => {
                const taskWithRelations = {
                  ...task,
                  project: task.project_id
                    ? useAppStore.getState().projects.find((p) => p.id === task.project_id)
                    : undefined,
                }
                return renderTaskItem(taskWithRelations)
              })}
          </div>
        </Card>
      )}

      {tasksByClass.length === 0 && unclassifiedTasks.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No classes or assignments yet. Create a class to get started.</p>
        </Card>
      )}

      {editingTask && (
        <TaskDialog
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          workstreams={workstreams}
          onTaskCreated={() => setEditingTask(null)}
          editingTask={tasks.find((t) => t.id === editingTask)}
        />
      )}
    </div>
  )
}
