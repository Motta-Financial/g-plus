"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { format, isToday, isTomorrow, isThisWeek, isPast } from "date-fns"
import { Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"

export function UpcomingDueDates() {
  const tasks = useAppStore((state) => state.tasks)
  const classes = useAppStore((state) => state.classes)
  const workstreams = useAppStore((state) => state.workstreams)

  // Get tasks with due dates, sorted by date
  const upcomingTasks = tasks
    .filter((task) => task.due_date && task.status !== "completed")
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5) // Show next 5 upcoming tasks

  const getDateLabel = (date: Date) => {
    if (isPast(date) && !isToday(date)) return "Overdue"
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isThisWeek(date)) return format(date, "EEEE")
    return format(date, "MMM d")
  }

  const getDateColor = (date: Date) => {
    if (isPast(date) && !isToday(date)) return "text-red-600"
    if (isToday(date)) return "text-orange-600"
    return "text-muted-foreground"
  }

  if (upcomingTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Due Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No upcoming due dates</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Due Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingTasks.map((task) => {
          const dueDate = new Date(task.due_date!)
          const taskClass = classes.find((c) => c.id === task.class_id)
          const workstream = workstreams.find((w) => w.id === task.workstream_id)

          return (
            <div key={task.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
              <div className="flex flex-col items-end min-w-16">
                <span className={`text-sm font-medium ${getDateColor(dueDate)}`}>{getDateLabel(dueDate)}</span>
                <span className="text-xs text-muted-foreground">{format(dueDate, "h:mm a")}</span>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {workstream && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: `${workstream.color}20`, color: workstream.color }}
                    >
                      {workstream.icon} {workstream.name}
                    </Badge>
                  )}
                  {taskClass && (
                    <Badge variant="outline" className="text-xs">
                      {taskClass.course_code || taskClass.name}
                    </Badge>
                  )}
                  {task.canvas_assignment_id && (
                    <Badge variant="outline" className="text-xs gap-1">
                      Canvas
                      {task.canvas_url && (
                        <Link href={task.canvas_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
