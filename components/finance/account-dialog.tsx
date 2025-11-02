"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import type { Account } from "@/lib/types"
import { Plus } from "lucide-react"

interface AccountDialogProps {
  account?: Account
  trigger?: React.ReactNode
}

export function AccountDialog({ account, trigger }: AccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(account?.name || "")
  const [type, setType] = useState<"checking" | "savings" | "credit">(account?.type || "checking")
  const [balance, setBalance] = useState(account?.balance.toString() || "0")
  const [lastFour, setLastFour] = useState(account?.last_four || "")

  const { addAccount, updateAccount } = useAppStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const accountData = {
      user_id: "grace",
      name,
      type,
      balance: Number.parseFloat(balance),
      last_four: lastFour,
    }

    if (account) {
      updateAccount(account.id, accountData)
    } else {
      addAccount(accountData)
    }

    setOpen(false)
    // Reset form
    if (!account) {
      setName("")
      setType("checking")
      setBalance("0")
      setLastFour("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? "Edit Account" : "Add Account"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chase Checking"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as "checking" | "savings" | "credit")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastFour">Last 4 Digits (optional)</Label>
            <Input
              id="lastFour"
              value={lastFour}
              onChange={(e) => setLastFour(e.target.value)}
              placeholder="1234"
              maxLength={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{account ? "Update" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
