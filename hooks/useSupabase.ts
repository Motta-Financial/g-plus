// hooks/useSupabase.ts
// Custom hooks for common Supabase operations

"use client"

import { useEffect, useState, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useAuth } from "@/context/AuthContext"

// Create a singleton Supabase client for hooks
const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Hook for fetching data with loading and error states
export function useFetch<T>(table: string, query?: (q: any) => any, dependencies: any[] = []) {
  const { user } = useAuth()
  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        let queryBuilder = supabase.from(table).select("*")

        if (query) {
          queryBuilder = query(queryBuilder)
        }

        const { data, error } = await queryBuilder

        if (error) throw error
        setData(data)
      } catch (err: any) {
        console.error(`Error fetching ${table}:`, err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, table, ...dependencies])

  return { data, loading, error }
}

// Hook for inserting records
export function useInsert(table: string) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insert = useCallback(
    async (record: any) => {
      if (!user) {
        setError("User not authenticated")
        return null
      }

      try {
        setLoading(true)
        setError(null)

        // Automatically add user_id if not present
        const recordWithUser = {
          ...record,
          user_id: record.user_id || user.id,
        }

        const { data, error: insertError } = await supabase.from(table).insert([recordWithUser]).select()

        if (insertError) throw insertError
        return data
      } catch (err: any) {
        console.error(`Error inserting into ${table}:`, err)
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, table],
  )

  return { insert, loading, error }
}

// Hook for updating records
export function useUpdate(table: string) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(
    async (id: string, updates: any) => {
      if (!user) {
        setError("User not authenticated")
        return null
      }

      try {
        setLoading(true)
        setError(null)

        const { data, error: updateError } = await supabase
          .from(table)
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()

        if (updateError) throw updateError
        return data
      } catch (err: any) {
        console.error(`Error updating ${table}:`, err)
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, table],
  )

  return { update, loading, error }
}

// Hook for deleting records
export function useDelete(table: string) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteRecord = useCallback(
    async (id: string) => {
      if (!user) {
        setError("User not authenticated")
        return false
      }

      try {
        setLoading(true)
        setError(null)

        const { error: deleteError } = await supabase.from(table).delete().eq("id", id).eq("user_id", user.id)

        if (deleteError) throw deleteError
        return true
      } catch (err: any) {
        console.error(`Error deleting from ${table}:`, err)
        setError(err.message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user, table],
  )

  return { deleteRecord, loading, error }
}

// Hook for real-time subscriptions
export function useRealtime<T>(table: string, filter?: string, onData?: (data: T[]) => void) {
  const { user } = useAuth()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchData = async () => {
      try {
        let query = supabase.from(table).select("*")

        if (filter) {
          const [column, operator, value] = filter.split(",")
          query = query.filter(column, operator, value)
        } else {
          query = query.eq("user_id", user.id)
        }

        const { data, error } = await query

        if (error) throw error
        setData(data || [])
        setLoading(false)
      } catch (err: any) {
        console.error(`Error fetching ${table}:`, err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to changes
    const channel = supabase
      .channel(`${table}:user_id=eq.${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          filter: filter || `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setData((prev) => [payload.new as T, ...prev])
            if (onData) onData([payload.new as T, ...data])
          } else if (payload.eventType === "UPDATE") {
            setData((prev) => prev.map((item: any) => (item.id === payload.new.id ? (payload.new as T) : item)))
          } else if (payload.eventType === "DELETE") {
            setData((prev) => prev.filter((item: any) => item.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, table, filter])

  return { data, loading, error }
}

// Hook for file uploads
export function useFileUpload(bucketName = "canvas-materials") {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(
    async (file: File, path?: string) => {
      if (!user) {
        setError("User not authenticated")
        return null
      }

      try {
        setLoading(true)
        setError(null)
        setProgress(0)

        // Default path is user-id/timestamp/filename
        const filePath = path || `${user.id}/${Date.now()}/${file.name}`

        const { data, error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) throw uploadError

        setProgress(100)
        return data
      } catch (err: any) {
        console.error("Error uploading file:", err)
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, bucketName],
  )

  return { upload, loading, error, progress }
}

// Hook for getting public URL of uploaded file
export function usePublicUrl(bucketName: string, path: string) {
  const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(path)

  return publicUrl?.publicUrl || ""
}
