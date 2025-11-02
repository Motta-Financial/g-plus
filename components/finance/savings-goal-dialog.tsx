"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/lib/store"
import type { SavingsGoal } from "@/lib/types"
import { Plus } from "lucide-react"

interface SavingsGoalDialogProps {
  goal?: SavingsGoal
  trigger?: React.ReactNode
}

export function SavingsGoalDialog({ goal, trigger }: SavingsGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(goal?.name || "")
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount.toString() || "")
  const [currentAmount, setCurrentAmount] = useState(goal?.current_amount.toString() || "0")
  const [imageUrl, setImageUrl] = useState(goal?.image_url || "")
  const [websiteUrl, setWebsiteUrl] = useState(goal?.website_url || "")

  const { addSavingsGoal, updateSavingsGoal } = useAppStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const goalData = {
      user_id: "grace",
      name,
      target_amount: Number.parseFloat(targetAmount),
      current_amount: Number.parseFloat(currentAmount),
      image_url: imageUrl,
      website_url: websiteUrl,
    }

    if (goal) {
      updateSavingsGoal(goal.id, goalData)
    } else {
      addSavingsGoal(goalData)
    }

    setOpen(false)
    // Reset form
    if (!goal) {
      setName("")
      setTargetAmount("")
      setCurrentAmount("0")
      setImageUrl("")
      setWebsiteUrl("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Buy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Buy Goal" : "Add Buy Goal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Car, Vacation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Amount</Label>
            <Input
              id="target"
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current">Current Amount</Label>
            <Input
              id="current"
              type="number"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL (optional)</Label>
            <Input
              id="website"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{goal ? "Update" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
