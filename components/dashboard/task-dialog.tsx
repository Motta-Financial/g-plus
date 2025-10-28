"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import type { Task, Workstream, TaskPriority, TaskUrgency, TaskTimeframe } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ExternalLink, X } from "lucide-react"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workstreams: Workstream[]
  onTaskCreated: () => void
  defaultWorkstreamId?: string
  defaultTitle?: string
  defaultDescription?: string
  defaultDueDate?: string
  editTask?: Task
  mode?: "create" | "edit"
  linkedCanvasAssignmentId?: string
}

export function TaskDialog({
  open,
  onOpenChange,
  workstreams,
  onTaskCreated,
  defaultWorkstreamId,
  defaultTitle,
  defaultDescription,
  defaultDueDate,
  editTask,
  mode = "create",
  linkedCanvasAssignmentId,
}: TaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [workstreamId, setWorkstreamId] = useState(defaultWorkstreamId || "")
  const [projectId, setProjectId] = useState<string>("none")
  const [classId, setClassId] = useState<string>("none")
  const [priority, setPriority] = useState<TaskPriority>("small_rock")
  const [urgency, setUrgency] = useState<TaskUrgency | undefined>(undefined) // New urgency state
  const [timeframe, setTimeframe] = useState<TaskTimeframe | undefined>(undefined) // Added timeframe state
  const [dueDate, setDueDate] = useState("")
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [showNewClass, setShowNewClass] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [newClassCode, setNewClassCode] = useState("")
  const [canvasAssignmentId, setCanvasAssignmentId] = useState<string>("")

  const addTask = useAppStore((state) => state.addTask)
  const updateTask = useAppStore((state) => state.updateTask)
  const addProject = useAppStore((state) => state.addProject)
  const addClass = useAppStore((state) => state.addClass)
  const allProjects = useAppStore((state) => state.projects)
  const allClasses = useAppStore((state) => state.classes)
  const canvasAssignments = useAppStore((state) => state.canvasAssignments)

  const projects = useMemo(
    () => allProjects.filter((p) => p.workstream_id === workstreamId),
    [allProjects, workstreamId],
  )

  const classes = useMemo(() => allClasses.filter((c) => c.workstream_id === workstreamId), [allClasses, workstreamId])

  const isEditMode = mode === "edit" || !!editTask

  const selectedWorkstream = workstreams.find((w) => w.id === workstreamId)
  const isSchoolWorkstream = selectedWorkstream?.type === "school"

  const stripHtml = (html: string | undefined) => {
    if (!html) return ""
    // Use regex to strip HTML tags (works on both server and client)
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim()
  }

  useEffect(() => {
    if (open && linkedCanvasAssignmentId) {
      const assignment = canvasAssignments.find((a) => a.id === linkedCanvasAssignmentId)
      if (assignment) {
        setCanvasAssignmentId(assignment.id)
        setTitle(assignment.title)
        if (assignment.description) setDescription(stripHtml(assignment.description))
        if (assignment.due_date) {
          const date = new Date(assignment.due_date)
          setDueDate(date.toISOString().split("T")[0])
        }

        // Auto-select the class if it exists
        if (assignment.class_id) {
          setClassId(assignment.class_id)
          const classItem = allClasses.find((c) => c.id === assignment.class_id)
          if (classItem) {
            setWorkstreamId(classItem.workstream_id)
          }
        }
      }
    }
  }, [open, linkedCanvasAssignmentId, canvasAssignments, allClasses])

  useEffect(() => {
    if (open) {
      if (isEditMode && editTask) {
        setTitle(editTask.title)
        setDescription(editTask.description || "")
        setWorkstreamId(editTask.workstream_id)
        setProjectId(editTask.project_id || "none")
        setClassId(editTask.class_id || "none")
        setPriority(editTask.priority)
        setUrgency(editTask.urgency)
        setTimeframe(editTask.timeframe) // Load timeframe from task
        setCanvasAssignmentId(editTask.linked_canvas_assignment_id || "")
        if (editTask.due_date) {
          const date = new Date(editTask.due_date)
          setDueDate(date.toISOString().split("T")[0])
        } else {
          setDueDate("")
        }
      } else if (!linkedCanvasAssignmentId) {
        setTitle(defaultTitle || "")
        setDescription(defaultDescription || "")
        setWorkstreamId(defaultWorkstreamId || "")
        setProjectId("none")
        setClassId("none")
        setPriority("small_rock")
        setUrgency(undefined)
        setTimeframe(undefined) // Reset timeframe
        setCanvasAssignmentId("")
        if (defaultDueDate) {
          const date = new Date(defaultDueDate)
          setDueDate(date.toISOString().split("T")[0])
        } else {
          setDueDate("")
        }
      }
      setShowNewProject(false)
      setNewProjectName("")
      setShowNewClass(false)
      setNewClassName("")
      setNewClassCode("")
    }
  }, [
    open,
    isEditMode,
    editTask,
    defaultTitle,
    defaultDescription,
    defaultWorkstreamId,
    defaultDueDate,
    linkedCanvasAssignmentId,
  ])

  useEffect(() => {
    if (workstreamId && !isEditMode && !linkedCanvasAssignmentId) {
      setProjectId("none")
      setClassId("none")
    }
  }, [workstreamId, isEditMode, linkedCanvasAssignmentId])

  const handleCreateProject = () => {
    if (newProjectName.trim() && workstreamId) {
      const newProject = {
        user_id: "grace",
        workstream_id: workstreamId,
        name: newProjectName.trim(),
        status: "active" as const,
      }
      addProject(newProject)
      const addedProject = allProjects[allProjects.length - 1]
      if (addedProject) {
        setProjectId(addedProject.id)
      }
      setShowNewProject(false)
      setNewProjectName("")
    }
  }

  const handleCreateClass = () => {
    if (newClassName.trim() && workstreamId) {
      const newClass = {
        user_id: "grace",
        workstream_id: workstreamId,
        name: newClassName.trim(),
        course_code: newClassCode.trim() || undefined,
        status: "active" as const,
      }
      addClass(newClass)
      const addedClass = allClasses[allClasses.length - 1]
      if (addedClass) {
        setClassId(addedClass.id)
      }
      setShowNewClass(false)
      setNewClassName("")
      setNewClassCode("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditMode && editTask) {
      updateTask(editTask.id, {
        title,
        description,
        workstream_id: workstreamId,
        project_id: projectId === "none" ? undefined : projectId,
        class_id: classId === "none" ? undefined : classId,
        priority,
        urgency,
        timeframe,
        due_date: dueDate || undefined,
        linked_canvas_assignment_id: canvasAssignmentId || undefined,
      })
    } else {
      addTask({
        user_id: "grace",
        title,
        description,
        workstream_id: workstreamId,
        project_id: projectId === "none" ? undefined : projectId,
        class_id: classId === "none" ? undefined : classId,
        priority,
        urgency,
        timeframe,
        due_date: dueDate || undefined,
        status: "todo",
        order_index: 0,
        linked_canvas_assignment_id: canvasAssignmentId || undefined,
      })
    }

    onTaskCreated()
    setTitle("")
    setDescription("")
    setWorkstreamId(defaultWorkstreamId || "")
    setProjectId("none")
    setClassId("none")
    setPriority("small_rock")
    setUrgency(undefined)
    setTimeframe(undefined) // Reset timeframe
    setDueDate("")
    setCanvasAssignmentId("")
  }

  const linkedAssignment = canvasAssignmentId ? canvasAssignments.find((a) => a.id === canvasAssignmentId) : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-light text-2xl">{isEditMode ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update task details including workstream, project, and priority"
              : linkedAssignment
                ? `Create a todo for: ${linkedAssignment.title}`
                : "Add a new task to your workstream"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {linkedAssignment && (
            <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-600">Linked to Canvas Assignment</p>
                  <p className="text-sm text-foreground mt-1">{linkedAssignment.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {linkedAssignment.course_code} • {linkedAssignment.course_name}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setCanvasAssignmentId("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {linkedAssignment.canvas_url && (
                <a
                  href={linkedAssignment.canvas_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View in Canvas
                </a>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workstream">Workstream</Label>
              <Select value={workstreamId} onValueChange={setWorkstreamId} required>
                <SelectTrigger id="workstream">
                  <SelectValue placeholder="Select workstream" />
                </SelectTrigger>
                <SelectContent>
                  {workstreams.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.icon} {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="big_rock">Big Rock</SelectItem>
                  <SelectItem value="medium_rock">Medium Rock</SelectItem>
                  <SelectItem value="small_rock">Small Rock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency (Optional)</Label>
            <Select
              value={urgency || "none"}
              onValueChange={(value) => setUrgency(value === "none" ? undefined : (value as TaskUrgency))}
            >
              <SelectTrigger id="urgency">
                <SelectValue placeholder="Select urgency level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="look_out">🟡 Look Out</SelectItem>
                <SelectItem value="chill">🟢 Chill</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe (Optional)</Label>
            <Select
              value={timeframe || "none"}
              onValueChange={(value) => setTimeframe(value === "none" ? undefined : (value as TaskTimeframe))}
            >
              <SelectTrigger id="timeframe">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="this_week">📅 This Week</SelectItem>
                <SelectItem value="next_week">📆 Next Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isSchoolWorkstream && workstreamId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="class">Class</Label>
                {!showNewClass && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                    onClick={() => setShowNewClass(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New Class
                  </Button>
                )}
              </div>
              {showNewClass ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Class name..."
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                  <Input
                    placeholder="Course code (optional)..."
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value)}
                  />
                  {canvasAssignmentId && newClassCode && (
                    <p className="text-xs text-muted-foreground">
                      💡 This will link to your Canvas course: {newClassCode}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleCreateClass}>
                      Add
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowNewClass(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder={classes.length === 0 ? "No classes yet" : "Select class"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.course_code || classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          {workstreamId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="project">Project (Optional)</Label>
                {!showNewProject && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                    onClick={() => setShowNewProject(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New Project
                  </Button>
                )}
              </div>
              {showNewProject ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleCreateProject()
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={handleCreateProject}>
                    Add
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowNewProject(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder={projects.length === 0 ? "No projects yet" : "Select project"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? "Update Task" : "Create Task"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
