import { currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function syncUserToDatabase() {
  const user = await currentUser()
  if (!user) return null

  const supabase = await createClient()

  // Check if user exists
  const { data: existingUser } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!existingUser) {
    // Create new user
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        avatar_url: user.imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating user:", error)
      return null
    }

    return data
  }

  return existingUser
}
