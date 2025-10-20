"use client"

import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, X, ExternalLink, Bell, Sparkles, Mail, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import type { TaskPriority, Email, TriageItem } from "@/lib/types"
import { DndContext, type DragEndEvent, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core"
import { EmailDetailsDialog } from "@/components/triage/email-details-dialog"
import { BulkActionBar } from "@/components/bulk-actions/bulk-action-bar"
import { AdvancedFilterPanel, type FilterState } from "@/components/filters/advanced-filter-panel"
import { toast } from "sonner"

type TriageItemType = "email" | "canvas"

interface UnifiedTriageItem {
  id: string
  type: TriageItemType
  sourceType: "announcement" | "assignment" | "event" | "email"
  title: string
  description?: string
  from?: string
  course_code?: string
  course_name?: string
  received_at: string
  due_date?: string
  url?: string
  priority?: TaskPriority
  status: "pending" | "processed" | "dismissed"
  data: Email | TriageItem
}

export default function TriagePage() {
  const triageItems = useAppStore((state) => state.triageItems)
  const emails = useAppStore((state) => state.emails)
  const workstreams = useAppStore((state) => state.workstreams)
  const projects = useAppStore((state) => state.projects)
  const classes = useAppStore((state) => state.classes)
  const updateTriageItem = useAppStore((state) => state.updateTriageItem)
  const updateEmail = useAppStore((state) => state.updateEmail)
  const processTriageItem = useAppStore((state) => state.processTriageItem)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "emails" | "canvas">("all")
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    search: "",
    workstreamIds: [],
    projectIds: [],
    classIds: [],
    priorities: [],
    statuses: [],
    dueDateFrom: undefined,
    dueDateTo: undefined,
    hasComments: undefined,
    hasCanvas: undefined,
  })

  const unifiedItems = useMemo((): UnifiedTriageItem[] => {
    const canvasItems: UnifiedTriageItem[] = triageItems
      .filter((item) => item.status === "pending")
      .map((item) => ({
        id: `canvas-${item.id}`,
        type: "canvas" as const,
        sourceType: item.type,
        title: item.title,
        description: item.description,
        course_code: item.course_code,
        course_name: item.course_name,
        received_at: item.posted_at,
        due_date: item.due_date,
        url: item.canvas_url,
        priority: item.priority,
        status: item.status,
        data: item,
      }))

    const emailItems: UnifiedTriageItem[] = emails
      .filter((email) => email.status === "pending")
      .map((email) => ({
        id: `email-${email.id}`,
        type: "email" as const,
        sourceType: "email" as const,
        title: email.subject,
        description: email.snippet,
        from: email.from_name || email.from_address,
        received_at: email.received_at,
        due_date: email.due_date,
        priority: email.priority,
        status: email.status,
        data: email,
      }))

    return [...canvasItems, ...emailItems].sort(
      (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime(),
    )
  }, [triageItems, emails])

  const filteredItems = useMemo(() => {
    let items = unifiedItems

    if (activeTab === "emails") {
      items = items.filter((item) => item.type === "email")
    } else if (activeTab === "canvas") {
      items = items.filter((item) => item.type === "canvas")
    }

    // Apply search filter
    if (advancedFilters.search) {
      const searchLower = advancedFilters.search.toLowerCase()
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.from?.toLowerCase().includes(searchLower) ||
          item.course_name?.toLowerCase().includes(searchLower),
      )
    }

    // Apply priority filter
    if (advancedFilters.priorities.length > 0) {
      items = items.filter((item) => item.priority && advancedFilters.priorities.includes(item.priority))
    }

    // Apply due date filter
    if (advancedFilters.dueDateFrom || advancedFilters.dueDateTo) {
      items = items.filter((item) => {
        if (!item.due_date) return false
        const dueDate = new Date(item.due_date)

        if (advancedFilters.dueDateFrom && advancedFilters.dueDateTo) {
          return dueDate >= advancedFilters.dueDateFrom && dueDate <= advancedFilters.dueDateTo
        } else if (advancedFilters.dueDateFrom) {
          return dueDate >= advancedFilters.dueDateFrom
        } else if (advancedFilters.dueDateTo) {
          return dueDate <= advancedFilters.dueDateTo
        }
        return true
      })
    }

    // Apply Canvas filter
    if (advancedFilters.hasCanvas === true) {
      items = items.filter((item) => item.type === "canvas")
    }

    return items
  }, [unifiedItems, activeTab, advancedFilters])

  const handleToggleSelection = (itemId: string) => {
    const newSelection = new Set(selectedItemIds)
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId)
    } else {
      newSelection.add(itemId)
    }
    setSelectedItemIds(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedItemIds.size === filteredItems.length) {
      setSelectedItemIds(new Set())
    } else {
      setSelectedItemIds(new Set(filteredItems.map((i) => i.id)))
    }
  }

  const handleBulkDismiss = () => {
    selectedItemIds.forEach((itemId) => {
      const item = unifiedItems.find((i) => i.id === itemId)
      if (item) {
        if (item.type === "canvas") {
          const canvasItem = item.data as TriageItem
          updateTriageItem(canvasItem.id, { status: "dismissed" })
        } else {
          const email = item.data as Email
          updateEmail(email.id, { status: "dismissed" })
        }
      }
    })
    toast.success(`Dismissed ${selectedItemIds.size} items`)
    setSelectedItemIds(new Set())
    setIsSelectionMode(false)
  }

  const handleBulkUpdatePriority = (priority: TaskPriority) => {
    selectedItemIds.forEach((itemId) => {
      const item = unifiedItems.find((i) => i.id === itemId)
      if (item) {
        if (item.type === "canvas") {
          const canvasItem = item.data as TriageItem
          processTriageItem(canvasItem.id, priority)
        } else {
          const email = item.data as Email
          updateEmail(email.id, { priority, status: "processed" })
        }
      }
    })
    toast.success(`Processed ${selectedItemIds.size} items`)
    setSelectedItemIds(new Set())
    setIsSelectionMode(false)
  }

  const handleDismiss = (item: UnifiedTriageItem) => {
    if (item.type === "canvas") {
      const canvasItem = item.data as TriageItem
      updateTriageItem(canvasItem.id, { status: "dismissed" })
    } else {
      const email = item.data as Email
      updateEmail(email.id, { status: "dismissed" })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const priority = over.id as TaskPriority
    const itemId = active.id as string
    const item = unifiedItems.find((i) => i.id === itemId)

    if (!item) return

    if (item.type === "canvas") {
      const canvasItem = item.data as TriageItem
      processTriageItem(canvasItem.id, priority)
    } else {
      const email = item.data as Email
      updateEmail(email.id, { priority, status: "processed" })
    }
  }

  const getTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case "announcement":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "assignment":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "event":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "email":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const activeItem = unifiedItems.find((item) => item.id === activeId)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-cyan-400" />
              <h1 className="text-4xl font-light tracking-wide text-balance">Triage</h1>
            </div>
            <p className="text-muted-foreground text-pretty max-w-2xl">
              Central hub for all incoming communications and assignments. Drag items to priority zones or click to
              manage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSelectionMode && (
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedItemIds.size === filteredItems.length ? "Deselect All" : "Select All"}
              </Button>
            )}
            <Button
              variant={isSelectionMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsSelectionMode(!isSelectionMode)
                setSelectedItemIds(new Set())
              }}
            >
              {isSelectionMode ? "Cancel Selection" : "Select Multiple"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6 fashion-card">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Pending</p>
            <p className="text-3xl font-light mt-2">{unifiedItems.length}</p>
          </Card>
          <Card className="p-6 fashion-card">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Emails</p>
            <p className="text-3xl font-light mt-2">{unifiedItems.filter((i) => i.type === "email").length}</p>
          </Card>
          <Card className="p-6 fashion-card">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Announcements</p>
            <p className="text-3xl font-light mt-2">
              {unifiedItems.filter((i) => i.sourceType === "announcement").length}
            </p>
          </Card>
          <Card className="p-6 fashion-card">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Assignments</p>
            <p className="text-3xl font-light mt-2">
              {unifiedItems.filter((i) => i.sourceType === "assignment").length}
            </p>
          </Card>
        </div>

        <AdvancedFilterPanel
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          workstreams={workstreams}
          projects={projects}
          classes={classes}
          showProjects={false}
          showClasses={false}
          showStatus={false}
        />

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            <DndContext onDragEnd={handleDragEnd} onDragStart={(event) => setActiveId(event.active.id as string)}>
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <PriorityDropZone priority="big_rock" label="Big Rock" color="text-red-400" />
                <PriorityDropZone priority="medium_rock" label="Medium Rock" color="text-yellow-400" />
                <PriorityDropZone priority="small_rock" label="Small Rock" color="text-green-400" />
              </div>

              <div className="space-y-4">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <DraggableTriageItem
                      key={item.id}
                      item={item}
                      onDismiss={handleDismiss}
                      onEmailClick={(email) => setSelectedEmail(email)}
                      getTypeColor={getTypeColor}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedItemIds.has(item.id)}
                      onToggleSelection={handleToggleSelection}
                    />
                  ))
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
                      <Badge variant="outline" className={getTypeColor(activeItem.sourceType)}>
                        {activeItem.sourceType}
                      </Badge>
                      <h3 className="text-lg font-light">{activeItem.title}</h3>
                    </div>
                  </Card>
                ) : null}
              </DragOverlay>
            </DndContext>
          </TabsContent>
        </Tabs>

        <BulkActionBar
          selectedCount={selectedItemIds.size}
          onClearSelection={() => {
            setSelectedItemIds(new Set())
            setIsSelectionMode(false)
          }}
          onUpdatePriority={handleBulkUpdatePriority}
          onDelete={handleBulkDismiss}
          workstreams={workstreams}
          projects={projects}
          classes={classes}
          showWorkstream={false}
          showProject={false}
          showClass={false}
          showStatus={false}
          showArchive={false}
        />
      </div>

      {selectedEmail && <EmailDetailsDialog email={selectedEmail} onClose={() => setSelectedEmail(null)} />}
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

