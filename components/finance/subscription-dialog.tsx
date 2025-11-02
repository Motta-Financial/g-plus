"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import type { Subscription } from "@/lib/types"
import { Plus } from "lucide-react"

interface SubscriptionDialogProps {
  subscription?: Subscription
  trigger?: React.ReactNode
}

export function SubscriptionDialog({ subscription, trigger }: SubscriptionDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(subscription?.name || "")
  const [amount, setAmount] = useState(subscription?.amount.toString() || "")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(subscription?.billing_cycle || "monthly")
  const [nextBillingDate, setNextBillingDate] = useState(
    subscription?.next_billing_date || new Date().toISOString().split("T")[0],
  )
  const [category, setCategory] = useState(subscription?.category || "")

  const { addSubscription, updateSubscription } = useAppStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subscriptionData = {
      user_id: "grace",
      name,
      amount: Number.parseFloat(amount),
      billing_cycle: billingCycle,
      next_billing_date: nextBillingDate,
      category,
    }

    if (subscription) {
      updateSubscription(subscription.id, subscriptionData)
    } else {
      addSubscription(subscriptionData)
    }

    setOpen(false)
    // Reset form
    if (!subscription) {
      setName("")
      setAmount("")
      setBillingCycle("monthly")
      setNextBillingDate(new Date().toISOString().split("T")[0])
      setCategory("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subscription ? "Edit Subscription" : "Add Subscription"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Netflix, Spotify"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle">Billing Cycle</Label>
            <Select value={billingCycle} onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextBilling">Next Billing Date</Label>
            <Input
              id="nextBilling"
              type="date"
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Entertainment, Productivity"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{subscription ? "Update" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
