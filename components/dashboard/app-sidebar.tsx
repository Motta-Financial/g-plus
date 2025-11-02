"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  LayoutDashboard,
  CheckSquare,
  Bell,
  FolderKanban,
  Settings,
  BookOpen,
  LogOut,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar() {
  const pathname = usePathname()
  const workstreams = useAppStore((state) => state.workstreams)
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const pendingTriageCount = useAppStore(
    (state) => state.triageItems.filter((item) => item.status === "pending").length,
  )
  const pendingEmailCount = useAppStore((state) => state.emails.filter((email) => email.status === "pending").length)
  const incompleteTodoCount = useAppStore((state) => state.tasks.filter((task) => task.status !== "completed").length)

  const mainNavItems = [
    { href: "/dashboard/triage", label: "Triage", icon: Bell, badge: pendingTriageCount + pendingEmailCount },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/todo", label: "To Do List", icon: CheckSquare, badge: incompleteTodoCount },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/classes", label: "Classes", icon: BookOpen },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const displayUser = user
    ? {
        firstName: user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User",
        lastName: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
        fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        imageUrl: user.user_metadata?.avatar_url || "/placeholder.svg?height=40&width=40",
      }
    : {
        firstName: "Grace",
        lastName: "Cha",
        fullName: "Grace Cha",
        email: "grace@example.com",
        imageUrl: "/placeholder.svg?height=40&width=40",
      }

  return (
    <div className="flex h-screen w-64 flex-shrink-0 flex-col border-r bg-sidebar">
      <div className="border-b px-6 py-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={displayUser.imageUrl || "/placeholder.svg"} alt={displayUser.fullName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-light">
              {displayUser.firstName[0]}
              {displayUser.lastName ? displayUser.lastName[0] : displayUser.firstName[1] || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-light tracking-[0.2em]">G+</h1>
            <p className="text-xs text-muted-foreground tracking-wide">Grace Plus</p>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={displayUser.imageUrl || "/placeholder.svg"} alt={displayUser.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-light">
                  {displayUser.firstName[0]}
                  {displayUser.lastName ? displayUser.lastName[0] : displayUser.firstName[1] || ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left flex-1 min-w-0">
                <p className="text-sm font-light truncate w-full">{displayUser.fullName}</p>
                <p className="text-xs text-muted-foreground truncate w-full">{displayUser.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/account" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
