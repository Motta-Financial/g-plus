"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import type { User, Session } from "@supabase/supabase-js"

export function AuthDebugPanel() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [envVars, setEnvVars] = useState({
    supabaseUrl: false,
    supabaseKey: false,
    devRedirectUrl: false,
  })

  useEffect(() => {
    checkAuth()
    checkEnvVars()
  }, [])

  async function checkAuth() {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(user)
      setSession(session)
      console.log("[v0] Auth Debug - User:", user)
      console.log("[v0] Auth Debug - Session:", session)
    } catch (error) {
      console.error("[v0] Auth Debug - Error:", error)
    } finally {
      setLoading(false)
    }
  }

  function checkEnvVars() {
    setEnvVars({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      devRedirectUrl: !!process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL,
    })
  }

  const StatusIcon = ({ status }: { status: boolean }) =>
    status ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Authentication Debug Panel
            </CardTitle>
            <CardDescription>System status and diagnostics</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={checkAuth}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environment Variables */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Environment Variables</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>NEXT_PUBLIC_SUPABASE_URL</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={envVars.supabaseUrl} />
                <Badge variant={envVars.supabaseUrl ? "default" : "destructive"}>
                  {envVars.supabaseUrl ? "Set" : "Missing"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={envVars.supabaseKey} />
                <Badge variant={envVars.supabaseKey ? "default" : "destructive"}>
                  {envVars.supabaseKey ? "Set" : "Missing"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={envVars.devRedirectUrl} />
                <Badge variant={envVars.devRedirectUrl ? "default" : "secondary"}>
                  {envVars.devRedirectUrl ? "Set" : "Optional"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Authentication Status</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>User Authenticated</span>
                <div className="flex items-center gap-2">
                  <StatusIcon status={!!user} />
                  <Badge variant={user ? "default" : "secondary"}>{user ? "Yes" : "No"}</Badge>
                </div>
              </div>
              {user && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span>Email</span>
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>User ID</span>
                    <span className="text-muted-foreground font-mono text-xs">{user.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Email Verified</span>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={!!user.email_confirmed_at} />
                      <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                        {user.email_confirmed_at ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between text-sm">
                <span>Active Session</span>
                <div className="flex items-center gap-2">
                  <StatusIcon status={!!session} />
                  <Badge variant={session ? "default" : "secondary"}>{session ? "Yes" : "No"}</Badge>
                </div>
              </div>
              {session && (
                <div className="flex items-center justify-between text-sm">
                  <span>Session Expires</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(session.expires_at! * 1000).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/auth/login">Login Page</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/auth/sign-up">Sign Up Page</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/profile">Profile</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/account">Account Settings</a>
            </Button>
          </div>
        </div>

        {/* System Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">System Information</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Middleware: Active (session refresh enabled)</p>
            <p>• Route Protection: Enabled for /dashboard/*</p>
            <p>• Auth Provider: Supabase</p>
            <p>• Client: @supabase/ssr</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
