"use client"

import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Plus, Trash2 } from "lucide-react"
import { CanvasSyncButton } from "@/components/canvas/canvas-sync-button"
import { useState } from "react"
import { ClassCard } from "@/components/classes/class-card"
import { ClassDialog } from "@/components/classes/class-dialog"
import { Button } from "@/components/ui/button"

export default function ClassesPage() {
  const workstreams = useAppStore((state) => state.workstreams)
  const classes = useAppStore((state) => state.classes)
  const removeDuplicateClasses = useAppStore((state) => state.removeDuplicateClasses)
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<string | null>(null)

  const suffolkWorkstream = workstreams.find((w) => w.type === "school")
  const suffolkClasses = classes.filter((c) => c.workstream_id === suffolkWorkstream?.id)

  const handleCleanupDuplicates = () => {
    const beforeCount = classes.length
    removeDuplicateClasses()
    const afterCount = useAppStore.getState().classes.length
    const removed = beforeCount - afterCount
    if (removed > 0) {
      alert(`Removed ${removed} duplicate class${removed > 1 ? "es" : ""}!`)
    } else {
      alert("No duplicates found!")
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0a0a0f] -m-6 p-6">
        <div className="space-y-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-light tracking-wide text-balance text-white">My Courses</h1>
              <p className="text-gray-400 text-pretty max-w-2xl">View and manage your classes</p>
            </div>
            <div className="flex gap-2">
              {suffolkClasses.length > 5 && (
                <Button
                  onClick={handleCleanupDuplicates}
                  variant="outline"
                  size="sm"
                  className="bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Duplicates
                </Button>
              )}
              <CanvasSyncButton />
            </div>
          </div>

          {suffolkClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-400 mb-4">No classes yet. Sync with Canvas or create a class manually.</p>
              <CanvasSyncButton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suffolkClasses.map((classItem) => (
                <ClassCard key={classItem.id} classItem={classItem} onEdit={() => setEditingClass(classItem.id)} />
              ))}

              <button
                onClick={() => setIsClassDialogOpen(true)}
                className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-gray-600 hover:bg-gray-900/30 transition-colors flex items-center justify-center min-h-[400px] bg-gray-900/20"
              >
                <div className="text-center space-y-2">
                  <Plus className="h-8 w-8 mx-auto text-gray-500" />
                  <p className="text-sm text-gray-500 font-medium">New</p>
                </div>
              </button>
            </div>
          )}

          <ClassDialog
            open={isClassDialogOpen || !!editingClass}
            onOpenChange={(open) => {
              if (!open) {
                setIsClassDialogOpen(false)
                setEditingClass(null)
              }
            }}
            editClass={editingClass ? classes.find((c) => c.id === editingClass) : undefined}
            workstreamId={suffolkWorkstream?.id}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
