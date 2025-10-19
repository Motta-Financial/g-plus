"use client"

import { CalendarClient } from "@/components/calendar/calendar-client"
import { useAppStore } from "@/lib/store"

export default function CalendarPage() {
  const workstreams = useAppStore((state) => state.workstreams)
  const events = useAppStore((state) => state.events)
  const tasks = useAppStore((state) => state.tasks)

  // Filter tasks with due dates
  const tasksWithDueDates = tasks
    .filter((t) => t.due_date)
    .map((task) => ({
      ...task,
      workstream: workstreams.find((w) => w.id === task.workstream_id),
    }))

  const eventsWithWorkstreams = events.map((event) => ({
    ...event,
    workstream: workstreams.find((w) => w.id === event.workstream_id),
  }))

  return (
    <CalendarClient initialEvents={eventsWithWorkstreams} initialTasks={tasksWithDueDates} workstreams={workstreams} />
  )
}
