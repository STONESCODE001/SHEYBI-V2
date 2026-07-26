"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { SectionHeader } from "@/components/parent"
import { Settings2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 py-4">
        <SectionHeader title="Settings" />
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] text-center space-y-3">
          <Settings2 className="size-12 text-[var(--text-muted)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Settings Paused</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md">
            Settings management is currently paused for this release phase. Please manage your profile via the Profile page.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
