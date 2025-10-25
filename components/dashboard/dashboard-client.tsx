"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "./dashboard-layout"
import { TaskDialog } from "./task-dialog"
import { UpcomingDeadlinesWidget } from "./upcoming-deadlines-widget"
import { InProgressTasksWidget } from "./in-progress-tasks-widget"
import { CompactTodoList } from "./compact-todo-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { WeeklyPlannerCalendar } from "./weekly-planner-calendar"

export function DashboardClient() {
  const workstreams = useAppStore((state) => state.workstreams)
  const tasks = useAppStore((state) => state.tasks)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const activeTasks = tasks.filter((t) => t.status !== "completed")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 font-medium">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
          <Button
            onClick={() => setIsTaskDialogOpen(true)}
            className="gap-2 bg-[oklch(0.55_0.08_300)] hover:bg-[oklch(0.50_0.08_300)] border border-gray-300 rounded-lg px-5 py-2.5 font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="space-y-6">
          {/* Weekly Planner Calendar - Compact */}
          <WeeklyPlannerCalendar />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar with widgets - now includes In Progress section */}
            <div className="lg:col-span-1 space-y-4">
              <InProgressTasksWidget />
              <UpcomingDeadlinesWidget />
            </div>

            <div className="lg:col-span-2">
              <CompactTodoList tasks={activeTasks} workstreams={workstreams} />
            </div>
          </div>
        </div>

        {/* Task Dialog */}
        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          workstreams={workstreams}
          onTaskCreated={() => setIsTaskDialogOpen(false)}
        />
      </div>
    </DashboardLayout>
  )
}
