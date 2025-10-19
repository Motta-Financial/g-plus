"use client"

import { SettingsClient } from "@/components/settings/settings-client"
import { useAppStore } from "@/lib/store"

export default function SettingsPage() {
  const settings = useAppStore((state) => state.settings)

  return <SettingsClient initialSettings={settings} />
}
