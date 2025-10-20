"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { WorkstreamManager } from "./workstream-manager"
import { ClassManager } from "./class-manager"
import { CalendarConnections } from "./calendar-connections"
import { EmailAccounts } from "./email-accounts"
import { Palette, Workflow, GraduationCap, Calendar, Mail } from "lucide-react"

interface SettingsClientProps {
  initialSettings: any
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [theme, setTheme] = useState(initialSettings?.theme || "light")
  const [primaryColor, setPrimaryColor] = useState(initialSettings?.primaryColor || "#6366f1")
  const [secondaryColor, setSecondaryColor] = useState(initialSettings?.secondaryColor || "#8b5cf6")
  const [accentColor, setAccentColor] = useState(initialSettings?.accentColor || "#ec4899")
  const [saving, setSaving] = useState(false)
  const updateSettings = useAppStore((state) => state.updateSettings)
  const { toast } = useToast()

  const handleSaveAppearance = async () => {
    setSaving(true)
    try {
      updateSettings({
        theme,
        primaryColor,
        secondaryColor,
        accentColor,
      })

      if (theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }

      toast({
        title: "Appearance updated",
        description: "Your customization settings have been saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appearance settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const colorPresets = [
    { name: "Indigo", primary: "#6366f1", secondary: "#8b5cf6", accent: "#ec4899" },
    { name: "Blue", primary: "#3b82f6", secondary: "#06b6d4", accent: "#8b5cf6" },
    { name: "Green", primary: "#10b981", secondary: "#14b8a6", accent: "#f59e0b" },
    { name: "Purple", primary: "#8b5cf6", secondary: "#a855f7", accent: "#ec4899" },
    { name: "Rose", primary: "#f43f5e", secondary: "#ec4899", accent: "#8b5cf6" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your appearance, workstreams, and integrations</p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="workstreams" className="gap-2">
              <Workflow className="h-4 w-4" />
              Workstreams
            </TabsTrigger>
            <TabsTrigger value="classes" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose your preferred color scheme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme Mode</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Customization</CardTitle>
                <CardDescription>Personalize your app with custom colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {colorPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPrimaryColor(preset.primary)
                          setSecondaryColor(preset.secondary)
                          setAccentColor(preset.accent)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                          </div>
                          {preset.name}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveAppearance} disabled={saving}>
                {saving ? "Saving..." : "Save Appearance"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="workstreams">
            <WorkstreamManager />
          </TabsContent>

          <TabsContent value="classes">
            <ClassManager />
          </TabsContent>

          <TabsContent value="email">
            <EmailAccounts />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarConnections />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
