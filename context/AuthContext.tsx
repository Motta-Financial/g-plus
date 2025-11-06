"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  error: Error | null
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("[v0][Auth] Error fetching session:", error)
        setError(error as Error)
      }
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event !== "INITIAL_SESSION") {
        console.log("[v0][Auth] State change:", event, currentSession?.user?.email || "no user")
      }

      setSession(currentSession)
      setUser(currentSession?.user || null)
      setLoading(false)

      // Handle specific events
      if (event === "SIGNED_IN") {
        router.push("/dashboard")
        router.refresh()
      }

      if (event === "SIGNED_OUT") {
        router.push("/auth/login")
        router.refresh()
      }

      if (event === "TOKEN_REFRESHED") {
        console.log("[v0][Auth] Token refreshed successfully")
      }
    })

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [supabase, router])

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })
      return { error }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear cached data
      setUser(null)
      setSession(null)

      // Redirect to login
      router.push("/auth/login")
      router.refresh()
    } catch (err) {
      console.error("Error signing out:", err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const {
        data: { session: refreshedSession },
      } = await supabase.auth.refreshSession()
      setSession(refreshedSession)
      setUser(refreshedSession?.user || null)
    } catch (err) {
      console.error("Error refreshing session:", err)
      setError(err as Error)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, error, signUp, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
