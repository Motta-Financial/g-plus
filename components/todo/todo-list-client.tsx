"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, CheckCircle2, Circle, Clock, ExternalLink, MessageSquare, Send } from "lucide-react"
import { format, isPast, isToday, isTomorrow, isThisWeek } from "date-fns"
import type { Task, TaskPriority } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskDialog } from "@/components/dashboard/task-dialog"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { BulkActionBar } from "@/components/bulk-actions/bulk-action-bar"
import { AdvancedFilterPanel, type FilterState } from "@/components/filters/advanced-filter-panel"
import { applyTaskFilters } from "@/lib/filter-utils"
import { toast } from "sonner"

type FilterType = "all" | "today" | "upcoming" | "overdue"
type StatusFilter = "all" | "todo" | "in_progress" | "blocked"

export function TodoListClient() {
  const tasks = useAppStore((state) => state.tasks)
  const workstreams = useAppStore((state) => state.workstreams)
  const projects = useAppStore((state) => state.projects)
  const classes = useAppStore((state) => state.classes)
  const updateTask = useAppStore((state) => state.updateTask)
  const deleteTask = useAppStore((state) => state.deleteTask)
  const addTaskComment = useAppStore((state) => state.addTaskComment)

  const [filterType, setFilterType] = useState<FilterType>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    search: "",
    workstreamIds: [],
    projectIds: [],
    classIds: [],
    priorities: [],
    statuses: [],
    dueDateFrom: undefined,
    dueDateTo: undefined,
    hasComments: undefined,
    hasCanvas: undefined,
  })

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) => task.status !== "completed")

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (filterType === "today") {
      filtered = filtered.filter((task) => task.due_date && isToday(new Date(task.due_date)))
    } else if (filterType === "upcoming") {
      filtered = filtered.filter((task) => task.due_date && !isPast(new Date(task.due_date)))
    } else if (filterType === "overdue") {
      filtered = filtered.filter(
        (task) => task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)),
      )
    }

    filtered = applyTaskFilters(filtered, advancedFilters)

    return filtered.sort((a, b) => {
      const priorityOrder = { big_rock: 0, medium_rock: 1, small_rock: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff

      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      if (a.due_date) return -1
      if (b.due_date) return 1
      return 0
    })
  }, [tasks, filterType, statusFilter, advancedFilters])

  const handleToggleSelection = (taskId: string) => {
    const newSelection = new Set(selectedTaskIds)
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId)
    } else {
      newSelection.add(taskId)
    }
    setSelectedTaskIds(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedTaskIds.size === filteredTasks.length) {
      setSelectedTaskIds(new Set())
    } else {
      setSelectedTaskIds(new Set(filteredTasks.map((t) => t.id)))
    }
  }

  const handleBulkUpdatePriority = (priority: TaskPriority) => {
    selectedTaskIds.forEach((taskId) => {
      updateTask(taskId, { priority })
    })
    toast.success(`Updated ${selectedTaskIds.size} tasks`)
    setSelectedTaskIds(new Set())
    setIsSelectionMode(false)
  }

  const handleBulkUpdateWorkstream = (workstreamId: string) => {
    selectedTaskIds.forEach((taskId) => {
      updateTask(taskId, { workstream_id: workstreamId })
    })
    toast.success(`Updated ${selectedTaskIds.size} tasks`)
    setSelectedTaskIds(new Set())
    setIsSelectionMode(false)
  }

  const handleBulkUpdateProject = (projectId: string) => {
    selectedTaskIds.forEach((taskId) => {
      updateTask(taskId, { project_id: projectId === "none" ? undefined : projectId })
    })
    toast.success(`Updated ${selectedTaskIds.size} tasks`)
    setSelectedTaskIds(new Set())
    setIsSelectionMode(false)
  }

  const handleBulkUpdateClass = (classId: string) => {
    selectedTaskIds.forEach((taskId) => {
      updateTask(taskId, { class_id: classId === "none" ? undefined : classId })
    })
    toast.success(`Updated ${selectedTaskIds.size} tasks`)
    setSelectedTaskIds(new Set())
    setIsSelectionMode(false)
  }

  const handleBulkUpdateStatus = (status: string) => {
    selectedTaskIds.forEach((taskId) => {
      updateTask(taskId, { status: status as Task["status"] })
    })
    toast.success(`Updated ${selectedTaskIds.size} tasks`)
    setSelectedTaskIds(new Set())
    setIsSelectionMode(false)
  }

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedTaskIds.size} tasks?`)) {
      selectedTaskIds.forEach((taskId) => {
        deleteTask(taskId)
      })
      toast.success(`Deleted ${selectedTaskIds.size} tasks`)
      setSelectedTaskIds(new Set())
      setIsSelectionMode(false)
    }
  }

  const getWorkstream = (workstreamId: string) => {
    return workstreams.find((w) => w.id === workstreamId)
  }

  const getPriorityLabel = (priority: Task["priority"]) => {
    const labels = {
      big_rock: "Big Rock",
      medium_rock: "Medium Rock",
      small_rock: "Small Rock",
    }
    return labels[priority]
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    const colors = {
      big_rock: "from-red-500/20 to-red-600/20 text-red-300 border-red-500/30",
      medium_rock: "from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-500/30",
      small_rock: "from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30",
    }
    return colors[priority]
  }

  const getStatusIcon = (status: Task["status"]) => {
    if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-green-400" />
    if (status === "in_progress") return <Clock className="h-4 w-4 text-blue-400" />
    return <Circle className="h-4 w-4 text-muted-foreground" />
  }

  const getDueDateLabel = (dueDate: string) => {
    const date = new Date(dueDate)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isThisWeek(date)) return format(date, "EEEE")
    return format(date, "MMM d, yyyy")
  }

  const handleTaskClick = (task: Task) => {
    if (isSelectionMode) {
      handleToggleSelection(task.id)
    } else {
      setSelectedTask(task)
      setIsDialogOpen(true)
    }
  }

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTask(task)
    setIsEditDialogOpen(true)
  }

  const handleToggleComplete = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    updateTask(task.id, {
      status: task.status === "completed" ? "todo" : "completed",
    })
  }

  const handleAddComment = () => {
    if (selectedTask && newComment.trim()) {
      addTaskComment(selectedTask.id, newComment.trim())
      setNewComment("")
    }
  }

  const stats = useMemo(() => {
    const incompleteTasks = tasks.filter((t) => t.status !== "completed")
    return {
      total: incompleteTasks.length,
      today: incompleteTasks.filter((t) => t.due_date && isToday(new Date(t.due_date))).length,
      overdue: incompleteTasks.filter(
        (t) => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)),
      ).length,
      inProgress: incompleteTasks.filter((t) => t.status === "in_progress").length,
    }
  }, [tasks])

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col gap-6 p-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-widest text-foreground">TO DO LIST</h1>
          <p className="text-sm tracking-wide text-muted-foreground">
            Consolidated view of all your tasks across workstreams
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="glass-effect border-border/50 p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="text-2xl font-light tracking-wide text-foreground">{stats.total}</p>
            </div>
          </Card>
          <Card className="glass-effect border-border/50 p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Due Today</p>
              <p className="text-2xl font-light tracking-wide text-cyan-400">{stats.today}</p>
            </div>
          </Card>
          <Card className="glass-effect border-border/50 p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Overdue</p>
              <p className="text-2xl font-light tracking-wide text-red-400">{stats.overdue}</p>
            </div>
          </Card>
          <Card className="glass-effect border-border/50 p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">In Progress</p>
              <p className="text-2xl font-light tracking-wide text-blue-400">{stats.inProgress}</p>
            </div>
          </Card>
        </div>

        <AdvancedFilterPanel
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          workstreams={workstreams}
          projects={projects}
          classes={classes}
        />

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <TabsList className="glass-effect">
                <TabsTrigger value="all" className="tracking-wide">
                  All
                </TabsTrigger>
                <TabsTrigger value="today" className="tracking-wide">
                  Today
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="tracking-wide">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="overdue" className="tracking-wide">
                  Overdue
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <TabsList className="glass-effect">
                <TabsTrigger value="all" className="tracking-wide">
                  All Status
                </TabsTrigger>
                <TabsTrigger value="todo" className="tracking-wide">
                  To Do
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="tracking-wide">
                  In Progress
                </TabsTrigger>
                <TabsTrigger value="blocked" className="tracking-wide">
                  Blocked
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            {isSelectionMode && (
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedTaskIds.size === filteredTasks.length ? "Deselect All" : "Select All"}
              </Button>
            )}
            <Button
              variant={isSelectionMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsSelectionMode(!isSelectionMode)
                setSelectedTaskIds(new Set())
              }}
            >
              {isSelectionMode ? "Cancel Selection" : "Select Multiple"}
            </Button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <Card className="glass-effect border-border/50 p-12 text-center">
              <p className="text-sm tracking-wide text-muted-foreground">No tasks found</p>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const workstream = getWorkstream(task.workstream_id)
              const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))
              const isSelected = selectedTaskIds.has(task.id)

              return (
                <Card
                  key={task.id}
                  className={`glass-effect cursor-pointer border-border/50 p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 group ${
                    isSelected ? "border-cyan-400/50 bg-cyan-400/5" : ""
                  }`}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-start gap-4">
                    {isSelectionMode && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelection(task.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                    )}

                    {!isSelectionMode && (
                      <button
                        onClick={(e) => handleToggleComplete(task, e)}
                        className="mt-1 transition-transform hover:scale-110"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                    )}

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-light tracking-wide text-foreground">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm tracking-wide text-muted-foreground">{task.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleEditTask(task, e)}
                          >
                            Edit
                          </Button>
                          {workstream && (
                            <Badge variant="outline" className="glass-effect border-border/50 font-light tracking-wide">
                              <div
                                className="mr-2 h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: workstream.color,
                                  boxShadow: `0 0 8px ${workstream.color}80`,
                                }}
                              />
                              {workstream.name}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={`glass-effect border font-light tracking-wide ${getPriorityColor(task.priority)}`}
                          >
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm tracking-wide">
                        {task.due_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span className={isOverdue ? "text-red-400" : "text-muted-foreground"}>
                              {getDueDateLabel(task.due_date)}
                              {isOverdue && " (Overdue)"}
                            </span>
                          </div>
                        )}
                        {task.canvas_url && (
                          <a
                            href={task.canvas_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Canvas
                          </a>
                        )}
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            {task.comments.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selectedTaskIds.size}
          onClearSelection={() => {
            setSelectedTaskIds(new Set())
            setIsSelectionMode(false)
          }}
          onUpdatePriority={handleBulkUpdatePriority}
          onUpdateWorkstream={handleBulkUpdateWorkstream}
          onUpdateProject={handleBulkUpdateProject}
          onUpdateClass={handleBulkUpdateClass}
          onUpdateStatus={handleBulkUpdateStatus}
          onDelete={handleBulkDelete}
          workstreams={workstreams}
          projects={projects}
          classes={classes}
          showProject
          showClass
        />

        {/* Comments Dialog */}
        {selectedTask && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px] glass-effect max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-light text-2xl tracking-wide">{selectedTask.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  View and add comments for this task
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-light tracking-wide uppercase text-muted-foreground">Comments & Notes</h3>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {selectedTask.comments && selectedTask.comments.length > 0 ? (
                      selectedTask.comments.map((comment) => (
                        <Card key={comment.id} className="p-3 glass-effect">
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

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment or note..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 glass-effect"
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
        )}

        {/* TaskDialog */}
        {selectedTask && (
          <TaskDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            workstreams={workstreams}
            onTaskCreated={() => setIsEditDialogOpen(false)}
            editingTask={selectedTask}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
