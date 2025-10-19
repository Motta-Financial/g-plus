"use client"

import { useState } from "react"
import type { Workstream, Task, CalendarEvent } from "@/lib/types"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CalendarView } from "./calendar-view"
import { UpcomingEvents } from "./upcoming-events"
import { WorkstreamFilter } from "@/components/dashboard/workstream-filter"
import { Button } from "@/components/ui/button"
import { Calendar, List } from "lucide-react"

interface CalendarClientProps {
  initialEvents: CalendarEvent[]
  initialTasks: Task[]
  workstreams: Workstream[]
}

export function CalendarClient({ initialEvents, initialTasks, workstreams }: CalendarClientProps) {
  const [events] = useState<CalendarEvent[]>(initialEvents)
  const [tasks] = useState<Task[]>(initialTasks)
  const [selectedWorkstreams, setSelectedWorkstreams] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

  const filteredEvents =
    selectedWorkstreams.length > 0
      ? events.filter((event) => event.workstream_id && selectedWorkstreams.includes(event.workstream_id))
      : events

  const filteredTasks =
    selectedWorkstreams.length > 0 ? tasks.filter((task) => selectedWorkstreams.includes(task.workstream_id)) : tasks

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Calendar</h1>
            <p className="text-muted-foreground">View all your events and deadlines in one place</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              size="sm"
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              size="sm"
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>

        {/* Filters */}
        <WorkstreamFilter
          workstreams={workstreams}
          selectedWorkstreams={selectedWorkstreams}
          onSelectionChange={setSelectedWorkstreams}
        />

        {/* Calendar or List View */}
        {viewMode === "calendar" ? (
          <CalendarView events={filteredEvents} tasks={filteredTasks} workstreams={workstreams} />
        ) : (
          <UpcomingEvents events={filteredEvents} tasks={filteredTasks} workstreams={workstreams} />
        )}
      </div>
    </DashboardLayout>
  )
}
