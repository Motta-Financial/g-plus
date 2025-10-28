"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { Clock } from "lucide-react"
import { format } from "date-fns"

export function InProgressTasksWidget() {
  const tasks = useAppStore((state) => state.tasks)
  const workstreams = useAppStore((state) => state.workstreams)

  const inProgressTasks = tasks
    .filter((t) => t.status === "in_progress")
    .sort((a, b) => {
      // Sort by due date if available, otherwise by updated_at
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      if (a.due_date) return -1
      if (b.due_date) return 1
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  return (
    <Card className="bg-[oklch(0.55_0.08_300)] border border-gray-300 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-white font-bold text-lg tracking-wide uppercase">In Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {inProgressTasks.length === 0 ? (
          <p className="text-white/80 text-sm text-center py-6">No tasks in progress</p>
        ) : (
          inProgressTasks.map((task, index) => {
            const workstream = workstreams.find((w) => w.id === task.workstream_id)

            return (
              <div
                key={task.id}
                className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-white font-bold text-sm flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm font-semibold text-gray-900 break-words leading-snug">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-600 break-words line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {workstream && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border"
                          style={{
                            backgroundColor: `${workstream.color}20`,
                            color: workstream.color,
                            borderColor: `${workstream.color}50`,
                          }}
                        >
                          <span>{workstream.icon}</span>
                          <span>{workstream.name}</span>
                        </span>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-300 bg-white font-bold text-sm text-gray-700">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>Due {format(new Date(task.due_date), "MMM d")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
