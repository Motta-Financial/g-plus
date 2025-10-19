"use client"

import type { Workstream } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface WorkstreamFilterProps {
  workstreams: Workstream[]
  selectedWorkstreams: string[]
  onSelectionChange: (selected: string[]) => void
}

export function WorkstreamFilter({ workstreams, selectedWorkstreams, onSelectionChange }: WorkstreamFilterProps) {
  const toggleWorkstream = (id: string) => {
    if (selectedWorkstreams.includes(id)) {
      onSelectionChange(selectedWorkstreams.filter((w) => w !== id))
    } else {
      onSelectionChange([...selectedWorkstreams, id])
    }
  }

  const clearFilters = () => {
    onSelectionChange([])
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
      {workstreams.map((workstream) => (
        <Badge
          key={workstream.id}
          variant={selectedWorkstreams.includes(workstream.id) ? "default" : "outline"}
          className="cursor-pointer"
          style={
            selectedWorkstreams.includes(workstream.id)
              ? { backgroundColor: workstream.color, borderColor: workstream.color }
              : {}
          }
          onClick={() => toggleWorkstream(workstream.id)}
        >
          {workstream.icon} {workstream.name}
        </Badge>
      ))}
      {selectedWorkstreams.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2">
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
