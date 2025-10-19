"use client"

import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X, ExternalLink, Bell, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import type { TaskPriority } from "@/lib/types"
import { DndContext, type DragEndEvent, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core"

export default function TriagePage() {
  const triageItems = useAppStore((state) => state.triageItems)
  const updateTriageItem = useAppStore((state) => state.updateTriageItem)
  const deleteTriageItem = useAppStore((state) => state.deleteTriageItem)
  const processTriageItem = useAppStore((state) => state.processTriageItem)
  const [activeId, setActiveId] = useState<string | null>(null)

  const pendingItems = triageItems.filter((item) => item.status === "pending")

  const handleDismiss = (itemId: string) => {
    updateTriageItem(itemId, { status: "dismissed" })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const priority = over.id as TaskPriority
    const triageItemId = active.id as string

    // Process the triage item and create a task with the assigned priority
    processTriageItem(triageItemId, priority)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "assignment":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "event":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const activeItem = pendingItems.find((item) => item.id === activeId)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-cyan-400" />
              <h1 className="text-4xl font-light tracking-wide text-balance">Canvas Triage</h1>
            </div>
            <p className="text-muted-foreground text-pretty max-w-2xl">
              Drag items to priority zones to auto-create tasks, or dismiss items you don't need.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 fashion-card">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Pending Items</p>
            <p className="text-3xl font-light mt-2">{pendingItems.length}</p>
          </Card>
          <Card className="p-6 fashion-card">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Announcements</p>
            <p className="text-3xl font-light mt-2">
              {pendingItems.filter((item) => item.type === "announcement").length}
            </p>
          </Card>
          <Card className="p-6 fashion-card">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Assignments</p>
            <p className="text-3xl font-light mt-2">
              {pendingItems.filter((item) => item.type === "assignment").length}
            </p>
          </Card>
        </div>

        <DndContext onDragEnd={handleDragEnd} onDragStart={(event) => setActiveId(event.active.id as string)}>
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <PriorityDropZone priority="big_rock" label="Big Rock" color="text-red-400" />
            <PriorityDropZone priority="medium_rock" label="Medium Rock" color="text-yellow-400" />
            <PriorityDropZone priority="small_rock" label="Small Rock" color="text-green-400" />
          </div>

          {/* Triage Items */}
          <div className="space-y-4">
            {pendingItems.length > 0 ? (
              pendingItems.map((item) => <DraggableTriageItem key={item.id} item={item} onDismiss={handleDismiss} />)
            ) : (
              <Card className="p-12 text-center fashion-card">
                <CheckCircle2 className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <p className="text-lg font-light">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-2">No pending items to review.</p>
              </Card>
            )}
          </div>

          <DragOverlay>
            {activeItem ? (
              <Card className="p-6 fashion-card opacity-80 cursor-grabbing">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className={getTypeColor(activeItem.type)}>
                    {activeItem.type}
                  </Badge>
                  <h3 className="text-lg font-light">{activeItem.title}</h3>
                </div>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </DashboardLayout>
  )
}

function PriorityDropZone({ priority, label, color }: { priority: TaskPriority; label: string; color: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: priority })

  return (
    <div
      ref={setNodeRef}
      className={`p-6 border-2 border-dashed rounded-lg transition-all ${
        isOver ? "border-cyan-400 bg-cyan-400/5 scale-105" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2">
        <Sparkles className={`h-5 w-5 ${color}`} />
        <p className={`font-light tracking-wide ${color}`}>{label}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Drop items here to create tasks</p>
    </div>
  )
}

function DraggableTriageItem({ item, onDismiss }: { item: any; onDismiss: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined

  const getTypeColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "assignment":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "event":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-6 space-y-4 fashion-card ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className={getTypeColor(item.type)}>
              {item.type}
            </Badge>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              {item.course_code}
            </Badge>
          </div>

          <div>
            <h3 className="text-lg font-light tracking-wide">{item.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{item.course_name}</p>
          </div>

          {item.description && (
            <div
              className="text-sm text-muted-foreground prose prose-sm max-w-none line-clamp-3"
              dangerouslySetInnerHTML={{
                __html: item.description.substring(0, 200) + (item.description.length > 200 ? "..." : ""),
              }}
            />
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Posted {format(new Date(item.posted_at), "MMM d, yyyy")}</span>
            {item.due_date && <span>Due {format(new Date(item.due_date), "MMM d, yyyy")}</span>}
            {item.canvas_url && (
              <a
                href={item.canvas_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                View in Canvas
              </a>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss(item.id)
          }}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Dismiss
        </Button>
      </div>
    </Card>
  )
}
