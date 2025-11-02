import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL ||
    `https://lpfqfpkmmwbbhwtzaagl.supabase.com`

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY ||
    `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZnFmcGttbXdiYmh3dHphYWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODQxNDcsImV4cCI6MjA3NjQ2MDE0N30.TPXQ7SXKqBYP974vTDJhfaOUfKh9osvRBNOCVjEd0rE`

  console.log("[v0] Supabase Client Config:", {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    anonKeyLength: supabaseAnonKey?.length,
  })

  if (!supabaseAnonKey) {
    console.error("[v0] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
    throw new Error(
      "Supabase configuration error: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. " +
        "Please add this environment variable in your Vercel project settings.",
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
