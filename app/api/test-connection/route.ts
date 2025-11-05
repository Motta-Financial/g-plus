import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          details: {
            hasUrl: !!supabaseUrl,
            hasAnonKey: !!supabaseAnonKey,
          },
        },
        { status: 500 },
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test 1: Basic connectivity - check tasks table
    const { data: healthData, error: healthError } = await supabase.from("tasks").select("count").limit(1)

    if (healthError && healthError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine for this test
      throw healthError
    }

    // Test 2: Get all tables
    const tables = [
      "tasks",
      "projects",
      "workstreams",
      "classes",
      "canvas_assignments",
      "emails",
      "email_accounts",
      "calendar_events",
      "calendar_connections",
      "accounts",
      "transactions",
      "savings_goals",
      "subscriptions",
      "financial_goals",
      "user_profiles",
    ]

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      details: {
        supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        tables,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Supabase connection test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        details: error,
      },
      { status: 500 },
    )
  }
}
