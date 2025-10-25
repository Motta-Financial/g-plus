"use client"

import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SuffolkClassSections } from "@/components/suffolk/suffolk-class-sections"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CanvasSyncButton } from "@/components/canvas/canvas-sync-button"
import { TaskDialog } from "@/components/dashboard/task-dialog"
import { useState } from "react"

export default function ClassesPage() {
  const workstreams = useAppStore((state) => state.workstreams)
  const classes = useAppStore((state) => state.classes)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const suffolkWorkstream = workstreams.find((w) => w.type === "school")

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-wide text-balance">Classes</h1>
            <p className="text-muted-foreground text-pretty max-w-2xl">
              Manage your classes and assignments organized by course
            </p>
          </div>
          <div className="flex gap-2">
            <CanvasSyncButton />
            <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">No classes yet. Sync with Canvas or create a class manually.</p>
            <CanvasSyncButton />
          </div>
        ) : (
          <SuffolkClassSections />
        )}

        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          workstreams={workstreams}
          onTaskCreated={() => setIsTaskDialogOpen(false)}
          defaultWorkstreamId={suffolkWorkstream?.id}
        />
      </div>
    </DashboardLayout>
  )
}
