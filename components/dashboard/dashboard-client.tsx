"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "./dashboard-layout"
import { TaskDialog } from "./task-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DatabaseStatus } from "@/components/database/database-status"
import {
  Plus,
  Inbox,
  FolderKanban,
  CheckSquare,
  Calendar,
  BookOpen,
  Target,
  StickyNote,
  Archive,
  FileText,
} from "lucide-react"
import Link from "next/link"

export function DashboardClient() {
  const workstreams = useAppStore((state) => state.workstreams)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const navigationItems = [
    { label: "Inbox", icon: Inbox, href: "/dashboard/triage", color: "bg-muted/50" },
    { label: "Finance", icon: FileText, href: "/dashboard/finance", color: "bg-primary/10" },
    { label: "Projects", icon: FolderKanban, href: "/dashboard/projects", color: "bg-secondary/10" },
    { label: "Tasks", icon: CheckSquare, href: "/dashboard/todo-list", color: "bg-accent/20" },
    { label: "Calendar", icon: Calendar, href: "/dashboard/calendar", color: "bg-primary/15" },
    { label: "Classes", icon: BookOpen, href: "/dashboard/classes", color: "bg-accent/15" },
    { label: "Goals", icon: Target, href: "/dashboard/goals", color: "bg-secondary/15" },
    { label: "Notes", icon: StickyNote, href: "/dashboard/notes", color: "bg-muted/40" },
    { label: "Archives", icon: Archive, href: "/dashboard/archives", color: "bg-muted/30" },
  ]

  const quickActions = [
    { label: "New Project", icon: FolderKanban, action: () => {} },
    { label: "New Task", icon: CheckSquare, action: () => setIsTaskDialogOpen(true) },
    { label: "New Note", icon: FileText, action: () => {} },
    { label: "New Class", icon: BookOpen, action: () => {} },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-lg bg-accent/30 flex items-center justify-center border-2 border-border shadow-sm">
              <div className="text-2xl">🧠</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Grace Plus</h1>
        </div>

        <DatabaseStatus />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Navigation</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.label} href={item.href}>
                  <Card className="luxury-card p-6 cursor-pointer group">
                    <div className="flex flex-col items-start gap-3">
                      <div
                        className={`p-3 rounded-lg ${item.color} group-hover:scale-105 transition-transform border border-border/50`}
                      >
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>

          <Button
            variant="ghost"
            className="w-full justify-center gap-2 text-muted-foreground hover:text-primary hover:bg-accent/20"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  onClick={action.action}
                  className="h-auto py-4 px-4 justify-start gap-3 hover:bg-accent/20 hover:border-primary bg-card border-2"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{action.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Task Dialog */}
        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          workstreams={workstreams}
          onTaskCreated={() => setIsTaskDialogOpen(false)}
        />
      </div>
    </DashboardLayout>
  )
}
