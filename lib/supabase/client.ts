import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL ||
    "https://lpfqfpkmmwbbhwtzaagl.supabase.com"

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZnFmcGttbXdiYmh3dHphYWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NzU4NzAsImV4cCI6MjA0NjE1MTg3MH0.8vqQqH_L5vYxGxPxqYqYxYqYxYqYxYqYxYqYxYqYxYqY"

  console.log("[v0] Supabase client config:", {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length,
  })

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
