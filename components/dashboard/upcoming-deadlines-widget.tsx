"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { Calendar } from "lucide-react"
import { format, isAfter, isBefore, addDays } from "date-fns"
import { useMemo } from "react"

export function UpcomingDeadlinesWidget() {
  const tasks = useAppStore((state) => state.tasks)
  const canvasAssignments = useAppStore((state) => state.canvasAssignments)
  const classes = useAppStore((state) => state.classes)

  const getClassColor = (courseCode: string | undefined) => {
    if (!courseCode) {
      return "bg-gray-100/60 text-gray-700 border-gray-300"
    }

    // Extract just the course code part (first two words: department + number)
    // e.g., "ACCT 320 1 Federal Taxation - Fall 2025" -> "ACCT 320"
    const courseCodeMatch = courseCode.match(/^([A-Z]+)\s*(\d+)/)
    const extractedCode = courseCodeMatch
      ? `${courseCodeMatch[1]}${courseCodeMatch[2]}`
      : courseCode.replace(/[\s-]/g, "")
    const normalizedCode = extractedCode.toUpperCase()

    const colorMap: Record<string, string> = {
      ISOM230: "bg-[#F4B3B3]/70 text-[#6E1313] border-[#F4B3B3]", // Light pink - very distinctive
      SBS400: "bg-[#002028]/60 text-white border-[#002028]", // Dark teal - completely different color family
      BLE214: "bg-[#6E1313]/60 text-white border-[#6E1313]", // Bright crimson red
      ACCT431: "bg-[#b0a598]/70 text-[#3d2d27] border-[#b0a598]", // Light beige/taupe
      ACCT320: "bg-[#802423]/60 text-white border-[#802423]", // Dark burgundy
      ACCT520: "bg-[#7e6c61]/70 text-white border-[#7e6c61]", // Medium brown-gray
    }

    return colorMap[normalizedCode] || "bg-[#b0a598]/60 text-[#3d2d27] border-[#b0a598]"
  }

  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    const nextTwoWeeks = addDays(now, 14)

    const taskDeadlines = tasks
      .filter((t) => t.due_date && t.status !== "completed")
      .filter((t) => {
        const dueDate = new Date(t.due_date!)
        return isAfter(dueDate, now) && isBefore(dueDate, nextTwoWeeks)
      })
      .map((t) => {
        const taskClass = t.class_id ? classes.find((c) => c.id === t.class_id) : undefined
        return {
          id: t.id,
          title: t.title,
          due_date: t.due_date!,
          type: "task" as const,
          courseCode: taskClass?.course_code,
        }
      })

    const assignmentDeadlines = canvasAssignments
      .filter((a) => a.due_date && a.status !== "completed")
      .filter((a) => {
        const dueDate = new Date(a.due_date!)
        return isAfter(dueDate, now) && isBefore(dueDate, nextTwoWeeks)
      })
      .map((a) => ({
        id: a.id,
        title: a.title,
        due_date: a.due_date!,
        type: "assignment" as const,
        courseCode: a.course_code,
      }))

    return [...taskDeadlines, ...assignmentDeadlines]
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 10)
  }, [tasks, canvasAssignments, classes])

  return (
    <Card className="bg-[oklch(0.55_0.08_300)] border border-gray-300 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-white font-bold text-lg tracking-wide uppercase">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingDeadlines.length === 0 ? (
          <p className="text-white/80 text-sm text-center py-6">No upcoming deadlines</p>
        ) : (
          upcomingDeadlines.map((item, index) => {
            const dueDate = new Date(item.due_date)

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-white font-bold text-sm flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm font-semibold text-gray-900 break-words leading-snug">{item.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.courseCode && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getClassColor(item.courseCode)}`}
                        >
                          {item.courseCode}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-300 bg-white font-bold text-sm text-gray-700">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{format(dueDate, "MMM d, yyyy")}</span>
                      </div>
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
