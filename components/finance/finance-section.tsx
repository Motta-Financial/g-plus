"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function FinanceSection() {
  // Mock data - in a real app, this would come from your store or database
  const financialSummary = {
    monthlyIncome: 3500,
    monthlyExpenses: 2800,
    savings: 12500,
    budgetRemaining: 700,
  }

  const expenseCategories = [
    { name: "Housing", amount: 1200, budget: 1200, color: "#6366f1" },
    { name: "Food", amount: 450, budget: 500, color: "#10b981" },
    { name: "Transportation", amount: 300, budget: 350, color: "#f59e0b" },
    { name: "Entertainment", amount: 200, budget: 250, color: "#ec4899" },
    { name: "Utilities", amount: 150, budget: 200, color: "#8b5cf6" },
    { name: "Other", amount: 500, budget: 600, color: "#06b6d4" },
  ]

  const recentTransactions = [
    { id: 1, description: "Grocery Store", amount: -85.32, date: "2025-10-29", category: "Food" },
    { id: 2, description: "Salary Deposit", amount: 3500.0, date: "2025-10-28", category: "Income" },
    { id: 3, description: "Gas Station", amount: -45.0, date: "2025-10-27", category: "Transportation" },
    { id: 4, description: "Netflix", amount: -15.99, date: "2025-10-26", category: "Entertainment" },
  ]

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="luxury-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-light uppercase tracking-wider">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light">${financialSummary.monthlyIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="luxury-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-light uppercase tracking-wider">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light">${financialSummary.monthlyExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">-5% from last month</p>
          </CardContent>
        </Card>

        <Card className="luxury-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-light uppercase tracking-wider">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light">${financialSummary.savings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Emergency fund goal: $15k</p>
          </CardContent>
        </Card>

        <Card className="luxury-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-light uppercase tracking-wider">Budget Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light">${financialSummary.budgetRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">For this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Budget by Category */}
        <Card className="luxury-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-light">Budget by Category</CardTitle>
                <CardDescription>Monthly spending breakdown</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseCategories.map((category) => {
              const percentage = (category.amount / category.budget) * 100
              const isOverBudget = percentage > 100

              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="font-light">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        ${category.amount} / ${category.budget}
                      </span>
                      {isOverBudget && (
                        <Badge variant="destructive" className="text-xs">
                          Over
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: isOverBudget ? "#ef4444" : category.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="luxury-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-light">Recent Transactions</CardTitle>
                <CardDescription>Last 4 transactions</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Receipt className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.amount > 0 ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-light text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-light ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Goals */}
      <Card className="luxury-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-light">Financial Goals</CardTitle>
              <CardDescription>Track your savings and investment goals</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-light">Emergency Fund</span>
                <span className="text-muted-foreground">$12,500 / $15,000</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-blue-600" style={{ width: "83%" }} />
              </div>
              <p className="text-xs text-muted-foreground">83% complete</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-light">Vacation Fund</span>
                <span className="text-muted-foreground">$2,800 / $5,000</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-amber-600" style={{ width: "56%" }} />
              </div>
              <p className="text-xs text-muted-foreground">56% complete</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-light">New Laptop</span>
                <span className="text-muted-foreground">$800 / $2,000</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-purple-600" style={{ width: "40%" }} />
              </div>
              <p className="text-xs text-muted-foreground">40% complete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
