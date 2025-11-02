"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import type { Transaction, TransactionType, TransactionCategory } from "@/lib/types"
import { Plus } from "lucide-react"

interface TransactionDialogProps {
  transaction?: Transaction
  trigger?: React.ReactNode
}

const categories: TransactionCategory[] = [
  "Bills",
  "Food",
  "Grocery",
  "Gas",
  "Shopping",
  "Subscription",
  "Rent",
  "Hulu",
  "Car payment",
  "Eating out",
  "Target",
  "Tips",
  "Phone Bill",
  "Groceries",
  "Other",
]

export function TransactionDialog({ transaction, trigger }: TransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<TransactionType>(transaction?.type || "expense")
  const [category, setCategory] = useState<TransactionCategory>(transaction?.category || "Other")
  const [amount, setAmount] = useState(transaction?.amount.toString() || "")
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState(transaction?.description || "")

  const { addTransaction, updateTransaction } = useAppStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const transactionData = {
      user_id: "grace",
      type,
      category,
      amount: Number.parseFloat(amount),
      date,
      description,
    }

    if (transaction) {
      updateTransaction(transaction.id, transactionData)
    } else {
      addTransaction(transactionData)
    }

    setOpen(false)
    // Reset form
    if (!transaction) {
      setType("expense")
      setCategory("Other")
      setAmount("")
      setDate(new Date().toISOString().split("T")[0])
      setDescription("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Name</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transaction name"
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
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as TransactionCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{transaction ? "Update" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
