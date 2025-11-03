import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  console.log("[v0] Creating Supabase client...")
  console.log("[v0] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Found" : "✗ Missing")
  console.log(
    "[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Found" : "✗ Missing",
  )

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    const errorMsg = `Missing Supabase environment variables:\n- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✓" : "✗"}\n- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? "✗" : "✗"}`
    console.error("[v0]", errorMsg)
    throw new Error(errorMsg)
  }

  console.log("[v0] Supabase client created successfully")
  return createBrowserClient(supabaseUrl, supabaseKey)
}
