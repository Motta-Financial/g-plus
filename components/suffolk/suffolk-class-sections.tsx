"use client"

import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Plus,
  FolderOpen,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
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
  const canvasAssignments = useAppStore((state) => state.canvasAssignments)
  const updateTask = useAppStore((state) => state.updateTask)
  const addClass = useAppStore((state) => state.addClass)
  const updateCanvasAssignment = useAppStore((state) => state.updateCanvasAssignment)

  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [showNewClass, setShowNewClass] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [newClassCode, setNewClassCode] = useState("")
  const [creatingTodoFor, setCreatingTodoFor] = useState<string | null>(null)
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({})

  // Get Suffolk workstream
  const suffolkWorkstream = workstreams.find((w) => w.type === "school")

  // Get Suffolk workstream tasks
  const suffolkTasks = tasks.filter((t) => t.workstream_id === suffolkWorkstream?.id)

  // Get Suffolk classes
  const suffolkClasses = classes.filter((c) => c.workstream_id === suffolkWorkstream?.id)

  // Group tasks and assignments by class
  const tasksByClass = suffolkClasses.map((classItem) => {
    const classTasks = suffolkTasks.filter((t) => t.class_id === classItem.id)
    const completedTasks = classTasks.filter((t) => t.status === "completed").length
    const totalTasks = classTasks.length
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const classCanvasAssignments = canvasAssignments.filter(
      (assignment) =>
        assignment.class_id === classItem.id ||
        assignment.course_id === classItem.canvas_course_id ||
        assignment.course_code?.toLowerCase() === classItem.course_code?.toLowerCase(),
    )

    return {
      class: classItem,
      tasks: classTasks,
      completedTasks,
      totalTasks,
      progress,
      canvasAssignments: classCanvasAssignments,
    }
  })

  const unclassifiedTasks = suffolkTasks.filter((t) => !t.class_id)
  const assignedCourseIds = suffolkClasses.map((c) => c.canvas_course_id).filter(Boolean)
  const assignedCourseCodes = suffolkClasses.map((c) => c.course_code?.toLowerCase()).filter(Boolean)

  const unclassifiedCanvasAssignments = canvasAssignments.filter(
    (assignment) =>
      !assignment.class_id &&
      !assignedCourseIds.includes(assignment.course_id) &&
      !assignedCourseCodes.includes(assignment.course_code?.toLowerCase()),
  )

  if (unclassifiedTasks.length > 0 || unclassifiedCanvasAssignments.length > 0) {
    const completedTasks = unclassifiedTasks.filter((t) => t.status === "completed").length
    const totalTasks = unclassifiedTasks.length
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    tasksByClass.push({
      class: {
        id: "unclassified",
        user_id: "grace",
        workstream_id: suffolkWorkstream?.id || "",
        name: "Unclassified",
        course_code: undefined,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      tasks: unclassifiedTasks,
      completedTasks,
      totalTasks,
      progress,
      canvasAssignments: unclassifiedCanvasAssignments,
    })
  }

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed"
    updateTask(taskId, { status: newStatus })
  }

  const handleToggleCanvasAssignment = (assignmentId: string, currentStatus?: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed"
    updateCanvasAssignment(assignmentId, { status: newStatus })
  }

  const toggleClassExpansion = (classId: string) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }))
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return "📢"
      case "assignment":
        return "📝"
      case "event":
        return "📅"
      default:
        return "📄"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "announcement":
        return "Announcement"
      case "assignment":
        return "Assignment"
      case "event":
        return "Event"
      default:
        return "Item"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "assignment":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "event":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const stripHtml = (html: string | undefined) => {
    if (!html) return ""
    // Create a temporary div to parse HTML
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    // Get text content and trim whitespace
    const text = tmp.textContent || tmp.innerText || ""
    return text.trim()
  }

  const renderCanvasAssignment = (assignment: any, isExpanded: boolean, index: number) => {
    if (!isExpanded && index >= 3) return null

    return (
      <div
        key={assignment.id}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors group ${
          assignment.status === "completed"
            ? "opacity-60 border-muted bg-muted/30"
            : assignment.type === "announcement"
              ? "border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10"
              : assignment.type === "event"
                ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                : "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10"
        }`}
      >
        <button
          className="mt-0.5 flex-shrink-0"
          onClick={() => handleToggleCanvasAssignment(assignment.id, assignment.status)}
        >
          {assignment.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-cyan-400" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`font-light text-foreground ${assignment.status === "completed" ? "line-through text-muted-foreground" : ""}`}
            >
              {assignment.title}
            </p>
            <Badge variant="outline" className={`flex-shrink-0 ${getTypeColor(assignment.type)}`}>
              {getTypeLabel(assignment.type)}
            </Badge>
          </div>

          {assignment.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{stripHtml(assignment.description)}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {assignment.course_name && (
              <Badge
                variant="outline"
                className="text-xs font-normal bg-purple-500/5 text-purple-600 border-purple-500/20"
              >
                {assignment.course_code || assignment.course_name}
              </Badge>
            )}
            {assignment.due_date && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 rounded-md">
                <Clock className="h-4 w-4 text-gray-700" />
                <span className="text-sm font-bold text-gray-700">
                  Due {format(new Date(assignment.due_date), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {assignment.points_possible && (
              <span className="text-xs text-muted-foreground">{assignment.points_possible} points</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {assignment.canvas_url && (
              <a
                href={assignment.canvas_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Canvas
              </a>
            )}
            {assignment.type !== "announcement" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCreatingTodoFor(assignment.id)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Todo
              </Button>
            )}
          </div>
        </div>
      </div>
    )
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
          {task.linked_canvas_assignment_id && (
            <Badge
              variant="outline"
              className="text-xs font-normal bg-blue-500/5 text-blue-600 border-blue-500/20 gap-1"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Linked to Canvas
            </Badge>
          )}
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
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 rounded-md">
              <Clock className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-bold text-gray-700">
                Due {format(new Date(task.due_date), "MMM d, yyyy")}
              </span>
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

  const handleCreateClass = () => {
    // Implementation for creating a new class
    addClass({
      user_id: "grace",
      workstream_id: suffolkWorkstream?.id || "",
      name: newClassName,
      course_code: newClassCode,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    setShowNewClass(false)
    setNewClassName("")
    setNewClassCode("")
  }

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

      {tasksByClass.map(
        ({
          class: classItem,
          tasks,
          completedTasks,
          totalTasks,
          progress,
          canvasAssignments: classCanvasAssignments,
        }) => {
          const isUnclassified = classItem.id === "unclassified"
          const isExpanded = expandedClasses[classItem.id] || false

          const incompleteAssignments = classCanvasAssignments
            .filter((a) => a.status !== "completed")
            .sort((a, b) => {
              if (a.due_date && b.due_date) {
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
              }
              return 0
            })

          const completedAssignments = classCanvasAssignments
            .filter((a) => a.status === "completed")
            .sort((a, b) => {
              if (a.due_date && b.due_date) {
                return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
              }
              return 0
            })

          const hasMoreIncomplete = incompleteAssignments.length > 3
          const hasCompletedAssignments = completedAssignments.length > 0

          return (
            <Card
              key={classItem.id}
              className={`p-6 space-y-4 bg-card/50 backdrop-blur ${
                isUnclassified ? "border-dashed border-muted-foreground/30" : "border-border/50"
              }`}
            >
              {/* Class Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-xl font-light tracking-wide ${isUnclassified ? "text-muted-foreground" : ""}`}
                      >
                        {classItem.course_code || classItem.name}
                      </h3>
                      {classItem.canvas_course_id && (
                        <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 gap-1">
                          <BookOpen className="h-3 w-3" />
                          Canvas
                        </Badge>
                      )}
                    </div>
                    {classItem.course_code && !isUnclassified && (
                      <p className="text-sm text-muted-foreground mt-1">{classItem.name}</p>
                    )}
                    {isUnclassified && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Tasks and assignments not assigned to a class
                      </p>
                    )}
                    {classItem.canvas_course_name && classItem.canvas_course_name !== classItem.name && (
                      <p className="text-xs text-blue-600 mt-1">{classItem.canvas_course_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-light ${isUnclassified ? "text-muted-foreground" : ""}`}>
                      {completedTasks}/{totalTasks}
                    </p>
                    <p className="text-xs text-muted-foreground">todos completed</p>
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

              {incompleteAssignments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-600 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Canvas Assignments ({incompleteAssignments.length})
                  </h4>
                  <div className="space-y-2">
                    {incompleteAssignments.map((assignment, index) =>
                      renderCanvasAssignment(assignment, isExpanded, index),
                    )}
                  </div>
                  {hasMoreIncomplete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => toggleClassExpansion(classItem.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          View {incompleteAssignments.length - 3} More
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {hasCompletedAssignments && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed Assignments ({completedAssignments.length})
                  </h4>
                  <div className="space-y-2">
                    {completedAssignments.map((assignment, index) =>
                      renderCanvasAssignment(assignment, isExpanded, index),
                    )}
                  </div>
                  {completedAssignments.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => toggleClassExpansion(classItem.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          View {completedAssignments.length - 3} More
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Tasks Section */}
              {tasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Your Todos ({tasks.length})</h4>
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
                </div>
              )}

              {tasks.length === 0 && classCanvasAssignments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No assignments or todos for this class yet
                </p>
              )}
            </Card>
          )
        },
      )}

      {tasksByClass.length === 0 && (
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
          editTask={tasks.find((t) => t.id === editingTask)}
        />
      )}

      {creatingTodoFor && (
        <TaskDialog
          open={!!creatingTodoFor}
          onOpenChange={(open) => !open && setCreatingTodoFor(null)}
          workstreams={workstreams}
          onTaskCreated={() => setCreatingTodoFor(null)}
          linkedCanvasAssignmentId={creatingTodoFor}
        />
      )}
    </div>
  )
}
