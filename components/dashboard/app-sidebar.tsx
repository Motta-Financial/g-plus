"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Settings, Sparkles, LayoutDashboard } from "lucide-react"

export function AppSidebar() {
  const pathname = usePathname()
  const workstreams = useAppStore((state) => state.workstreams)

  const mainNavItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/assistant", label: "Assistant", icon: Sparkles },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar/80 backdrop-blur-xl">
      <div className="border-b border-sidebar-border/50 px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg glow-effect">
            <span className="text-lg font-light text-primary-foreground">G</span>
          </div>
          <div>
            <h1 className="text-lg font-light tracking-widest text-sidebar-foreground">GRACE</h1>
            <p className="text-xs tracking-wide text-muted-foreground">PROJECT MANAGER</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-8">
          <div className="space-y-1">
            <p className="px-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">NAVIGATION</p>
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 font-light tracking-wide transition-all hover:bg-sidebar-accent/50",
                      isActive &&
                        "bg-gradient-to-r from-primary/20 to-accent/20 text-sidebar-accent-foreground shadow-md",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          <div className="space-y-1">
            <p className="px-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">WORKSTREAMS</p>
            {workstreams.map((workstream) => {
              const href = `/dashboard/workstream/${workstream.id}`
              const isActive = pathname === href
              return (
                <Link key={workstream.id} href={href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 font-light tracking-wide transition-all hover:bg-sidebar-accent/50",
                      isActive &&
                        "bg-gradient-to-r from-primary/20 to-accent/20 text-sidebar-accent-foreground shadow-md",
                    )}
                  >
                    <div
                      className="h-2 w-2 rounded-full shadow-lg"
                      style={{
                        backgroundColor: workstream.color,
                        boxShadow: `0 0 10px ${workstream.color}80`,
                      }}
                    />
                    <span className="flex-1 text-left">{workstream.name}</span>
                    <span className="text-xs">{workstream.icon}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      <div className="border-t border-sidebar-border/50 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-sidebar-accent/50">
              <Avatar className="h-8 w-8 shadow-lg glow-effect">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-light">
                  GC
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <p className="text-sm font-light tracking-wide">Grace Cha</p>
                <p className="text-xs tracking-wide text-muted-foreground">SETTINGS</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-effect">
            <DropdownMenuLabel className="font-light tracking-wide">ACCOUNT</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer font-light tracking-wide">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
