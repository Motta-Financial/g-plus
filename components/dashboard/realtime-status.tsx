"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function RealtimeStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Create a test channel to check connection status
    const channel = supabase.channel("connection-status")

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true)
        setShowStatus(true)
        // Hide after 3 seconds if connected
        setTimeout(() => setShowStatus(false), 3000)
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setIsConnected(false)
        setShowStatus(true)
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (!showStatus) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all",
        isConnected ? "bg-green-500 text-white" : "bg-red-500 text-white",
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Real-time connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Real-time disconnected</span>
        </>
      )}
    </div>
  )
}
