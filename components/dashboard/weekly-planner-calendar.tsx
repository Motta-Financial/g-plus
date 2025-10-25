"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  BookOpen,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
  addWeeks,
  differenceInMinutes,
} from "date-fns"
import { useMemo, useState, useRef, useEffect } from "react"
import type { Task, CanvasAssignment } from "@/lib/types"

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5) // 5 AM to 11 PM
const HOUR_HEIGHT = 80 // Height of each hour slot in pixels
const SNAP_MINUTES = 15 // Snap to 15-minute intervals

const CLASS_COLORS = [
  { bg: "bg-[#802423]", border: "border-[#802423]", text: "text-white", hover: "hover:bg-[#6a1e1d]" },
  { bg: "bg-[#440000]", border: "border-[#440000]", text: "text-white", hover: "hover:bg-[#330000]" },
  { bg: "bg-[#6E1313]", border: "border-[#6E1313]", text: "text-white", hover: "hover:bg-[#5a0f0f]" },
  { bg: "bg-[#002028]", border: "border-[#002028]", text: "text-white", hover: "hover:bg-[#001a1f]" },
  { bg: "bg-[#7e6c61]", border: "border-[#7e6c61]", text: "text-white", hover: "hover:bg-[#6b5a50]" },
  { bg: "bg-[#F4B3B3]", border: "border-[#F4B3B3]", text: "text-gray-900", hover: "hover:bg-[#f0a0a0]" },
]

interface ResizePreview {
  id: string
  type: "task" | "assignment"
  startTime: Date
  endTime: Date
}

type SchedulableItem = (Task & { itemType: "task" }) | (CanvasAssignment & { itemType: "assignment" })

