import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email_account_id } = await request.json()

    // Get the email account
    const { data: emailAccount, error: accountError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", email_account_id)
      .eq("user_id", user.id)
      .single()

    if (accountError || !emailAccount) {
      return NextResponse.json({ error: "Email account not found" }, { status: 404 })
    }

    // TODO: Implement actual email sync based on provider
    // For now, return success
    const { error: updateError } = await supabase
      .from("email_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", email_account_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Email sync initiated" })
  } catch (error: any) {
    console.error("[v0] Email sync error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
