"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Filter, X, Search, CalendarIcon } from "lucide-react"
import type { Workstream, Project, Class, TaskPriority } from "@/lib/types"
import { format } from "date-fns"

export interface FilterState {
  search: string
  workstreamIds: string[]
  projectIds: string[]
  classIds: string[]
  priorities: TaskPriority[]
  statuses: string[]
  dueDateFrom?: Date
  dueDateTo?: Date
  hasComments?: boolean
  hasCanvas?: boolean
}

interface AdvancedFilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  workstreams: Workstream[]
  projects: Project[]
  classes: Class[]
  showProjects?: boolean
  showClasses?: boolean
  showStatus?: boolean
  showCanvas?: boolean
}

export function AdvancedFilterPanel({
  filters,
  onFiltersChange,
  workstreams,
  projects,
  classes,
  showProjects = true,
  showClasses = true,
  showStatus = true,
  showCanvas = true,
}: AdvancedFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (
    key: "workstreamIds" | "projectIds" | "classIds" | "priorities" | "statuses",
    value: string,
  ) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value) ? currentArray.filter((v) => v !== value) : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const clearFilters = () => {
    onFiltersChange({
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
  }

  const activeFilterCount =
    filters.workstreamIds.length +
    filters.projectIds.length +
    filters.classIds.length +
    filters.priorities.length +
    filters.statuses.length +
    (filters.dueDateFrom ? 1 : 0) +
    (filters.dueDateTo ? 1 : 0) +
    (filters.hasComments !== undefined ? 1 : 0) +
    (filters.hasCanvas !== undefined ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks, emails, or items..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Button & Active Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-light text-lg">Advanced Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Workstreams */}
              <div className="space-y-2">
                <Label>Workstreams</Label>
                <div className="flex flex-wrap gap-2">
                  {workstreams.map((ws) => (
                    <Badge
                      key={ws.id}
                      variant={filters.workstreamIds.includes(ws.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter("workstreamIds", ws.id)}
                    >
                      {ws.icon} {ws.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {showProjects && projects.length > 0 && (
                <div className="space-y-2">
                  <Label>Projects</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {projects.map((proj) => (
                      <Badge
                        key={proj.id}
                        variant={filters.projectIds.includes(proj.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayFilter("projectIds", proj.id)}
                      >
                        {proj.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Classes */}
              {showClasses && classes.length > 0 && (
                <div className="space-y-2">
                  <Label>Classes</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {classes.map((cls) => (
                      <Badge
                        key={cls.id}
                        variant={filters.classIds.includes(cls.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayFilter("classIds", cls.id)}
                      >
                        {cls.course_code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex flex-wrap gap-2">
                  {(["big_rock", "medium_rock", "small_rock"] as TaskPriority[]).map((priority) => (
                    <Badge
                      key={priority}
                      variant={filters.priorities.includes(priority) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter("priorities", priority)}
                    >
                      {priority === "big_rock" && "Big Rock"}
                      {priority === "medium_rock" && "Medium Rock"}
                      {priority === "small_rock" && "Small Rock"}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status */}
              {showStatus && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {["todo", "in_progress", "blocked", "completed"].map((status) => (
                      <Badge
                        key={status}
                        variant={filters.statuses.includes(status) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayFilter("statuses", status)}
                      >
                        {status === "todo" && "To Do"}
                        {status === "in_progress" && "In Progress"}
                        {status === "blocked" && "Blocked"}
                        {status === "completed" && "Completed"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Date Range */}
              <div className="space-y-2">
                <Label>Due Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateFrom ? format(filters.dueDateFrom, "MMM d") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateFrom}
                        onSelect={(date) => updateFilter("dueDateFrom", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateTo ? format(filters.dueDateTo, "MMM d") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateTo}
                        onSelect={(date) => updateFilter("dueDateTo", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Additional Filters */}
              {showCanvas && (
                <div className="space-y-2">
                  <Label>Additional</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={filters.hasComments === true ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => updateFilter("hasComments", filters.hasComments === true ? undefined : true)}
                    >
                      Has Comments
                    </Badge>
                    <Badge
                      variant={filters.hasCanvas === true ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => updateFilter("hasCanvas", filters.hasCanvas === true ? undefined : true)}
                    >
                      From Canvas
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Badges */}
        {filters.workstreamIds.map((id) => {
          const ws = workstreams.find((w) => w.id === id)
          return ws ? (
            <Badge key={id} variant="secondary" className="gap-1">
              {ws.icon} {ws.name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter("workstreamIds", id)} />
            </Badge>
          ) : null
        })}

        {filters.priorities.map((priority) => (
          <Badge key={priority} variant="secondary" className="gap-1">
            {priority === "big_rock" && "Big Rock"}
            {priority === "medium_rock" && "Medium Rock"}
            {priority === "small_rock" && "Small Rock"}
            <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter("priorities", priority)} />
          </Badge>
        ))}

        {filters.statuses.map((status) => (
          <Badge key={status} variant="secondary" className="gap-1">
            {status === "todo" && "To Do"}
            {status === "in_progress" && "In Progress"}
            {status === "blocked" && "Blocked"}
            {status === "completed" && "Completed"}
            <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter("statuses", status)} />
          </Badge>
        ))}

        {(filters.dueDateFrom || filters.dueDateTo) && (
          <Badge variant="secondary" className="gap-1">
            {filters.dueDateFrom && format(filters.dueDateFrom, "MMM d")}
            {filters.dueDateFrom && filters.dueDateTo && " - "}
            {filters.dueDateTo && format(filters.dueDateTo, "MMM d")}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => {
                updateFilter("dueDateFrom", undefined)
                updateFilter("dueDateTo", undefined)
              }}
            />
          </Badge>
        )}

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}