export function WeeklyPlannerCalendar() {
  const tasks = useAppStore((state) => state.tasks)
  const canvasAssignments = useAppStore((state) => state.canvasAssignments)
  const workstreams = useAppStore((state) => state.workstreams)
  const classes = useAppStore((state) => state.classes)
  const updateTask = useAppStore((state) => state.updateTask)
  const updateCanvasAssignment = useAppStore((state) => state.updateCanvasAssignment)
  const [weekOffset, setWeekOffset] = useState(0)
  const [draggedItem, setDraggedItem] = useState<SchedulableItem | null>(null)
  const [resizingItem, setResizingItem] = useState<{ item: SchedulableItem; edge: "top" | "bottom" } | null>(null)
  const [resizePreview, setResizePreview] = useState<ResizePreview | null>(null)
  const [dragStartY, setDragStartY] = useState(0)
  const [previewPosition, setPreviewPosition] = useState<{
    day: Date
    startTime: Date
    endTime: Date
  } | null>(null)
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const calendarRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const weekDays = useMemo(() => {
    const now = new Date()
    const targetDate = addWeeks(now, weekOffset)
    const start = startOfWeek(targetDate)
    const end = endOfWeek(targetDate)
    return eachDayOfInterval({ start, end })
  }, [weekOffset])

  const scheduledItems = useMemo(() => {
    const scheduledTasks: SchedulableItem[] = tasks
      .filter((t) => t.scheduled_time && t.status !== "completed")
      .map((t) => ({ ...t, itemType: "task" as const }))

    const scheduledAssignments: SchedulableItem[] = canvasAssignments
      .filter((a) => a.scheduled_time && a.status !== "completed" && a.type === "assignment")
      .map((a) => ({ ...a, itemType: "assignment" as const }))

    return [...scheduledTasks, ...scheduledAssignments]
  }, [tasks, canvasAssignments])

  const unscheduledItems = useMemo(() => {
    const unscheduledTasks: SchedulableItem[] = tasks
      .filter((t) => !t.scheduled_time && t.status !== "completed")
      .map((t) => ({ ...t, itemType: "task" as const }))

    const unscheduledAssignments: SchedulableItem[] = canvasAssignments
      .filter((a) => !a.scheduled_time && a.status !== "completed" && a.type === "assignment")
      .map((a) => ({ ...a, itemType: "assignment" as const }))

    return [...unscheduledTasks, ...unscheduledAssignments]
  }, [tasks, canvasAssignments])

  const inProgressItems = useMemo(() => {
    const thisWeekTasks: SchedulableItem[] = tasks
      .filter((t) => t.timeframe === "this_week" && t.status !== "completed")
      .map((t) => ({ ...t, itemType: "task" as const }))

    const thisWeekAssignments: SchedulableItem[] = canvasAssignments
      .filter((a) => a.type === "assignment" && a.status !== "completed")
      .map((a) => ({ ...a, itemType: "assignment" as const }))

    return [...thisWeekTasks, ...thisWeekAssignments]
  }, [tasks, canvasAssignments])

  const getItemsForDay = (day: Date) => {
    return scheduledItems.filter((item) => {
      if (!item.scheduled_time) return false
      const itemDate = parseISO(item.scheduled_time)
      return isSameDay(itemDate, day)
    })
  }

  const getItemLayout = (item: SchedulableItem, dayItems: SchedulableItem[]) => {
    if (!item.scheduled_time) return { column: 0, totalColumns: 1 }

    const itemStart = parseISO(item.scheduled_time)
    const itemEnd = item.scheduled_end_time
      ? parseISO(item.scheduled_end_time)
      : new Date(itemStart.getTime() + 60 * 60 * 1000)

    const overlappingItems = dayItems.filter((i) => {
      if (i.id === item.id || !i.scheduled_time) return false
      const iStart = parseISO(i.scheduled_time)
      const iEnd = i.scheduled_end_time ? parseISO(i.scheduled_end_time) : new Date(iStart.getTime() + 60 * 60 * 1000)
      return iStart < itemEnd && iEnd > itemStart
    })

    if (overlappingItems.length === 0) {
      return { column: 0, totalColumns: 1 }
    }

    const allItems = [item, ...overlappingItems].sort((a, b) => {
      const aStart = parseISO(a.scheduled_time!)
      const bStart = parseISO(b.scheduled_time!)
      if (aStart.getTime() !== bStart.getTime()) {
        return aStart.getTime() - bStart.getTime()
      }
      return a.id.localeCompare(b.id)
    })

    const column = allItems.findIndex((i) => i.id === item.id)
    const totalColumns = allItems.length

    return { column, totalColumns }
  }

  const getItemColor = (item: SchedulableItem) => {
    let workstreamId: string | undefined

    if (item.itemType === "task") {
      workstreamId = item.workstream_id
    } else {
      // For Canvas assignments, get workstream through class
      const itemClass = classes.find((c) => c.id === item.class_id)
      workstreamId = itemClass?.workstream_id
    }

    const workstream = workstreams.find((w) => w.id === workstreamId)

    if (!workstream) {
      // Default gray color if no workstream found
      return "bg-gray-200/30 border-gray-300/50 text-gray-900 hover:bg-gray-200/40"
    }

    // Convert hex color to RGB for opacity control
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
          }
        : { r: 156, g: 163, b: 175 } // Default gray
    }

    const rgb = hexToRgb(workstream.color)

    return `bg-[rgba(${rgb.r},${rgb.g},${rgb.b},0.25)] border-[rgba(${rgb.r},${rgb.g},${rgb.b},0.5)] text-gray-900 hover:bg-[rgba(${rgb.r},${rgb.g},${rgb.b},0.35)]`
  }

  const getItemStyle = (item: SchedulableItem, dayItems: SchedulableItem[]) => {
    if (!item.scheduled_time) return {}

    let startTime = parseISO(item.scheduled_time)
    let endTime = item.scheduled_end_time
      ? parseISO(item.scheduled_end_time)
      : new Date(startTime.getTime() + 60 * 60 * 1000)

    if (resizePreview && resizePreview.id === item.id && resizePreview.type === item.itemType) {
      startTime = resizePreview.startTime
      endTime = resizePreview.endTime
    }

    const startHour = startTime.getHours()
    const startMinute = startTime.getMinutes()
    const durationMinutes = differenceInMinutes(endTime, startTime)

    const topOffset = (startHour - 5) * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT
    const height = (durationMinutes / 60) * HOUR_HEIGHT

    const { column, totalColumns } = getItemLayout(item, dayItems)
    const columnWidth = 100 / totalColumns
    const leftPercent = column * columnWidth

    return {
      position: "absolute" as const,
      top: `${topOffset}px`,
      height: `${Math.max(height, 40)}px`,
      left: `${leftPercent}%`,
      width: `${columnWidth}%`,
      paddingLeft: column === 0 ? "4px" : "2px",
      paddingRight: column === totalColumns - 1 ? "4px" : "2px",
    }
  }

  const snapToGrid = (minutes: number) => {
    return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES
  }

  const handleDragStart = (e: React.DragEvent, item: SchedulableItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", item.id)
    if (e.dataTransfer.setDragImage && e.currentTarget instanceof HTMLElement) {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
      dragImage.style.opacity = "0.5"
      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, 0, 0)
      setTimeout(() => document.body.removeChild(dragImage), 0)
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null)
    setPreviewPosition(null)
    setHoveredDay(null)
  }

  const handleDayColumnDragOver = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"

    if (!draggedItem) return

    setHoveredDay(day)

    const calendarGrid = e.currentTarget.closest(".calendar-grid")
    if (!calendarGrid) return

    const gridRect = calendarGrid.getBoundingClientRect()
    const relativeY = e.clientY - gridRect.top

    const totalMinutesFromTop = (relativeY / HOUR_HEIGHT) * 60
    const snappedMinutes = snapToGrid(totalMinutesFromTop)
    const hour = Math.floor(snappedMinutes / 60) + 5
    const minute = snappedMinutes % 60

    const boundedHour = Math.max(5, Math.min(23, hour))
    const scheduledDateTime = setMinutes(setHours(day, boundedHour), minute)

    let scheduledEndTime: Date
    if (draggedItem.scheduled_time && draggedItem.scheduled_end_time) {
      const originalStart = parseISO(draggedItem.scheduled_time)
      const originalEnd = parseISO(draggedItem.scheduled_end_time)
      const durationMs = originalEnd.getTime() - originalStart.getTime()
      scheduledEndTime = new Date(scheduledDateTime.getTime() + durationMs)
    } else {
      scheduledEndTime = new Date(scheduledDateTime.getTime() + 60 * 60 * 1000)
    }

    setPreviewPosition({
      day,
      startTime: scheduledDateTime,
      endTime: scheduledEndTime,
    })
  }

  const handleDayColumnDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedItem || !previewPosition) return

    if (draggedItem.itemType === "task") {
      updateTask(draggedItem.id, {
        scheduled_time: previewPosition.startTime.toISOString(),
        scheduled_end_time: previewPosition.endTime.toISOString(),
      })
    } else {
      updateCanvasAssignment(draggedItem.id, {
        scheduled_time: previewPosition.startTime.toISOString(),
        scheduled_end_time: previewPosition.endTime.toISOString(),
        status: draggedItem.status || "todo",
      })
    }

    setDraggedItem(null)
    setPreviewPosition(null)
    setHoveredDay(null)
  }

  const handleResizeStart = (e: React.MouseEvent, item: SchedulableItem, edge: "top" | "bottom") => {
    e.stopPropagation()
    e.preventDefault()
    setResizingItem({ item, edge })
    setDragStartY(e.clientY)

    const startTime = parseISO(item.scheduled_time!)
    const endTime = item.scheduled_end_time
      ? parseISO(item.scheduled_end_time)
      : new Date(startTime.getTime() + 60 * 60 * 1000)
    setResizePreview({
      id: item.id,
      type: item.itemType,
      startTime,
      endTime,
    })
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingItem || !resizePreview) return

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      const deltaY = e.clientY - dragStartY
      const deltaMinutes = snapToGrid(Math.round((deltaY / HOUR_HEIGHT) * 60))

      if (deltaMinutes === 0) return

      const { item, edge } = resizingItem
      const { startTime, endTime } = resizePreview

      if (edge === "top") {
        const newStartTime = new Date(startTime.getTime() + deltaMinutes * 60 * 1000)
        if (newStartTime < endTime && differenceInMinutes(endTime, newStartTime) >= 15) {
          setResizePreview({
            id: item.id,
            type: item.itemType,
            startTime: newStartTime,
            endTime,
          })
          setDragStartY(e.clientY)
        }
      } else {
        const newEndTime = new Date(endTime.getTime() + deltaMinutes * 60 * 1000)
        if (newEndTime > startTime && differenceInMinutes(newEndTime, startTime) >= 15) {
          setResizePreview({
            id: item.id,
            type: item.itemType,
            startTime,
            endTime: newEndTime,
          })
          setDragStartY(e.clientY)
        }
      }
    })
  }

  const handleResizeEnd = () => {
    if (resizingItem && resizePreview) {
      if (resizingItem.item.itemType === "task") {
        updateTask(resizingItem.item.id, {
          scheduled_time: resizePreview.startTime.toISOString(),
          scheduled_end_time: resizePreview.endTime.toISOString(),
        })
      } else {
        updateCanvasAssignment(resizingItem.item.id, {
          scheduled_time: resizePreview.startTime.toISOString(),
          scheduled_end_time: resizePreview.endTime.toISOString(),
        })
      }
    }
    setResizingItem(null)
    setResizePreview(null)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const handleStatusChange = (item: SchedulableItem, newStatus: "todo" | "in_progress" | "completed") => {
    if (item.itemType === "task") {
      updateTask(item.id, { status: newStatus })
    } else {
      updateCanvasAssignment(item.id, { status: newStatus })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Circle className="h-3.5 w-3.5" />
      case "in_progress":
        return <Loader2 className="h-3.5 w-3.5" />
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5" />
      default:
        return <Circle className="h-3.5 w-3.5" />
    }
  }

  useEffect(() => {
    if (resizingItem) {
      document.addEventListener("mousemove", handleResizeMove)
      document.addEventListener("mouseup", handleResizeEnd)
      return () => {
        document.removeEventListener("mousemove", handleResizeMove)
        document.removeEventListener("mouseup", handleResizeEnd)
      }
    }
  }, [resizingItem, dragStartY, resizePreview])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const getPreviewStyle = () => {
    if (!previewPosition) return {}

    const startHour = previewPosition.startTime.getHours()
    const startMinute = previewPosition.startTime.getMinutes()
    const durationMinutes = differenceInMinutes(previewPosition.endTime, previewPosition.startTime)

    const topOffset = (startHour - 5) * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT
    const height = (durationMinutes / 60) * HOUR_HEIGHT

    return {
      position: "absolute" as const,
      top: `${topOffset}px`,
      height: `${Math.max(height, 40)}px`,
      left: "4px",
      right: "4px",
    }
  }

  const getCurrentTimePosition = () => {
    const now = currentTime
    const hour = now.getHours()
    const minute = now.getMinutes()

    // Only show if current time is within calendar hours (5 AM - 11 PM)
    if (hour < 5 || hour >= 23) return null

    const topOffset = (hour - 5) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT
    return topOffset
  }

  return (
    <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden p-0">
      <CardHeader className="py-8 bg-[#4a1942] border-b-0 m-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-bold text-3xl tracking-wide flex items-center gap-3">
            <Calendar className="h-7 w-7" />
            Weekly Planner
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-white text-lg font-semibold min-w-[180px] text-center">
              {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            {weekOffset !== 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWeekOffset(0)}
                className="text-white hover:bg-white/20 text-sm font-medium"
              >
                Today
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-auto" ref={calendarRef}>
          <div className="min-w-[900px]">
            <div className="grid grid-cols-8 border-b-2 border-gray-300 bg-white sticky top-0 z-10 shadow-sm">
              <div className="py-4 pb-12 px-4 border-r-2 border-gray-300 text-sm font-bold text-gray-700 uppercase tracking-wide">
                Time
              </div>
              {weekDays.map((day) => {
                const today = isToday(day)
                return (
                  <div
                    key={day.toISOString()}
                    className={`py-4 pb-12 px-4 border-r-2 border-gray-300 text-center transition-colors ${
                      today ? "bg-blue-50 border-blue-200" : "bg-white"
                    }`}
                  >
                    <div
                      className={`text-sm font-bold uppercase tracking-wider ${today ? "text-blue-600" : "text-gray-600"}`}
                    >
                      {format(day, "EEE")}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${today ? "text-blue-600" : "text-gray-900"}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="relative calendar-grid">
              {HOURS.map((hour, index) => (
                <div
                  key={hour}
                  className="grid grid-cols-8 border-b border-gray-200"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  <div className="p-3 border-r-2 border-gray-300 text-sm font-semibold text-gray-700 flex items-start bg-gray-50">
                    <Clock className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    {format(setHours(setMinutes(new Date(), 0), hour), "h:mm a")}
                  </div>
                  {weekDays.map((day) => {
                    const today = isToday(day)
                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className={`border-r border-gray-200 transition-colors ${
                          today ? "bg-blue-50/20" : index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      />
                    )
                  })}
                </div>
              ))}

              {(() => {
                const timePosition = getCurrentTimePosition()
                if (timePosition === null) return null

                const todayIndex = weekDays.findIndex((day) => isToday(day))
                if (todayIndex === -1) return null

                return (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${timePosition}px` }}
                  >
                    <div className="grid grid-cols-8">
                      <div className="flex items-center justify-end pr-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg" />
                      </div>
                      {weekDays.map((day, index) => (
                        <div key={day.toISOString()} className="relative">
                          {index === todayIndex && (
                            <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-md">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                                {format(currentTime, "h:mm a")}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-8 pointer-events-none">
                <div className="border-r-2 border-transparent pointer-events-none" />
                {weekDays.map((day) => {
                  const dayItems = getItemsForDay(day)
                  const showPreview = previewPosition && isSameDay(previewPosition.day, day)
                  const isHovered = hoveredDay && isSameDay(hoveredDay, day)

                  return (
                    <div
                      key={`items-${day.toISOString()}`}
                      className={`border-r border-transparent relative transition-all pointer-events-auto ${
                        isHovered && draggedItem ? "bg-blue-100/30 ring-2 ring-blue-400 ring-inset" : ""
                      }`}
                      onDragOver={(e) => handleDayColumnDragOver(e, day)}
                      onDrop={handleDayColumnDrop}
                      onDragLeave={() => {
                        if (hoveredDay && isSameDay(hoveredDay, day)) {
                          setHoveredDay(null)
                        }
                      }}
                    >
                      {showPreview && draggedItem && (
                        <div
                          className="bg-blue-200/50 border-2 border-blue-500 border-dashed rounded-xl backdrop-blur-sm shadow-lg"
                          style={getPreviewStyle()}
                        >
                          <div className="p-3 flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-blue-700 flex-shrink-0" />
                            <div className="text-sm font-bold truncate flex-1 text-blue-900">{draggedItem.title}</div>
                          </div>
                        </div>
                      )}

                      {dayItems.map((item) => {
                        const style = getItemStyle(item, dayItems)
                        const isDragging = draggedItem?.id === item.id
                        return (
                          <div
                            key={`${item.itemType}-${item.id}`}
                            className={`${getItemColor(item)} rounded-lg border cursor-move overflow-hidden group transition-all ${
                              isDragging ? "opacity-30 scale-95" : "hover:shadow-md hover:scale-[1.02] hover:z-30"
                            }`}
                            style={style}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                          >
                            <div
                              className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-black/5 flex items-center justify-center z-10"
                              onMouseDown={(e) => handleResizeStart(e, item, "top")}
                            >
                              <div className="w-12 h-0.5 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="p-2 flex flex-col gap-1 pt-4 pb-4">
                              <div className="flex items-start gap-1.5">
                                {item.itemType === "assignment" && (
                                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 opacity-70" />
                                )}
                                {getStatusIcon(item.status || "todo")}
                                <GripVertical className="h-3.5 w-3.5 flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity mt-0.5" />
                                <div className="text-xs font-semibold flex-1 break-words leading-tight line-clamp-2">
                                  {item.title}
                                </div>
                              </div>
                              {item.scheduled_time && (
                                <div className="text-[10px] font-medium ml-5 opacity-70 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(parseISO(item.scheduled_time), "h:mm a")} -{" "}
                                  {item.scheduled_end_time
                                    ? format(parseISO(item.scheduled_end_time), "h:mm a")
                                    : format(
                                        new Date(parseISO(item.scheduled_time).getTime() + 60 * 60 * 1000),
                                        "h:mm a",
                                      )}
                                </div>
                              )}
                            </div>

                            <div
                              className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-black/5 flex items-center justify-center z-10"
                              onMouseDown={(e) => handleResizeStart(e, item, "bottom")}
                            >
                              <div className="w-12 h-0.5 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t-2 border-gray-300 bg-gradient-to-b from-gray-50 to-white">
          <h3 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            Unscheduled Items
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {unscheduledItems.slice(0, 15).map((item) => (
              <div
                key={`${item.itemType}-${item.id}`}
                className={`text-xs px-2.5 py-1.5 rounded-md border ${getItemColor(item)} font-medium shadow-sm cursor-move hover:shadow-md transition-all flex items-center gap-1.5`}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
              >
                {item.itemType === "assignment" && <BookOpen className="h-3.5 w-3.5" />}
                <GripVertical className="h-3.5 w-3.5 opacity-50" />
                <span className="max-w-[200px] truncate">{item.title}</span>
              </div>
            ))}
            {unscheduledItems.length > 15 && (
              <div className="text-sm text-gray-600 px-3 py-2 font-medium">
                +{unscheduledItems.length - 15} more items
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t-2 border-gray-300 bg-gradient-to-b from-purple-50 to-white">
          <h3 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Do This Week
          </h3>
          <div className="space-y-2">
            {inProgressItems.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No tasks scheduled for this week</p>
            ) : (
              inProgressItems.map((item) => (
                <div
                  key={`${item.itemType}-${item.id}`}
                  className={`text-xs px-3 py-2.5 rounded-lg border ${getItemColor(item)} font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {item.itemType === "assignment" && <BookOpen className="h-4 w-4 flex-shrink-0" />}
                    <span className="truncate font-semibold">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={item.status || "todo"}
                      onChange={(e) => handleStatusChange(item, e.target.value as "todo" | "in_progress" | "completed")}
                      className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
