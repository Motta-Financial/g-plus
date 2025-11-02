// Script to run all SQL migrations in order
// Run this with: npx tsx scripts/run-migrations.ts

import { createClient } from "@supabase/supabase-js"
import { readFile } from "fs/promises"
import { join } from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const migrations = [
  "scripts/001_create_tasks_table.sql",
  "scripts/002_add_timeframe_to_canvas_assignments.sql",
  "scripts/003-add-class-field.sql",
  "scripts/007-add-canvas-to-classes.sql",
]

async function runMigrations() {
  console.log("Starting database migrations...")

  for (const migration of migrations) {
    try {
      console.log(`\nRunning ${migration}...`)

      const sqlContent = await readFile(join(process.cwd(), migration), "utf-8")

      // Split by semicolons to execute statements individually
      const statements = sqlContent
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"))

      for (const statement of statements) {
        const { error } = await supabase.rpc("exec_sql", { sql: statement })

        if (error) {
          console.error(`Error executing statement:`, error)
          throw error
        }
      }

      console.log(`✓ Successfully executed ${migration}`)
    } catch (error: any) {
      console.error(`✗ Failed to execute ${migration}:`, error.message)
      process.exit(1)
    }
  }

  console.log("\n✓ All migrations completed successfully!")
}

runMigrations()
