"use client"

import type { CalendarEvent, Task, Workstream } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { format, isToday, isTomorrow, isThisWeek } from "date-fns"

interface UpcomingEventsProps {
  events: CalendarEvent[]
  tasks: Task[]
  workstreams: Workstream[]
}

export function UpcomingEvents({ events, tasks, workstreams }: UpcomingEventsProps) {
  // Combine events and tasks into a single timeline
  const timeline = [
    ...events.map((event) => ({
      type: "event" as const,
      data: event,
      date: new Date(event.start_time),
    })),
    ...tasks.map((task) => ({
      type: "task" as const,
      data: task,
      date: new Date(task.due_date!),
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isThisWeek(date)) return format(date, "EEEE")
    return format(date, "MMMM d, yyyy")
  }

  return (
    <div className="space-y-4">
      {timeline.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No upcoming events or deadlines</p>
          </CardContent>
        </Card>
      ) : (
        timeline.map((item, index) => {
          const showDateHeader = index === 0 || !isSameDay(item.date, timeline[index - 1].date)

          return (
            <div key={`${item.type}-${item.data.id}`}>
              {showDateHeader && (
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{getDateLabel(item.date)}</h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {item.type === "event" ? (
                <EventCard event={item.data as CalendarEvent} workstreams={workstreams} />
              ) : (
                <TaskCard task={item.data as Task} workstreams={workstreams} />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function EventCard({ event, workstreams }: { event: CalendarEvent; workstreams: Workstream[] }) {
  const workstream = workstreams.find((w) => w.id === event.workstream_id)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center min-w-16">
            <div className="text-2xl font-bold">{format(new Date(event.start_time), "HH:mm")}</div>
            {event.end_time && (
              <div className="text-xs text-muted-foreground">{format(new Date(event.end_time), "HH:mm")}</div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-balance">{event.title}</h4>
              {event.calendar_source && (
                <Badge variant="outline" className="capitalize">
                  {event.calendar_source}
                </Badge>
              )}
            </div>
            {event.description && <p className="text-sm text-muted-foreground text-pretty">{event.description}</p>}
            <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
              {workstream && (
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: `${workstream.color}20`, color: workstream.color }}
                >
                  {workstream.icon} {workstream.name}
                </Badge>
              )}
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TaskCard({ task, workstreams }: { task: Task; workstreams: Workstream[] }) {
  const workstream = workstreams.find((w) => w.id === task.workstream_id)

  const priorityColors = {
    big_rock: "bg-red-100 text-red-700 border-red-200",
    medium_rock: "bg-amber-100 text-amber-700 border-amber-200",
    small_rock: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center min-w-16">
            <div className="text-sm font-medium text-muted-foreground">Due</div>
            <div className="text-lg font-bold">{format(new Date(task.due_date!), "HH:mm")}</div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-balance">{task.title}</h4>
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority.replace("_", " ")}
              </Badge>
            </div>
            {task.description && <p className="text-sm text-muted-foreground text-pretty">{task.description}</p>}
            <div className="flex items-center gap-2 flex-wrap">
              {workstream && (
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: `${workstream.color}20`, color: workstream.color }}
                >
                  {workstream.icon} {workstream.name}
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {task.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
