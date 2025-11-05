import { redirect } from "next/navigation"
// import { createClient } from "@/utils/supabase/server" // Commented out for testing

export default async function HomePage() {
  // To re-enable, uncomment the code below and remove the direct redirect
  redirect("/dashboard")

  /* AUTHENTICATION CODE - COMMENTED OUT FOR TESTING
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  redirect("/dashboard")
  */
}
