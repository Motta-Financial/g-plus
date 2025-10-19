interface CanvasConfig {
  baseUrl: string
  apiToken: string
}

export class CanvasClient {
  private baseUrl: string
  private apiToken: string

  constructor(config: CanvasConfig) {
    this.baseUrl = config.baseUrl
    this.apiToken = config.apiToken
  }

  private async fetch(endpoint: string, options?: RequestInit) {
    const url = `${this.baseUrl}/api/v1${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getCourses() {
    return this.fetch("/courses?enrollment_state=active&per_page=100")
  }

  async getCourse(courseId: string) {
    return this.fetch(`/courses/${courseId}`)
  }

  async getAssignments(courseId: string) {
    return this.fetch(`/courses/${courseId}/assignments?per_page=100`)
  }

  async getUpcomingAssignments() {
    const courses = await this.getCourses()
    const allAssignments = []

    for (const course of courses) {
      try {
        const assignments = await this.getAssignments(course.id)
        const upcomingAssignments = assignments.filter((assignment: any) => {
          if (!assignment.due_at) return false
          const dueDate = new Date(assignment.due_at)
          return dueDate > new Date()
        })
        allAssignments.push(
          ...upcomingAssignments.map((assignment: any) => ({
            ...assignment,
            course_name: course.name,
            course_code: course.course_code,
          })),
        )
      } catch (error) {
        console.error(`Error fetching assignments for course ${course.id}:`, error)
      }
    }

    return allAssignments.sort((a: any, b: any) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
  }

  async getCalendarEvents(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date()
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    return this.fetch(`/calendar_events?start_date=${start.toISOString()}&end_date=${end.toISOString()}&per_page=100`)
  }
}

export function createCanvasClient(baseUrl: string, apiToken: string) {
  return new CanvasClient({ baseUrl, apiToken })
}
