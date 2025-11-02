"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { TransactionDialog } from "@/components/finance/transaction-dialog"
import { SavingsGoalDialog } from "@/components/finance/savings-goal-dialog"
import { AccountDialog } from "@/components/finance/account-dialog"
import { SubscriptionDialog } from "@/components/finance/subscription-dialog"
import { useAppStore } from "@/lib/store"
import Image from "next/image"
import { Pencil, Trash2, ExternalLink } from "lucide-react"

export default function FinancePage() {
  const {
    transactions,
    savingsGoals,
    accounts,
    subscriptions,
    financialGoals,
    deleteTransaction,
    deleteSavingsGoal,
    deleteAccount,
    deleteSubscription,
    updateFinancialGoal,
    addFinancialGoal,
    deleteFinancialGoal,
  } = useAppStore()

  const monthlySpending = transactions.filter((t) => t.type === "expense")
  const monthlyIncome = transactions.filter((t) => t.type === "income")
  const totalSpending = monthlySpending.reduce((sum, item) => sum + item.amount, 0)
  const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0)
  const netAmount = totalIncome - totalSpending

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="relative h-32 w-full overflow-hidden rounded-lg">
          <div className="absolute inset-0 grid grid-cols-5 gap-0">
            <div className="relative h-full w-full">
              <Image src="/nighttime-cityscape.jpg" alt="Finance banner" fill className="object-cover" />
            </div>
            <div className="relative h-full w-full">
              <Image src="/city-buildings-at-night.jpg" alt="Finance banner" fill className="object-cover" />
            </div>
            <div className="relative h-full w-full">
              <Image src="/cash-money-dollars.jpg" alt="Finance banner" fill className="object-cover" />
            </div>
            <div className="relative h-full w-full">
              <Image src="/modern-laptop.png" alt="Finance banner" fill className="object-cover" />
            </div>
            <div className="relative h-full w-full">
              <Image src="/financial-planning-meeting.png" alt="Finance banner" fill className="object-cover" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold">Finance Tracker</h1>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Savings Goals & Financial Goals */}
          <div className="space-y-6">
            {/* Savings Goals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Buy</CardTitle>
                <SavingsGoalDialog />
              </CardHeader>
              <CardContent className="space-y-4">
                {savingsGoals.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">No buy goals yet</p>
                ) : (
                  savingsGoals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                        <Image
                          src={goal.image_url || `/.jpg?height=120&width=200&query=${goal.name.toLowerCase()}`}
                          alt={goal.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{goal.name}</span>
                            {goal.website_url && (
                              <a
                                href={goal.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">${goal.current_amount.toLocaleString()}</span>
                            <SavingsGoalDialog
                              goal={goal}
                              trigger={
                                <Button size="icon" variant="ghost" className="h-6 w-6">
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              }
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => deleteSavingsGoal(goal.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <Progress value={(goal.current_amount / goal.target_amount) * 100} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {Math.round((goal.current_amount / goal.target_amount) * 100)}% of $
                          {goal.target_amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Financial Goals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Financial Goals</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const title = prompt("Enter goal title:")
                    if (title) {
                      addFinancialGoal({ user_id: "grace", title, completed: false })
                    }
                  }}
                >
                  Add Goal
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialGoals.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">No financial goals yet</p>
                  ) : (
                    financialGoals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-2">
                        <Checkbox
                          id={goal.id}
                          checked={goal.completed}
                          onCheckedChange={(checked) => updateFinancialGoal(goal.id, { completed: !!checked })}
                        />
                        <label
                          htmlFor={goal.id}
                          className="flex-1 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {goal.title}
                        </label>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => deleteFinancialGoal(goal.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Transaction Trackers */}
          <div className="space-y-6">
            {/* Monthly Spending Tracker */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                  Monthly Spending Tracker
                </CardTitle>
                <TransactionDialog
                  trigger={
                    <Button size="sm" variant="outline">
                      Add Expense
                    </Button>
                  }
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                    <div>Name</div>
                    <div>Amount</div>
                    <div>Date</div>
                    <div>Category</div>
                    <div></div>
                  </div>
                  {monthlySpending.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No expenses yet</p>
                  ) : (
                    monthlySpending.map((item) => (
                      <div key={item.id} className="grid grid-cols-5 gap-2 text-sm">
                        <div className="truncate">{item.description}</div>
                        <div>${item.amount}</div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                        <div>
                          <Badge variant="destructive" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <TransactionDialog
                            transaction={item}
                            trigger={
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Pencil className="h-3 w-3" />
                              </Button>
                            }
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => deleteTransaction(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="border-t pt-2 text-sm font-medium">Total: ${totalSpending.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Income Tracker */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                  Monthly Income Tracker
                </CardTitle>
                <TransactionDialog
                  trigger={
                    <Button size="sm" variant="outline">
                      Add Income
                    </Button>
                  }
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                    <div>Name</div>
                    <div>Date</div>
                    <div>Amount</div>
                    <div></div>
                  </div>
                  {monthlyIncome.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No income yet</p>
                  ) : (
                    monthlyIncome.map((item) => (
                      <div key={item.id} className="grid grid-cols-4 gap-2 text-sm">
                        <div>{item.description}</div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                        <div>
                          <Badge variant="default" className="bg-green-500 text-xs">
                            ${item.amount}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <TransactionDialog
                            transaction={item}
                            trigger={
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Pencil className="h-3 w-3" />
                              </Button>
                            }
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => deleteTransaction(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="border-t pt-2 text-sm font-medium">Total: ${totalIncome.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Net */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Monthly Net</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                    <div>Date</div>
                    <div>Name</div>
                    <div>Type</div>
                    <div>Amount</div>
                  </div>
                  {transactions.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No transactions yet</p>
                  ) : (
                    [...transactions]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((item) => (
                        <div key={item.id} className="grid grid-cols-4 gap-2 text-sm">
                          <div className="text-xs text-muted-foreground">{item.date}</div>
                          <div className="truncate">{item.description}</div>
                          <div>
                            <Badge
                              variant={item.type === "income" ? "default" : "destructive"}
                              className="bg-green-500 text-xs"
                            >
                              {item.type === "income" ? "Income" : "Spending"}
                            </Badge>
                          </div>
                          <div className={item.type === "income" ? "text-green-600" : "text-red-600"}>
                            ${item.amount}
                          </div>
                        </div>
                      ))
                  )}
                  <div className="border-t pt-2 text-sm font-medium">Net: ${netAmount.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analytics & Accounts */}
          <div className="space-y-6">
            {/* Spending Graph */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Spending Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex aspect-square items-center justify-center">
                  <div className="text-center text-sm text-muted-foreground">
                    Monthly Spending by Category
                    <div className="mt-4 text-xs">Chart visualization coming soon</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span>Bills</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span>Food</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>Grocery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span>Gas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <span>Shopping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-pink-500" />
                    <span>Subscription</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Statements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                  Account Statements
                </CardTitle>
                <AccountDialog />
              </CardHeader>
              <CardContent className="space-y-4">
                {accounts.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">No accounts yet</p>
                ) : (
                  accounts.map((account) => (
                    <div key={account.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{account.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={account.balance < 0 ? "text-red-600" : "text-green-600"}>
                            ${Math.abs(account.balance).toLocaleString()}
                          </span>
                          <AccountDialog
                            account={account}
                            trigger={
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Pencil className="h-3 w-3" />
                              </Button>
                            }
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => deleteAccount(account.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Progress value={Math.min((Math.abs(account.balance) / 10000) * 100, 100)} className="h-2" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Subscriptions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Subscriptions</CardTitle>
                <SubscriptionDialog />
              </CardHeader>
              <CardContent className="space-y-3">
                {subscriptions.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">No subscriptions yet</p>
                ) : (
                  subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium">{sub.name}</div>
                        <div className="text-xs text-muted-foreground">{sub.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-medium">${sub.amount.toFixed(2)}</div>
                        </div>
                        <SubscriptionDialog
                          subscription={sub}
                          trigger={
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                              <Pencil className="h-3 w-3" />
                            </Button>
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => deleteSubscription(sub.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
