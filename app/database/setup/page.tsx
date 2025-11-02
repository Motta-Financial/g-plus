"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, Database } from "lucide-react"

// All migration scripts in order
const migrations = [
  { id: "000", name: "Setup exec function", file: "000_setup_exec_function.sql" },
  { id: "009", name: "Create user profiles table", file: "009-create-user-profiles-table.sql" },
  { id: "010", name: "Create workstreams table", file: "010-create-workstreams-table.sql" },
  { id: "011", name: "Create projects table", file: "011-create-projects-table.sql" },
  { id: "012", name: "Create classes table", file: "012-create-classes-table.sql" },
  { id: "001", name: "Create tasks table", file: "001_create_tasks_table.sql" },
  { id: "013", name: "Create canvas assignments table", file: "013-create-canvas-assignments-table.sql" },
  { id: "014", name: "Update tasks with foreign keys", file: "014-update-tasks-table-with-foreign-keys.sql" },
  { id: "015", name: "Create calendar tables", file: "015-create-calendar-tables.sql" },
  { id: "016", name: "Create email tables", file: "016-create-email-tables.sql" },
  { id: "017", name: "Create finance tables", file: "017-create-finance-tables.sql" },
]

type MigrationStatus = "pending" | "running" | "success" | "error"

interface MigrationResult {
  id: string
  status: MigrationStatus
  error?: string
}

export default function DatabaseSetupPage() {
  const [results, setResults] = useState<MigrationResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentMigration, setCurrentMigration] = useState<string | null>(null)

  const runMigrations = async () => {
    setIsRunning(true)
    setResults([])

    for (const migration of migrations) {
      setCurrentMigration(migration.name)

      try {
        // Fetch the SQL file content
        const sqlResponse = await fetch(`/scripts/${migration.file}`)
        if (!sqlResponse.ok) {
          throw new Error(`Failed to load ${migration.file}`)
        }
        const sql = await sqlResponse.text()

        // Execute the SQL
        const response = await fetch("/api/database/execute-sql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql }),
        })

        const result = await response.json()

        if (!response.ok || result.error) {
          setResults((prev) => [
            ...prev,
            {
              id: migration.id,
              status: "error",
              error: result.error || "Unknown error",
            },
          ])
        } else {
          setResults((prev) => [
            ...prev,
            {
              id: migration.id,
              status: "success",
            },
          ])
        }
      } catch (error) {
        setResults((prev) => [
          ...prev,
          {
            id: migration.id,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        ])
      }

      // Small delay between migrations
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setCurrentMigration(null)
    setIsRunning(false)
  }

  const getStatusIcon = (status: MigrationStatus) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <CardTitle>Database Setup</CardTitle>
          </div>
          <CardDescription>
            Run all database migrations to set up your Supabase tables, indexes, and RLS policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              This will create all necessary tables for your G+ application including workstreams, projects, classes,
              tasks, calendar, email, and finance management.
            </AlertDescription>
          </Alert>

          <Button onClick={runMigrations} disabled={isRunning} size="lg" className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migrations...
              </>
            ) : (
              "Run All Migrations"
            )}
          </Button>

          {currentMigration && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Currently running: {currentMigration}</AlertDescription>
            </Alert>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Migration Results:</h3>
              <div className="space-y-2">
                {migrations.map((migration) => {
                  const result = results.find((r) => r.id === migration.id)
                  const status = result?.status || "pending"

                  return (
                    <div key={migration.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      {getStatusIcon(status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{migration.name}</p>
                        <p className="text-sm text-muted-foreground">{migration.file}</p>
                        {result?.error && <p className="text-sm text-red-600 mt-1">{result.error}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {results.length > 0 && !isRunning && (
            <Alert className={results.every((r) => r.status === "success") ? "border-green-600" : "border-red-600"}>
              <AlertDescription>
                {results.every((r) => r.status === "success") ? (
                  <span className="text-green-600 font-semibold">✓ All migrations completed successfully!</span>
                ) : (
                  <span className="text-red-600 font-semibold">✗ Some migrations failed. Check the errors above.</span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
