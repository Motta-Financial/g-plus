"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error" | "not-setup">("checking")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  async function checkDatabaseConnection() {
    try {
      const supabase = createClient()

      // Try to query the tasks table
      const { data, error } = await supabase.from("tasks").select("id").limit(1)

      if (error) {
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setStatus("not-setup")
          setError("Database tables not created yet")
        } else {
          setStatus("error")
          setError(error.message)
        }
      } else {
        setStatus("connected")
      }
    } catch (err: any) {
      setStatus("error")
      setError(err.message || "Unknown error")
    }
  }

  if (status === "checking") {
    return null
  }

  if (status === "connected") {
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-500">Database Connected</AlertTitle>
        <AlertDescription className="text-green-500/80">
          Your Supabase database is properly configured and ready to use.
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "not-setup") {
    return (
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-500">Database Setup Required</AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-yellow-500/80">
            Your database tables need to be created. Follow these steps to set up your database:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-500/80">
            <li>Open your Supabase project dashboard</li>
            <li>Go to SQL Editor</li>
            <li>
              Run the migration scripts from the{" "}
              <code className="text-xs bg-yellow-500/20 px-1 py-0.5 rounded">scripts/</code> folder
            </li>
          </ol>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 bg-transparent"
              onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            >
              Open Supabase Dashboard
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 bg-transparent"
              onClick={() => window.open("/DATABASE_SETUP.md", "_blank")}
            >
              View Setup Guide
            </Button>
          </div>
          <p className="text-xs text-yellow-500/60 pt-2">
            Currently using localStorage as fallback. Your data will sync to the database once setup is complete.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-red-500/50 bg-red-500/10">
      <XCircle className="h-4 w-4 text-red-500" />
      <AlertTitle className="text-red-500">Database Connection Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <p className="text-red-500/80">{error}</p>
        <Button
          size="sm"
          variant="outline"
          className="border-red-500/50 text-red-500 hover:bg-red-500/10 bg-transparent"
          onClick={checkDatabaseConnection}
        >
          Retry Connection
        </Button>
      </AlertDescription>
    </Alert>
  )
}
