"use client"

import { useState } from "react"
import type { CalendarEvent, Task, Workstream } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"

interface CalendarViewProps {
  events: CalendarEvent[]
  tasks: Task[]
  workstreams: Workstream[]
}

export function CalendarView({ events, tasks, workstreams }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.getDay()

  // Create array of days including padding for the first week
  const calendarDays = Array(firstDayOfWeek).fill(null).concat(daysInMonth)

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start_time), day))
  }

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => task.due_date && isSameDay(new Date(task.due_date), day))
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="min-h-24 p-2 border rounded-md bg-muted/20" />
            }

            const dayEvents = getEventsForDay(day)
            const dayTasks = getTasksForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 p-2 border rounded-md ${
                  isCurrentMonth ? "bg-card" : "bg-muted/20"
                } ${isCurrentDay ? "border-primary border-2" : ""}`}
              >
                <div className={`text-sm font-medium mb-1 ${isCurrentDay ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => {
                    const workstream = workstreams.find((w) => w.id === event.workstream_id)
                    return (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded truncate"
                        style={{
                          backgroundColor: workstream?.color ? `${workstream.color}20` : "#e5e7eb",
                          color: workstream?.color || "#374151",
                        }}
                      >
                        {event.title}
                      </div>
                    )
                  })}
                  {dayTasks.slice(0, 2).map((task) => {
                    const workstream = workstreams.find((w) => w.id === task.workstream_id)
                    return (
                      <div
                        key={task.id}
                        className="text-xs p-1 rounded truncate border"
                        style={{
                          backgroundColor: workstream?.color ? `${workstream.color}10` : "#f3f4f6",
                          borderColor: workstream?.color || "#d1d5db",
                          color: workstream?.color || "#374151",
                        }}
                      >
                        {task.title}
                      </div>
                    )
                  })}
                  {dayEvents.length + dayTasks.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayEvents.length + dayTasks.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
