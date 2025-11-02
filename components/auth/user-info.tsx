import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "./sign-out-button"

export async function UserInfo() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.email}</p>
        <p className="text-xs text-muted-foreground">Signed in</p>
      </div>
      <SignOutButton />
    </div>
  )
}
