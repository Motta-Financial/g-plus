"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Check, X, Trash2 } from "lucide-react"
import type { CalendarConnection } from "@/lib/types"

export function CalendarConnections() {
  const [connecting, setConnecting] = useState<string | null>(null)
  const calendarConnections = useAppStore((state) => state.calendarConnections)
  const addCalendarConnection = useAppStore((state) => state.addCalendarConnection)
  const deleteCalendarConnection = useAppStore((state) => state.deleteCalendarConnection)
  const updateCalendarConnection = useAppStore((state) => state.updateCalendarConnection)
  const { toast } = useToast()

  const handleConnect = async (provider: "google" | "outlook" | "apple") => {
    setConnecting(provider)
    try {
      // Initiate OAuth flow
      const response = await fetch(`/api/calendar/auth/${provider}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Failed to connect ${provider} calendar`)
      }

      const data = await response.json()

      if (data.authUrl) {
        // Redirect to OAuth provider
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error("[v0] Calendar connection error:", error)
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : `Failed to connect ${provider} calendar`,
        variant: "destructive",
      })
      setConnecting(null)
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    try {
      deleteCalendarConnection(connectionId)
      toast({
        title: "Calendar disconnected",
        description: "Your calendar has been disconnected successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect calendar",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = (connection: CalendarConnection) => {
    updateCalendarConnection(connection.id, { is_active: !connection.is_active })
    toast({
      title: connection.is_active ? "Calendar paused" : "Calendar activated",
      description: connection.is_active
        ? "Events will no longer sync from this calendar"
        : "Events will now sync from this calendar",
    })
  }

  const getConnection = (provider: "google" | "outlook" | "apple") => {
    return calendarConnections.find((conn) => conn.provider === provider)
  }

  const calendars = [
    {
      provider: "google" as const,
      name: "Google Calendar",
      description: "Sync events from Google Calendar",
      icon: "📅",
    },
    {
      provider: "outlook" as const,
      name: "Outlook Calendar",
      description: "Sync events from Outlook Calendar",
      icon: "📆",
    },
    {
      provider: "apple" as const,
      name: "Apple Calendar",
      description: "Sync events from Apple Calendar (iCloud)",
      icon: "🍎",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Integrations
        </CardTitle>
        <CardDescription>Connect your calendars to see all your events in one place</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {calendars.map((calendar) => {
          const connection = getConnection(calendar.provider)
          const isConnected = !!connection

          return (
            <div key={calendar.provider} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{calendar.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{calendar.name}</p>
                    {isConnected && (
                      <Badge variant={connection.is_active ? "default" : "secondary"} className="text-xs">
                        {connection.is_active ? "Active" : "Paused"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{calendar.description}</p>
                  {isConnected && connection.email && (
                    <p className="text-xs text-muted-foreground mt-1">{connection.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(connection)}
                      className="gap-2"
                    >
                      {connection.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      {connection.is_active ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(calendar.provider)}
                    disabled={connecting === calendar.provider}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {connecting === calendar.provider ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
