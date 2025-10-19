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
import { Calendar, Settings, LayoutDashboard, CheckSquare, Bell, FolderKanban } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AppSidebar() {
  const pathname = usePathname()
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
    <div className="flex h-screen w-64 flex-col border-r border-white/5 bg-[#0a0a0c]">
      <div className="border-b border-white/5 px-6 py-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm font-light">
              GC
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-light tracking-[0.2em] text-white">Dashboard</h1>
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
                      "w-full justify-start gap-3 h-11 font-light tracking-wide text-gray-400 hover:text-white hover:bg-white/5",
                      isActive && "bg-white/8 text-white",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge
                        variant="secondary"
                        className="h-5 min-w-5 px-1.5 text-xs bg-pink-500/20 text-pink-400 border-pink-500/30 font-light"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>

          <div className="space-y-0.5 pt-4 border-t border-white/5">
            <p className="px-3 pb-2 text-xs font-light uppercase tracking-[0.15em] text-gray-500">Workstreams</p>
            {workstreams.map((workstream) => {
              const href = `/dashboard/workstream/${workstream.id}`
              const isActive = pathname === href
              return (
                <Link key={workstream.id} href={href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-11 font-light tracking-wide text-gray-400 hover:text-white hover:bg-white/5",
                      isActive && "bg-white/8 text-white",
                    )}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: workstream.color,
                        boxShadow: `0 0 8px ${workstream.color}60`,
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

      <div className="border-t border-white/5 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 hover:bg-white/5">
              <Avatar className="h-8 w-8 border border-white/10">
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs font-light">
                  GC
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <p className="text-sm font-light text-white">Account</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-effect border-white/10">
            <DropdownMenuLabel className="font-light tracking-wide text-gray-300">Grace Cha</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer font-light tracking-wide text-gray-300">
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
