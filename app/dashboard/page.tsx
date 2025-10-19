"use client"

import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { useAppStore } from "@/lib/store"

export default function DashboardPage() {
  const workstreams = useAppStore((state) => state.workstreams)
  const tasks = useAppStore((state) => state.tasks)

  // Add workstream data to tasks
  const tasksWithWorkstreams = tasks.map((task) => ({
    ...task,
    workstream: workstreams.find((w) => w.id === task.workstream_id),
  }))

  return <DashboardClient initialWorkstreams={workstreams} initialTasks={tasksWithWorkstreams} />
}
