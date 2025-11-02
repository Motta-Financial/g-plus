"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Database, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SetupDatabaseButton() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<Array<{ script: string; success: boolean; error?: string }>>([])
  const [showResults, setShowResults] = useState(false)

  const scripts = [
    "000_setup_exec_function.sql",
    "001_create_tasks_table.sql",
    "002_add_timeframe_to_canvas_assignments.sql",
    "003-add-class-field.sql",
    "007-add-canvas-to-classes.sql",
  ]

  const runMigrations = async () => {
    setIsRunning(true)
    setShowResults(true)
    const newResults: Array<{ script: string; success: boolean; error?: string }> = []

    for (const script of scripts) {
      try {
        console.log(`[v0] Running script: ${script}`)

        // Fetch the SQL file content
        const response = await fetch(`/scripts/${script}`)
        const sql = await response.text()

        // Execute the SQL
        const execResponse = await fetch("/api/database/execute-sql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql }),
        })

        const result = await execResponse.json()

        if (execResponse.ok && result.success) {
          newResults.push({ script, success: true })
        } else {
          newResults.push({ script, success: false, error: result.error })
        }
      } catch (error) {
        newResults.push({
          script,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      setResults([...newResults])
    }

    setIsRunning(false)
  }

  return (
    <div className="space-y-4">
      <Button onClick={runMigrations} disabled={isRunning} className="w-full">
        {isRunning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Migrations...
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Setup Database
          </>
        )}
      </Button>

      {showResults && results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <Alert key={index} variant={result.success ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-mono text-sm">{result.script}</div>
                  {result.error && <AlertDescription className="mt-1 text-xs">{result.error}</AlertDescription>}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}
