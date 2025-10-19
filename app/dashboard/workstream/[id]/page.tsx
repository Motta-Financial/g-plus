"use client"

import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TaskDialog } from "@/components/dashboard/task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CanvasSyncButton } from "@/components/canvas/canvas-sync-button"
import { SuffolkClassSections } from "@/components/suffolk/suffolk-class-sections"
import { TaskBoard } from "@/components/dashboard/task-board"

export default function WorkstreamPage({ params }: { params: { id: string } }) {
  const { id } = params
  const workstreams = useAppStore((state) => state.workstreams)
  const tasks = useAppStore((state) => state.tasks)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const workstream = workstreams.find((w) => w.id === id)
  const workstreamTasks = tasks
    .filter((t) => t.workstream_id === id && t.status !== "completed")
    .map((task) => ({
      ...task,
      workstream: workstreams.find((w) => w.id === task.workstream_id),
    }))

  if (!workstream) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Workstream not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const isSchoolWorkstream = workstream.type === "school"

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: workstream.color }} />
              <h1 className="text-4xl font-light tracking-wide text-balance">{workstream.name}</h1>
              <span className="text-3xl">{workstream.icon}</span>
            </div>
            {workstream.description && (
              <p className="text-muted-foreground text-pretty max-w-2xl">{workstream.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {isSchoolWorkstream && <CanvasSyncButton />}
            <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {isSchoolWorkstream ? (
          <SuffolkClassSections />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 luxury-card">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Big Rocks</p>
                <p className="text-3xl font-light mt-2">
                  {workstreamTasks.filter((t) => t.priority === "big_rock").length}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 luxury-card">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Medium Rocks</p>
                <p className="text-3xl font-light mt-2">
                  {workstreamTasks.filter((t) => t.priority === "medium_rock").length}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 luxury-card">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Small Rocks</p>
                <p className="text-3xl font-light mt-2">
                  {workstreamTasks.filter((t) => t.priority === "small_rock").length}
                </p>
              </div>
            </div>

            <TaskBoard tasks={workstreamTasks} viewMode="priority" workstreams={workstreams} />
          </>
        )}

        {/* Task Dialog */}
        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          workstreams={workstreams}
          onTaskCreated={() => setIsTaskDialogOpen(false)}
          defaultWorkstreamId={id}
        />
      </div>
    </DashboardLayout>
  )
}
