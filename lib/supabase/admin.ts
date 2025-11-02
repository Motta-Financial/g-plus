import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL ||
    `https://lpfqfpkmmwbbhwtzaagl.supabase.com`

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY ||
    `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZnFmcGttbXdiYmh3dHphYWdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4NDE0NywiZXhwIjoyMDc2NDYwMTQ3fQ.xigeYrXOOa1Jxuq6pykM8tziVl4cte9QFJ8twSVJwIo`

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
