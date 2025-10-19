"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import type { Task, Workstream, TaskPriority } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

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
}: TaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [workstreamId, setWorkstreamId] = useState(defaultWorkstreamId || "")
  const [projectId, setProjectId] = useState<string>("none")
  const [priority, setPriority] = useState<TaskPriority>("small_rock")
  const [dueDate, setDueDate] = useState("")
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")

  const addTask = useAppStore((state) => state.addTask)
  const updateTask = useAppStore((state) => state.updateTask)
  const addProject = useAppStore((state) => state.addProject)
  const allProjects = useAppStore((state) => state.projects)

  const projects = useMemo(
    () => allProjects.filter((p) => p.workstream_id === workstreamId),
    [allProjects, workstreamId],
  )

  const isEditMode = mode === "edit" || !!editTask

  useEffect(() => {
    if (open) {
      if (isEditMode && editTask) {
        setTitle(editTask.title)
        setDescription(editTask.description || "")
        setWorkstreamId(editTask.workstream_id)
        setProjectId(editTask.project_id || "none")
        setPriority(editTask.priority)
        if (editTask.due_date) {
          const date = new Date(editTask.due_date)
          setDueDate(date.toISOString().split("T")[0])
        } else {
          setDueDate("")
        }
      } else {
        setTitle(defaultTitle || "")
        setDescription(defaultDescription || "")
        setWorkstreamId(defaultWorkstreamId || "")
        setProjectId("none")
        setPriority("small_rock")
        if (defaultDueDate) {
          const date = new Date(defaultDueDate)
          setDueDate(date.toISOString().split("T")[0])
        } else {
          setDueDate("")
        }
      }
      setShowNewProject(false)
      setNewProjectName("")
    }
  }, [open, isEditMode, editTask, defaultTitle, defaultDescription, defaultWorkstreamId, defaultDueDate])

  useEffect(() => {
    if (workstreamId && !isEditMode) {
      setProjectId("none")
    }
  }, [workstreamId, isEditMode])

  const handleCreateProject = () => {
    if (newProjectName.trim() && workstreamId) {
      const newProject = addProject({
        user_id: "grace",
        workstream_id: workstreamId,
        name: newProjectName.trim(),
        status: "active",
      })
      setProjectId(newProject.id)
      setShowNewProject(false)
      setNewProjectName("")
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
        priority,
        due_date: dueDate || undefined,
      })
    } else {
      addTask({
        user_id: "grace",
        title,
        description,
        workstream_id: workstreamId,
        project_id: projectId === "none" ? undefined : projectId,
        priority,
        due_date: dueDate || undefined,
        status: "todo",
        order_index: 0,
      })
    }

    onTaskCreated()
    setTitle("")
    setDescription("")
    setWorkstreamId(defaultWorkstreamId || "")
    setProjectId("none")
    setPriority("small_rock")
    setDueDate("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-light text-2xl">{isEditMode ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update task details including workstream, project, and priority"
              : "Add a new task to your workstream"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
