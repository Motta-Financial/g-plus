export async function POST(request: Request) {
  try {
    const { apiKey, canvasUrl } = await request.json()

    if (!apiKey || !canvasUrl) {
      return Response.json({ error: "API key and Canvas URL are required" }, { status: 400 })
    }

    // Fetch courses from Canvas API
    const response = await fetch(`${canvasUrl}/api/v1/courses?enrollment_state=active&per_page=100`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Canvas API error:", errorText)
      return Response.json({ error: `Canvas API error: ${response.statusText}` }, { status: response.status })
    }

    const courses = await response.json()

    // Transform Canvas courses to our class format
    const classes = courses.map((course: any) => ({
      id: course.id.toString(),
      name: course.name,
      course_code: course.course_code,
      workflow_state: course.workflow_state,
      start_at: course.start_at,
      end_at: course.end_at,
    }))

    return Response.json({ courses: classes })
  } catch (error) {
    console.error("[v0] Error fetching Canvas courses:", error)
    return Response.json({ error: "Failed to fetch courses from Canvas" }, { status: 500 })
  }
}
