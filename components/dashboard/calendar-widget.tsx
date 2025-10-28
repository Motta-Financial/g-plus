"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { Calendar } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns"
import { useMemo } from "react"

export function CalendarWidget() {
  const tasks = useAppStore((state) => state.tasks)

  const weekDays = useMemo(() => {
    const now = new Date()
    const start = startOfWeek(now)
    const end = endOfWeek(now)
    return eachDayOfInterval({ start, end })
  }, [])

  const tasksThisWeek = useMemo(() => {
    const start = startOfWeek(new Date())
    const end = endOfWeek(new Date())

    return tasks.filter((t) => {
      if (!t.due_date || t.status === "completed") return false
      const dueDate = new Date(t.due_date)
      return dueDate >= start && dueDate <= end
    })
  }, [tasks])

  return (
    <Card className="bg-[oklch(0.55_0.08_300)] border border-gray-300 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-white font-bold text-base tracking-wide uppercase flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day) => {
            const dayTasks = tasksThisWeek.filter((t) => {
              if (!t.due_date) return false
              return format(new Date(t.due_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
            })
            const today = isToday(day)

            return (
              <div key={day.toISOString()} className="text-center">
                <div className="text-white/90 text-xs font-medium mb-1">{format(day, "EEE")}</div>
                <div
                  className={`w-full aspect-square rounded-md border flex items-center justify-center text-sm font-semibold ${
                    today
                      ? "bg-white border-gray-800 border-2"
                      : dayTasks.length > 0
                        ? "bg-yellow-100 border-yellow-300"
                        : "bg-white/90 border-gray-200"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            )
          })}
        </div>

        {tasksThisWeek.length > 0 && (
          <div className="space-y-2 mt-3">
            <p className="text-white/90 text-xs font-medium uppercase">This Week's Tasks</p>
            {tasksThisWeek.slice(0, 3).map((task) => (
              <div key={task.id} className="bg-white p-2.5 rounded-md border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-900 truncate">{task.title}</p>
                {task.due_date && (
                  <p className="text-xs text-gray-600 mt-0.5">{format(new Date(task.due_date), "MMM d")}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
