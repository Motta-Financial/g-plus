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

    return NextResponse.json({
      success: true,
      data: {
        courses,
        assignments,
        events: calendarEvents,
      },
    })
  } catch (error) {
    console.error("[v0] Canvas sync error:", error)
    return NextResponse.json({ error: "Failed to sync Canvas data" }, { status: 500 })
  }
}
