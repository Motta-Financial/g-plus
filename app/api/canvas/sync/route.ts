import { NextResponse } from "next/server"
import { createCanvasClient } from "@/lib/canvas/client"

export async function POST(request: Request) {
  try {
    const { canvasApiToken, canvasBaseUrl } = await request.json()

    if (!canvasApiToken) {
      return NextResponse.json({ error: "Canvas API token not provided" }, { status: 400 })
    }

    const canvas = createCanvasClient(canvasBaseUrl || "https://canvas.suffolk.edu", canvasApiToken)

    console.log("[v0] Fetching Canvas data...")

    // Fetch courses
    const courses = await canvas.getCourses()
    console.log("[v0] Fetched courses:", courses.length)

    // Fetch assignments
    const assignments = await canvas.getUpcomingAssignments()
    console.log("[v0] Fetched assignments:", assignments.length)

    // Fetch calendar events
    const calendarEvents = await canvas.getCalendarEvents()

    const announcements = await canvas.getAllAnnouncements()
    console.log("[v0] Fetched announcements:", announcements.length)

    // Format courses
    const formattedCourses = courses.map((course: any) => ({
      id: course.id.toString(),
      name: course.name,
      course_code: course.course_code,
      enrollment_state: course.enrollment_state || "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // Format Canvas assignments (not triage items)
    const canvasAssignments = [
      ...assignments.map((assignment: any) => ({
        canvas_id: assignment.id.toString(),
        type: "assignment" as const,
        course_id: assignment.course_id?.toString() || "",
        course_code: assignment.course_code || "",
        course_name: assignment.course_name || "",
        title: assignment.name,
        description: assignment.description || "",
        due_date: assignment.due_at,
        canvas_url: `${canvasBaseUrl}/courses/${assignment.course_id}/assignments/${assignment.id}`,
        posted_at: assignment.created_at,
      })),
      ...announcements.map((announcement: any) => ({
        canvas_id: announcement.id.toString(),
        type: "announcement" as const,
        course_id: announcement.context_code?.replace("course_", "") || "",
        course_code: announcement.course_code || "",
        course_name: announcement.course_name || "",
        title: announcement.title,
        description: announcement.message || "",
        due_date: null,
        canvas_url: `${canvasBaseUrl}/courses/${announcement.context_code?.replace("course_", "")}/discussion_topics/${announcement.id}`,
        posted_at: announcement.posted_at,
      })),
    ]

    console.log("[v0] Formatted Canvas assignments:", canvasAssignments.length)

    return NextResponse.json({
      success: true,
      data: {
        courses: formattedCourses,
        canvasAssignments,
        assignments,
        events: calendarEvents,
        announcements,
      },
    })
  } catch (error) {
    console.error("[v0] Canvas sync error:", error)
    return NextResponse.json({ error: "Failed to sync Canvas data" }, { status: 500 })
  }
}
