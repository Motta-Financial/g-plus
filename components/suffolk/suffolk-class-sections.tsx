"use client"

import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { format } from "date-fns"

export function SuffolkClassSections() {
  const courses = useAppStore((state) => state.courses)
  const tasks = useAppStore((state) => state.tasks)
  const updateTask = useAppStore((state) => state.updateTask)

  // Get Suffolk workstream tasks
  const suffolkTasks = tasks.filter((t) => t.workstream_id === "1")

  // Group tasks by course
  const tasksByCourse = courses.map((course) => {
    const courseTasks = suffolkTasks.filter((t) => t.canvas_course_id === course.course_code)
    const completedTasks = courseTasks.filter((t) => t.status === "completed").length
    const totalTasks = courseTasks.length
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return {
      course,
      tasks: courseTasks,
      completedTasks,
      totalTasks,
      progress,
    }
  })

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed"
    updateTask(taskId, { status: newStatus })
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

  return (
    <div className="space-y-6">
      {tasksByCourse.map(({ course, tasks, completedTasks, totalTasks, progress }) => (
        <Card key={course.id} className="p-6 space-y-4 bg-card/50 backdrop-blur border-border/50">
          {/* Course Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-light tracking-wide">{course.course_code}</h3>
                <p className="text-sm text-muted-foreground mt-1">{course.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light">
                  {completedTasks}/{totalTasks}
                </p>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          </div>

          {/* Tasks List */}
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks
                .sort((a, b) => {
                  // Sort by status (incomplete first), then by due date
                  if (a.status === "completed" && b.status !== "completed") return 1
                  if (a.status !== "completed" && b.status === "completed") return -1
                  if (a.due_date && b.due_date) {
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                  }
                  return 0
                })
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group"
                    onClick={() => handleToggleTask(task.id, task.status)}
                  >
                    <button className="mt-0.5 flex-shrink-0">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`font-light ${
                            task.status === "completed" ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <Badge variant="outline" className={`flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}

                      {task.due_date && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Due {format(new Date(task.due_date), "MMM d, yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No assignments for this class yet</p>
          )}
        </Card>
      ))}

      {tasksByCourse.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No courses found. Sync with Canvas to load your classes.</p>
        </Card>
      )}
    </div>
  )
}
