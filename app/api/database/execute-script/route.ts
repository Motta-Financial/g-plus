import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function POST(request: Request) {
  try {
    const { scriptPath } = await request.json()

    if (!scriptPath) {
      return NextResponse.json({ error: "Script path is required" }, { status: 400 })
    }

    // Read the SQL file
    const fullPath = join(process.cwd(), scriptPath)
    const sqlContent = await readFile(fullPath, "utf-8")

    // Create Supabase client
    const supabase = await createClient()

    // Execute the SQL
    // Note: Supabase client doesn't have direct SQL execution for security
    // We need to use the REST API or execute via RPC
    const { data, error } = await supabase.rpc("exec_sql", { sql: sqlContent })

    if (error) {
      console.error("[v0] SQL execution error:", error)
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully executed ${scriptPath}`,
      data,
    })
  } catch (error: any) {
    console.error("[v0] Script execution error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to execute script",
      },
      { status: 500 },
    )
  }
}
