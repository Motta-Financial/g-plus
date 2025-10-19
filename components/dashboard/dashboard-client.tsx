"use client"

import { useState } from "react"
import type { Workstream, Task } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "./dashboard-layout"
import { TaskBoard } from "./task-board"
import { TaskDialog } from "./task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface DashboardClientProps {
  initialWorkstreams: Workstream[]
  initialTasks: Task[]
}

export function DashboardClient({ initialWorkstreams, initialTasks }: DashboardClientProps) {
  const [workstreams] = useState<Workstream[]>(initialWorkstreams)
  const tasks = useAppStore((state) => state.tasks)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  // Add workstream data to tasks
  const tasksWithWorkstreams = tasks
    .filter((t) => t.status !== "completed")
    .map((task) => ({
      ...task,
      workstream: workstreams.find((w) => w.id === task.workstream_id),
    }))

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-wide text-balance">Good day, Grace</h1>
            <p className="text-muted-foreground text-pretty">Here's an overview of your workstreams</p>
          </div>
          <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {workstreams.map((workstream) => {
            const workstreamTasks = tasksWithWorkstreams.filter((t) => t.workstream_id === workstream.id)
            return (
              <Link key={workstream.id} href={`/dashboard/workstream/${workstream.id}`}>
                <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-md cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: workstream.color }} />
                    <h3 className="font-medium">{workstream.name}</h3>
                    <span className="text-xl">{workstream.icon}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Big Rocks</span>
                      <span className="font-medium">
                        {workstreamTasks.filter((t) => t.priority === "big_rock").length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Medium Rocks</span>
                      <span className="font-medium">
                        {workstreamTasks.filter((t) => t.priority === "medium_rock").length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Small Rocks</span>
                      <span className="font-medium">
                        {workstreamTasks.filter((t) => t.priority === "small_rock").length}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-light tracking-wide">All Tasks</h2>
          <TaskBoard tasks={tasksWithWorkstreams} viewMode="priority" workstreams={workstreams} />
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
