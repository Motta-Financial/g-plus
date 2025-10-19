"use client"

import type React from "react"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Plus, FolderKanban, Calendar, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Project } from "@/lib/types"
import { format } from "date-fns"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function ProjectsPage() {
  const projects = useAppStore((state) => state.projects)
  const workstreams = useAppStore((state) => state.workstreams)
  const tasks = useAppStore((state) => state.tasks)
  const addProject = useAppStore((state) => state.addProject)
  const updateProject = useAppStore((state) => state.updateProject)
  const deleteProject = useAppStore((state) => state.deleteProject)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    workstream_id: "",
    color: "#6366f1",
    status: "active" as const,
    due_date: "",
  })

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name,
        description: project.description || "",
        workstream_id: project.workstream_id,
        color: project.color || "#6366f1",
        status: project.status,
        due_date: project.due_date ? new Date(project.due_date).toISOString().split("T")[0] : "",
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: "",
        description: "",
        workstream_id: "",
        color: "#6366f1",
        status: "active",
        due_date: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProject) {
      updateProject(editingProject.id, {
        ...formData,
        due_date: formData.due_date || undefined,
      })
    } else {
      addProject({
        user_id: "grace",
        ...formData,
        due_date: formData.due_date || undefined,
      })
    }
    setIsDialogOpen(false)
  }

  const getProjectTasks = (projectId: string) => {
    return tasks.filter((t) => t.project_id === projectId)
  }

  const getProjectStats = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId)
    const completed = projectTasks.filter((t) => t.status === "completed").length
    const total = projectTasks.length
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  const activeProjects = projects.filter((p) => p.status === "active")
  const completedProjects = projects.filter((p) => p.status === "completed")
  const archivedProjects = projects.filter((p) => p.status === "archived")

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-[0.2em] text-foreground">Projects</h1>
            <p className="mt-2 text-sm font-light text-muted-foreground">Organize your tasks into projects</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-light tracking-wide text-foreground">Active Projects</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeProjects.map((project) => {
                const workstream = workstreams.find((w) => w.id === project.workstream_id)
                const stats = getProjectStats(project.id)
                return (
                  <Card
                    key={project.id}
                    className="glass-effect border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => handleOpenDialog(project)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: project.color || workstream?.color,
                              boxShadow: `0 0 12px ${project.color || workstream?.color}60`,
                            }}
                          />
                          <CardTitle className="font-light text-lg text-foreground">{project.name}</CardTitle>
                        </div>
                      </div>
                      {workstream && (
                        <Badge variant="secondary" className="w-fit text-xs font-light">
                          {workstream.icon} {workstream.name}
                        </Badge>
                      )}
                      {project.description && (
                        <CardDescription className="text-muted-foreground font-light">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-light">Progress</span>
                          <span className="text-foreground font-light">
                            {stats.completed}/{stats.total} tasks
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all"
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Due Date */}
                      {project.due_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="font-light">Due {format(new Date(project.due_date), "MMM d, yyyy")}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-light tracking-wide text-foreground">Completed Projects</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedProjects.map((project) => {
                const workstream = workstreams.find((w) => w.id === project.workstream_id)
                const stats = getProjectStats(project.id)
                return (
                  <Card
                    key={project.id}
                    className="glass-effect border-white/10 hover:border-white/20 transition-all cursor-pointer opacity-60"
                    onClick={() => handleOpenDialog(project)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <CardTitle className="font-light text-lg text-foreground">{project.name}</CardTitle>
                        </div>
                      </div>
                      {workstream && (
                        <Badge variant="secondary" className="w-fit text-xs font-light">
                          {workstream.icon} {workstream.name}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground font-light">{stats.total} tasks completed</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <Card className="glass-effect border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderKanban className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-light text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground font-light mb-6">Create your first project to organize your tasks</p>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-light text-2xl">
              {editingProject ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject ? "Update your project details" : "Add a new project to organize your tasks"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g., Website Redesign"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this project about?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workstream">Workstream</Label>
                <Select
                  value={formData.workstream_id}
                  onValueChange={(value) => setFormData({ ...formData, workstream_id: value })}
                  required
                >
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Project["status"] })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-between gap-2">
              {editingProject && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    deleteProject(editingProject.id)
                    setIsDialogOpen(false)
                  }}
                >
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingProject ? "Update" : "Create"} Project</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
