"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Tag, Trash2, Archive, CheckCircle2 } from "lucide-react"
import type { TaskPriority, Workstream, Project, Class } from "@/lib/types"

interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onUpdatePriority?: (priority: TaskPriority) => void
  onUpdateWorkstream?: (workstreamId: string) => void
  onUpdateProject?: (projectId: string) => void
  onUpdateClass?: (classId: string) => void
  onUpdateStatus?: (status: string) => void
  onDelete?: () => void
  onArchive?: () => void
  workstreams?: Workstream[]
  projects?: Project[]
  classes?: Class[]
  showPriority?: boolean
  showWorkstream?: boolean
  showProject?: boolean
  showClass?: boolean
  showStatus?: boolean
  showDelete?: boolean
  showArchive?: boolean
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onUpdatePriority,
  onUpdateWorkstream,
  onUpdateProject,
  onUpdateClass,
  onUpdateStatus,
  onDelete,
  onArchive,
  workstreams = [],
  projects = [],
  classes = [],
  showPriority = true,
  showWorkstream = true,
  showProject = false,
  showClass = false,
  showStatus = true,
  showDelete = true,
  showArchive = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="glass-effect border border-border/50 rounded-lg shadow-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {selectedCount} selected
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            {showPriority && onUpdatePriority && (
              <Select onValueChange={(v: TaskPriority) => onUpdatePriority(v)}>
                <SelectTrigger className="h-9 w-[140px]">
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="big_rock">Big Rock</SelectItem>
                  <SelectItem value="medium_rock">Medium Rock</SelectItem>
                  <SelectItem value="small_rock">Small Rock</SelectItem>
                </SelectContent>
              </Select>
            )}

            {showWorkstream && onUpdateWorkstream && workstreams.length > 0 && (
              <Select onValueChange={onUpdateWorkstream}>
                <SelectTrigger className="h-9 w-[160px]">
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Workstream" />
                </SelectTrigger>
                <SelectContent>
                  {workstreams.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.icon} {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {showProject && onUpdateProject && projects.length > 0 && (
              <Select onValueChange={onUpdateProject}>
                <SelectTrigger className="h-9 w-[160px]">
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {showClass && onUpdateClass && classes.length > 0 && (
              <Select onValueChange={onUpdateClass}>
                <SelectTrigger className="h-9 w-[160px]">
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Class</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.course_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {showStatus && onUpdateStatus && (
              <Select onValueChange={onUpdateStatus}>
                <SelectTrigger className="h-9 w-[140px]">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}

            {showArchive && onArchive && (
              <Button variant="outline" size="sm" onClick={onArchive} className="gap-2 bg-transparent">
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}

            {showDelete && onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
