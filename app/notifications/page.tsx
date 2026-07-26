"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { SectionHeader } from "@/components/parent"
import { BellOff } from "lucide-react"

export default function NotificationsPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 py-4">
        <SectionHeader title="Notifications" />
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] text-center space-y-3">
          <BellOff className="size-12 text-[var(--text-muted)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Notifications Paused</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md">
            The notifications feature is currently paused for this release phase.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
