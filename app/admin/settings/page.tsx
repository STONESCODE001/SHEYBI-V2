"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader } from "@/components/parent"
import { PauseCircle } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
        <SectionHeader title="Platform Settings" />
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] text-center space-y-3">
          <PauseCircle className="size-12 text-[var(--text-muted)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Admin Settings Paused</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md">
            Platform settings configuration has been paused for the current MVP release build.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
