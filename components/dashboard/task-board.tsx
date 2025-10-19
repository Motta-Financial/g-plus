"use client"

import { useState } from "react"
import type { Task, Workstream } from "@/lib/types"
import { TaskCard } from "./task-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

interface TaskBoardProps {
  tasks: Task[]
  viewMode: "priority" | "project" | "time"
  onTasksChange?: (tasks: Task[]) => void
  workstreams: Workstream[]
}

export function TaskBoard({ tasks, viewMode, onTasksChange, workstreams }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1 && onTasksChange) {
      const newTasks = [...tasks]
      const [movedTask] = newTasks.splice(oldIndex, 1)
      newTasks.splice(newIndex, 0, movedTask)
      onTasksChange(newTasks)
    }
  }

  const bigRocks = tasks.filter((t) => t.priority === "big_rock" && t.status !== "completed")
  const mediumRocks = tasks.filter((t) => t.priority === "medium_rock" && t.status !== "completed")
  const smallRocks = tasks.filter((t) => t.priority === "small_rock" && t.status !== "completed")

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <PriorityColumn title="Big Rocks" tasks={bigRocks} color="bg-red-500" workstreams={workstreams} />
        <PriorityColumn title="Medium Rocks" tasks={mediumRocks} color="bg-amber-500" workstreams={workstreams} />
        <PriorityColumn title="Small Rocks" tasks={smallRocks} color="bg-emerald-500" workstreams={workstreams} />
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} isDragging /> : null}</DragOverlay>
    </DndContext>
  )
}

interface PriorityColumnProps {
  title: string
  tasks: Task[]
  color: string
  workstreams: Workstream[]
}

function PriorityColumn({ title, tasks, color, workstreams }: PriorityColumnProps) {
  return (
    <Card className="luxury-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-light text-xl tracking-wide">
          <div className={`h-3 w-3 rounded-full ${color}`} />
          {title}
          <span className="text-sm font-normal text-muted-foreground">({tasks.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No tasks yet</p>
            ) : (
              tasks.map((task) => <TaskCard key={task.id} task={task} workstreams={workstreams} />)
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}
