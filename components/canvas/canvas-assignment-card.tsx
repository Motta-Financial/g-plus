"use client"

import type { CanvasAssignment } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, ExternalLink, Plus } from "lucide-react"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CanvasAssignmentCardProps {
  assignment: CanvasAssignment
}

export function CanvasAssignmentCard({ assignment }: CanvasAssignmentCardProps) {
  const updateCanvasAssignment = useAppStore((state) => state.updateCanvasAssignment)

  const handleTimeframeChange = (newTimeframe: CanvasAssignment["timeframe"]) => {
    updateCanvasAssignment(assignment.id, { timeframe: newTimeframe })
  }

  const handleStatusChange = (newStatus: CanvasAssignment["status"]) => {
    updateCanvasAssignment(assignment.id, { status: newStatus })
  }

  const statusConfig = {
    todo: { label: "To Do", emoji: "📋", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
    in_progress: { label: "In Progress", emoji: "🔄", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    completed: { label: "Completed", emoji: "✅", color: "bg-green-500/10 text-green-600 border-green-500/20" },
    blocked: { label: "Blocked", emoji: "🚫", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  }

  const timeframeConfig = {
    this_week: { label: "This Week", emoji: "📅", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    next_week: { label: "Next Week", emoji: "📆", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  }

  return (
    <Card className="p-4 fashion-card hover:border-primary/40 transition-all">
      <div className="flex items-start gap-3">
        <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium tracking-tight">{assignment.title}</h3>
              <p className="text-sm text-muted-foreground">
                {assignment.course_code} • {assignment.course_name}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {assignment.status && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      variant="outline"
                      className={`${statusConfig[assignment.status].color} cursor-pointer hover:opacity-80`}
                    >
                      {statusConfig[assignment.status].emoji} {statusConfig[assignment.status].label}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange("todo")}>📋 To Do</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                      🔄 In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("completed")}>✅ Completed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("blocked")}>🚫 Blocked</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {assignment.timeframe ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      variant="outline"
                      className={`${timeframeConfig[assignment.timeframe].color} cursor-pointer hover:opacity-80`}
                    >
                      {timeframeConfig[assignment.timeframe].emoji} {timeframeConfig[assignment.timeframe].label}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTimeframeChange("this_week")}>📅 This Week</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTimeframeChange("next_week")}>📆 Next Week</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTimeframeChange(undefined)}>
                      ❌ Remove Timeframe
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-7 bg-transparent">
                      <Plus className="h-3 w-3" />
                      Add to Week
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTimeframeChange("this_week")}>📅 This Week</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTimeframeChange("next_week")}>📆 Next Week</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {assignment.description && (
            <p className="text-sm text-muted-foreground text-pretty">{assignment.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {assignment.due_date && (
              <Badge variant="outline" className="gap-1 font-normal">
                <Calendar className="h-3 w-3" />
                Due {format(new Date(assignment.due_date), "MMM d, yyyy")}
              </Badge>
            )}
            {assignment.points_possible && (
              <Badge variant="outline" className="font-normal">
                {assignment.points_possible} points
              </Badge>
            )}
            {assignment.canvas_url && (
              <Badge
                variant="outline"
                className="gap-1 cursor-pointer hover:bg-blue-500/10 font-normal bg-blue-500/5 text-blue-600 border-blue-500/20"
                asChild
              >
                <a href={assignment.canvas_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open in Canvas
                </a>
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
