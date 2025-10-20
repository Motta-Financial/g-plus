"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, LayoutDashboard, CheckSquare, Bell, FolderKanban } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { UserButton, useUser } from "@clerk/nextjs"

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const workstreams = useAppStore((state) => state.workstreams)
  const pendingTriageCount = useAppStore(
    (state) => state.triageItems.filter((item) => item.status === "pending").length,
  )

  const mainNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/todo", label: "To Do List", icon: CheckSquare },
    { href: "/dashboard/triage", label: "Triage", icon: Bell, badge: pendingTriageCount },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  ]

  return (
    <div className="flex h-screen w-64 flex-shrink-0 flex-col border-r bg-sidebar">
      <div className="border-b px-6 py-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={user?.fullName || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-light">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-light tracking-[0.2em]">Dashboard</h1>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <nav className="space-y-6">
          <div className="space-y-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-11 font-light tracking-wide",
                      isActive && "bg-accent text-accent-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs font-light">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>

          <div className="space-y-0.5 pt-4 border-t">
            <p className="px-3 pb-2 text-xs font-light uppercase tracking-[0.15em] text-muted-foreground">
              Workstreams
            </p>
            {workstreams.map((workstream) => {
              const href = `/dashboard/workstream/${workstream.id}`
              const isActive = pathname === href
              return (
                <Link key={workstream.id} href={href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-11 font-light tracking-wide",
                      isActive && "bg-accent text-accent-foreground",
                    )}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: workstream.color,
                      }}
                    />
                    <span className="flex-1 text-left text-sm">{workstream.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          <div className="flex flex-col items-start text-left flex-1">
            <p className="text-sm font-light">{user?.fullName || "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
