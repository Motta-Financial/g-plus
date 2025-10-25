"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSWRConfig } from "swr"
import { useAppStore } from "@/lib/store"

export function CanvasSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()
  const { mutate } = useSWRConfig()
  const { canvasApiToken, canvasBaseUrl } = useAppStore((state) => state.settings)
  const setCourses = useAppStore((state) => state.setCourses)
  const syncCanvasAssignments = useAppStore((state) => state.syncCanvasAssignments)
  const autoCreateClassesFromCanvas = useAppStore((state) => state.autoCreateClassesFromCanvas)

  const handleSync = async () => {
    if (!canvasApiToken) {
      toast({
        title: "Canvas not configured",
        description: "Please add your Canvas API token in Settings",
        variant: "destructive",
      })
      return
    }

    setSyncing(true)
    try {
      console.log("[v0] Starting Canvas sync...")
      const response = await fetch("/api/canvas/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          canvasApiToken,
          canvasBaseUrl: canvasBaseUrl || "https://canvas.suffolk.edu",
        }),
      })

      const data = await response.json()
      console.log("[v0] Canvas sync response:", data)

      if (response.ok) {
        if (data.data?.courses) {
          console.log("[v0] Auto-creating classes from courses:", data.data.courses.length)
          autoCreateClassesFromCanvas(data.data.courses)
          setCourses(data.data.courses)
        }

        if (data.data?.canvasAssignments) {
          console.log("[v0] Syncing Canvas assignments:", data.data.canvasAssignments.length)
          syncCanvasAssignments(data.data.canvasAssignments)
        }

        toast({
          title: "Canvas synced successfully",
          description: `Synced ${data.data?.courses?.length || 0} courses and ${data.data?.canvasAssignments?.length || 0} assignments`,
        })
        mutate(() => true)
      } else {
        toast({
          title: "Sync failed",
          description: data.error || "Failed to sync Canvas data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Canvas sync error:", error)
      toast({
        title: "Sync failed",
        description: "An error occurred while syncing Canvas data",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm" className="gap-2 bg-transparent">
      <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing..." : "Sync Canvas"}
    </Button>
  )
}
