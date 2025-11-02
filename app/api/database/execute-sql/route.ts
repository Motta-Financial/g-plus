import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
    }

    console.log("[v0] Executing SQL:", sql.substring(0, 100) + "...")

    const supabase = createAdminClient()

    // Execute the SQL using the admin client
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("[v0] SQL execution error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] SQL executed successfully")
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
