import type { Task, Email, TriageItem } from "./types"
import type { FilterState } from "@/components/filters/advanced-filter-panel"
import { isWithinInterval, startOfDay, endOfDay } from "date-fns"

export function applyTaskFilters(tasks: Task[], filters: FilterState): Task[] {
  let filtered = tasks

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (task) => task.title.toLowerCase().includes(searchLower) || task.description?.toLowerCase().includes(searchLower),
    )
  }

  // Workstream filter
  if (filters.workstreamIds.length > 0) {
    filtered = filtered.filter((task) => filters.workstreamIds.includes(task.workstream_id))
  }

  // Project filter
  if (filters.projectIds.length > 0) {
    filtered = filtered.filter((task) => task.project_id && filters.projectIds.includes(task.project_id))
  }

  // Class filter
  if (filters.classIds.length > 0) {
    filtered = filtered.filter((task) => task.class_id && filters.classIds.includes(task.class_id))
  }

  // Priority filter
  if (filters.priorities.length > 0) {
    filtered = filtered.filter((task) => filters.priorities.includes(task.priority))
  }

  // Status filter
  if (filters.statuses.length > 0) {
    filtered = filtered.filter((task) => filters.statuses.includes(task.status))
  }

  // Due date range filter
  if (filters.dueDateFrom || filters.dueDateTo) {
    filtered = filtered.filter((task) => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)

      if (filters.dueDateFrom && filters.dueDateTo) {
        return isWithinInterval(dueDate, {
          start: startOfDay(filters.dueDateFrom),
          end: endOfDay(filters.dueDateTo),
        })
      } else if (filters.dueDateFrom) {
        return dueDate >= startOfDay(filters.dueDateFrom)
      } else if (filters.dueDateTo) {
        return dueDate <= endOfDay(filters.dueDateTo)
      }
      return true
    })
  }

  // Has comments filter
  if (filters.hasComments === true) {
    filtered = filtered.filter((task) => task.comments && task.comments.length > 0)
  }

  // Has Canvas filter
  if (filters.hasCanvas === true) {
    filtered = filtered.filter((task) => task.canvas_assignment_id || task.canvas_url)
  }

  return filtered
}

export function applyEmailFilters(emails: Email[], filters: FilterState): Email[] {
  let filtered = emails

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (email) =>
        email.subject.toLowerCase().includes(searchLower) ||
        email.snippet?.toLowerCase().includes(searchLower) ||
        email.from_name?.toLowerCase().includes(searchLower) ||
        email.from_address.toLowerCase().includes(searchLower),
    )
  }

  // Workstream filter
  if (filters.workstreamIds.length > 0) {
    filtered = filtered.filter((email) => email.workstream_id && filters.workstreamIds.includes(email.workstream_id))
  }

  // Project filter
  if (filters.projectIds.length > 0) {
    filtered = filtered.filter((email) => email.project_id && filters.projectIds.includes(email.project_id))
  }

  // Class filter
  if (filters.classIds.length > 0) {
    filtered = filtered.filter((email) => email.class_id && filters.classIds.includes(email.class_id))
  }

  // Priority filter
  if (filters.priorities.length > 0) {
    filtered = filtered.filter((email) => email.priority && filters.priorities.includes(email.priority))
  }

  // Status filter
  if (filters.statuses.length > 0) {
    filtered = filtered.filter((email) => filters.statuses.includes(email.status))
  }

  // Due date range filter
  if (filters.dueDateFrom || filters.dueDateTo) {
    filtered = filtered.filter((email) => {
      if (!email.due_date) return false
      const dueDate = new Date(email.due_date)

      if (filters.dueDateFrom && filters.dueDateTo) {
        return isWithinInterval(dueDate, {
          start: startOfDay(filters.dueDateFrom),
          end: endOfDay(filters.dueDateTo),
        })
      } else if (filters.dueDateFrom) {
        return dueDate >= startOfDay(filters.dueDateFrom)
      } else if (filters.dueDateTo) {
        return dueDate <= endOfDay(filters.dueDateTo)
      }
      return true
    })
  }

  // Has comments filter
  if (filters.hasComments === true) {
    filtered = filtered.filter((email) => email.comments && email.comments.length > 0)
  }

  return filtered
}

export function applyTriageFilters(items: TriageItem[], filters: FilterState): TriageItem[] {
  let filtered = items

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.course_name?.toLowerCase().includes(searchLower),
    )
  }

  // Priority filter
  if (filters.priorities.length > 0) {
    filtered = filtered.filter((item) => item.priority && filters.priorities.includes(item.priority))
  }

  // Due date range filter
  if (filters.dueDateFrom || filters.dueDateTo) {
    filtered = filtered.filter((item) => {
      if (!item.due_date) return false
      const dueDate = new Date(item.due_date)

      if (filters.dueDateFrom && filters.dueDateTo) {
        return isWithinInterval(dueDate, {
          start: startOfDay(filters.dueDateFrom),
          end: endOfDay(filters.dueDateTo),
        })
      } else if (filters.dueDateFrom) {
        return dueDate >= startOfDay(filters.dueDateFrom)
      } else if (filters.dueDateTo) {
        return dueDate <= endOfDay(filters.dueDateTo)
      }
      return true
    })
  }

  // Has Canvas filter
  if (filters.hasCanvas === true) {
    filtered = filtered.filter((item) => item.canvas_id || item.canvas_url)
  }

  return filtered
}
