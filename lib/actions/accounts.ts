"use server"

import { createClient } from "@/utils/supabase/server"
import type { Account } from "@/lib/types"

export async function getAccounts(userId: string): Promise<Account[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching accounts:", error)
    throw new Error(`Failed to fetch accounts: ${error.message}`)
  }

  return data || []
}

export async function createAccount(account: Omit<Account, "id" | "created_at" | "updated_at">): Promise<Account> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: account.user_id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      last_four: account.last_four,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating account:", error)
    throw new Error(`Failed to create account: ${error.message}`)
  }

  return data
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("accounts").update(updates).eq("id", id)

  if (error) {
    console.error("[v0] Error updating account:", error)
    throw new Error(`Failed to update account: ${error.message}`)
  }
}

export async function deleteAccount(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("accounts").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting account:", error)
    throw new Error(`Failed to delete account: ${error.message}`)
  }
}