function DraggableTriageItem({
  item,
  onDismiss,
  onEmailClick,
  getTypeColor,
  isSelectionMode,
  isSelected,
  onToggleSelection,
}: {
  item: UnifiedTriageItem
  onDismiss: (item: UnifiedTriageItem) => void
  onEmailClick: (email: Email) => void
  getTypeColor: (type: string) => string
  isSelectionMode: boolean
  isSelected: boolean
  onToggleSelection: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: isSelectionMode,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleSelection(item.id)
    } else if (item.type === "email") {
      onEmailClick(item.data as Email)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-6 space-y-4 fashion-card ${!isSelectionMode && (isDragging ? "cursor-grabbing" : "cursor-grab")} ${
        item.type === "email" && !isSelectionMode ? "hover:border-rose-400/50" : ""
      } ${isSelected ? "border-cyan-400/50 bg-cyan-400/5" : ""} ${isSelectionMode ? "cursor-pointer" : ""}`}
      {...(!isSelectionMode ? listeners : {})}
      {...(!isSelectionMode ? attributes : {})}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {isSelectionMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(item.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}

          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className={getTypeColor(item.sourceType)}>
                {item.type === "email" ? <Mail className="h-3 w-3 mr-1" /> : <CalendarIcon className="h-3 w-3 mr-1" />}
                {item.sourceType}
              </Badge>
              {item.course_code && (
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  {item.course_code}
                </Badge>
              )}
            </div>

            <div>
              <h3 className="text-lg font-light tracking-wide">{item.title}</h3>
              {item.from && <p className="text-sm text-muted-foreground">From: {item.from}</p>}
              {item.course_name && <p className="text-sm text-muted-foreground">{item.course_name}</p>}
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
              <span>Received {format(new Date(item.received_at), "MMM d, yyyy")}</span>
              {item.due_date && <span>Due {format(new Date(item.due_date), "MMM d, yyyy")}</span>}
              {item.url && (
                <a
                  href={item.url}
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
        </div>

        {!isSelectionMode && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDismiss(item)
            }}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Dismiss
          </Button>
        )}
      </div>
    </Card>
  )
}
