"use client"

import type React from "react"

import type { Class } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { MoreVertical, Pencil, Trash2, Megaphone, FileText } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ClassCardProps {
  classItem: Class
  onEdit: () => void
}

export function ClassCard({ classItem, onEdit }: ClassCardProps) {
  const router = useRouter()
  const deleteClass = useAppStore((state) => state.deleteClass)
  const tasks = useAppStore((state) => state.tasks)
  const canvasAssignments = useAppStore((state) => state.canvasAssignments)

  // Get tasks and assignments for this class
  const classTasks = tasks.filter((t) => t.class_id === classItem.id)
  const classAssignments = canvasAssignments.filter(
    (a) =>
      a.class_id === classItem.id ||
      a.course_id === classItem.canvas_course_id ||
      a.course_code?.toLowerCase() === classItem.course_code?.toLowerCase(),
  )

  const totalItems = classTasks.length + classAssignments.length
  const completedItems =
    classTasks.filter((t) => t.status === "completed").length +
    classAssignments.filter((a) => a.status === "completed").length

  const gradePercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : null

  const upcomingDue = [...classTasks, ...classAssignments]
    .filter((item) => {
      if ("due_date" in item && item.due_date) {
        return new Date(item.due_date) > new Date() && item.status !== "completed"
      }
      return false
    })
    .sort((a, b) => {
      const dateA = "due_date" in a && a.due_date ? new Date(a.due_date).getTime() : 0
      const dateB = "due_date" in b && b.due_date ? new Date(b.due_date).getTime() : 0
      return dateA - dateB
    })
    .slice(0, 3)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete ${classItem.name}?`)) {
      deleteClass(classItem.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit()
  }

  const getTitleColor = () => {
    const code = classItem.course_code?.toLowerCase() || ""
    if (code.includes("sbs")) return "text-pink-400"
    if (code.includes("acct")) return "text-green-400"
    if (code.includes("ble")) return "text-pink-400"
    if (code.includes("isom")) return "text-blue-400"
    return "text-purple-400"
  }

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all group bg-gray-900/40 border-gray-800 hover:border-gray-700"
      onClick={() => router.push(`/dashboard/class/${classItem.id}`)}
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {classItem.color ? (
          <img
            src={classItem.color || "/placeholder.svg"}
            alt={classItem.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${getColorFromName(classItem.name)} 0%, ${adjustColor(getColorFromName(classItem.name), -20)} 100%)`,
            }}
          >
            {classItem.course_code?.substring(0, 4) || classItem.name.substring(0, 4)}
          </div>
        )}

        {gradePercentage !== null && (
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white text-sm font-mono">{gradePercentage}%</span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-pink-500 hover:bg-pink-600 text-white rounded-full"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
              <DropdownMenuItem onClick={handleEdit} className="text-gray-200 focus:bg-gray-800 focus:text-white">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-400 focus:bg-gray-800 focus:text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className={`font-medium text-base truncate ${getTitleColor()}`}>
            {classItem.course_code || classItem.name}
          </h3>
          <p className="text-sm text-gray-400 truncate font-mono">
            {classItem.course_code ? classItem.name : "Workspaces"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-gray-500 hover:text-gray-400 transition-colors relative">
            <Megaphone className="h-4 w-4" />
            {classAssignments.filter((a) => a.type === "announcement").length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center">
                {classAssignments.filter((a) => a.type === "announcement").length}
              </span>
            )}
          </button>
          <button className="text-gray-500 hover:text-gray-400 transition-colors">
            <FileText className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-800">
          <h4 className="text-xs font-medium text-gray-400">Due</h4>
          {upcomingDue.length > 0 ? (
            <div className="space-y-1.5">
              {upcomingDue.map((item) => (
                <div key={item.id} className="flex items-start justify-between text-xs">
                  <span className="text-gray-300 flex-1 truncate font-mono">{"title" in item ? item.title : ""}</span>
                  <span className="text-gray-500 ml-2 whitespace-nowrap">
                    {"due_date" in item && item.due_date
                      ? new Date(item.due_date).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 font-mono">None</p>
          )}
        </div>
      </div>
    </Card>
  )
}

// Helper function to generate a color from class name
function getColorFromName(name: string): string {
  const colors = [
    "#ef4444", // red
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const num = Number.parseInt(color.replace("#", ""), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}
