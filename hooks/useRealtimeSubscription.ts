"use client"

// hooks/useRealtimeSubscription.ts
// Generic real-time subscription hook for any Supabase table

import { useEffect, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

interface UseRealtimeSubscriptionOptions<T> {
  table: string
  filter?: string // Optional filter like "workstream_id=eq.123"
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T) => void
  onDelete?: (payload: { id: string; old: T }) => void
  onError?: (error: Error) => void
  enabled?: boolean // Allow disabling subscription
}

export function useRealtimeSubscription<T = any>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onError,
  enabled = true,
}: UseRealtimeSubscriptionOptions<T>) {
  const supabase = createClientComponentClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const setupSubscription = async () => {
      try {
        // Generate unique channel name
        const channelName = `${table}-changes-${filter || "all"}-${Date.now()}`

        // Create channel
        const channel = supabase.channel(channelName)

        // Subscribe to INSERT events
        if (onInsert) {
          channel.on(
            "postgres_changes" as any,
            {
              event: "INSERT",
              schema: "public",
              table,
              filter,
            } as any,
            (payload: RealtimePostgresChangesPayload<T>) => {
              console.log(`[Realtime] INSERT on ${table}:`, payload.new)
              onInsert(payload.new as T)
            },
          )
        }

        // Subscribe to UPDATE events
        if (onUpdate) {
          channel.on(
            "postgres_changes" as any,
            {
              event: "UPDATE",
              schema: "public",
              table,
              filter,
            } as any,
            (payload: RealtimePostgresChangesPayload<T>) => {
              console.log(`[Realtime] UPDATE on ${table}:`, payload.new)
              onUpdate(payload.new as T)
            },
          )
        }

        // Subscribe to DELETE events
        if (onDelete) {
          channel.on(
            "postgres_changes" as any,
            {
              event: "DELETE",
              schema: "public",
              table,
              filter,
            } as any,
            (payload: RealtimePostgresChangesPayload<T>) => {
              console.log(`[Realtime] DELETE on ${table}:`, payload.old)
              onDelete({
                id: (payload.old as any).id,
                old: payload.old as T,
              })
            },
          )
        }

        // Subscribe to channel
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(`[Realtime] Subscribed to ${table} changes`)
          }
          if (status === "CHANNEL_ERROR") {
            console.error(`[Realtime] Channel error for ${table}`)
            onError?.(new Error(`Realtime channel error for ${table}`))
          }
        })

        channelRef.current = channel
      } catch (error) {
        console.error(`[Realtime] Setup error for ${table}:`, error)
        onError?.(error as Error)
      }
    }

    setupSubscription()

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log(`[Realtime] Unsubscribing from ${table}`)
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, filter, enabled, onInsert, onUpdate, onDelete, onError])

  return {
    isConnected: !!channelRef.current,
  }
}

// Usage example:
/*
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import { Task } from '@/lib/types'

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])

  useRealtimeSubscription<Task>({
    table: 'tasks',
    filter: 'status=eq.todo', // Optional filter
    onInsert: (newTask) => {
      setTasks(prev => [...prev, newTask])
    },
    onUpdate: (updatedTask) => {
      setTasks(prev => 
        prev.map(t => t.id === updatedTask.id ? updatedTask : t)
      )
    },
    onDelete: ({ id }) => {
      setTasks(prev => prev.filter(t => t.id !== id))
    },
    onError: (error) => {
      console.error('Realtime error:', error)
    },
    enabled: true, // Can disable when component is not visible
  })

  // Rest of component...
}
*/
