import { NextResponse } from "next/server"
import { createCanvasClient } from "@/lib/canvas/client"

export async function POST(request: Request) {
  try {
    const { canvasApiToken, canvasBaseUrl } = await request.json()

    if (!canvasApiToken) {
      return NextResponse.json({ error: "Canvas API token not provided" }, { status: 400 })
    }

    const canvas = createCanvasClient(canvasBaseUrl || "https://canvas.suffolk.edu", canvasApiToken)

    // Fetch courses
    const courses = await canvas.getCourses()

    // Fetch assignments
    const assignments = await canvas.getUpcomingAssignments()

    // Fetch calendar events
    const calendarEvents = await canvas.getCalendarEvents()

    const announcements = await canvas.getAllAnnouncements()

    const triageItems = [
      ...announcements.map((announcement: any) => ({
        type: "announcement" as const,
        canvas_id: announcement.id.toString(),
        course_id: announcement.context_code?.replace("course_", "") || "",
        course_code: announcement.course_code,
        course_name: announcement.course_name,
        title: announcement.title,
        description: announcement.message,
        posted_at: announcement.posted_at,
        canvas_url: `${canvasBaseUrl}/courses/${announcement.context_code?.replace("course_", "")}/discussion_topics/${announcement.id}`,
        status: "pending" as const,
      })),
      ...assignments.map((assignment: any) => ({
        type: "assignment" as const,
        canvas_id: assignment.id.toString(),
        course_id: assignment.course_id?.toString() || "",
        course_code: assignment.course_code,
        course_name: assignment.course_name,
        title: assignment.name,
        description: assignment.description,
        due_date: assignment.due_at,
        posted_at: assignment.created_at,
        canvas_url: `${canvasBaseUrl}/courses/${assignment.course_id}/assignments/${assignment.id}`,
        status: "pending" as const,
      })),
    ]

    return NextResponse.json({
      success: true,
      data: {
        courses,
        assignments,
        events: calendarEvents,
        announcements,
        triageItems,
      },
    })
  } catch (error) {
    console.error("[v0] Canvas sync error:", error)
    return NextResponse.json({ error: "Failed to sync Canvas data" }, { status: 500 })
  }
}
