"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"
import { useAppStore } from "@/lib/store"

export function CalendarSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()
  const calendarConnections = useAppStore((state) => state.calendarConnections)
  const addEvent = useAppStore((state) => state.addEvent)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const activeConnections = calendarConnections.filter((conn) => conn.is_active)

      if (activeConnections.length === 0) {
        toast({
          title: "No calendars connected",
          description: "Connect a calendar in Settings to sync events",
          variant: "destructive",
        })
        return
      }

      // Sync each connected calendar
      for (const connection of activeConnections) {
        const response = await fetch("/api/calendar/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            connectionId: connection.id,
            provider: connection.provider,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to sync ${connection.provider} calendar`)
        }

        const data = await response.json()

        // Add synced events to store
        if (data.events && Array.isArray(data.events)) {
          data.events.forEach((event: any) => {
            addEvent({
              user_id: "grace",
              title: event.title,
              description: event.description,
              start_time: event.start_time,
              end_time: event.end_time,
              location: event.location,
              calendar_source: connection.provider,
              external_id: event.external_id,
              all_day: event.all_day || false,
            })
          })
        }
      }

      toast({
        title: "Calendars synced",
        description: `Successfully synced ${activeConnections.length} calendar(s)`,
      })
    } catch (error) {
      console.error("[v0] Calendar sync error:", error)
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync calendars",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={syncing} size="sm" variant="outline" className="gap-2 bg-transparent">
      <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing..." : "Sync Calendars"}
    </Button>
  )
}
