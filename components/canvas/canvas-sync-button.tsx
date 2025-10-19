"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSWRConfig } from "swr"

export function CanvasSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()
  const { mutate } = useSWRConfig()

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/canvas/sync", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Canvas synced successfully",
          description: `Synced ${data.synced.courses} courses, ${data.synced.assignments} assignments, and ${data.synced.events} events`,
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
