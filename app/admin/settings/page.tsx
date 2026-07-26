"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader, SettingCard } from "@/components/parent"

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <SectionHeader title="Platform Settings" />
        
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">General</h2>
          <SettingCard
            title="Maintenance Mode"
            description="Toggle maintenance mode for the entire platform."
            action={
              <div className="flex h-6 w-11 items-center rounded-full bg-[var(--bg-surface-secondary)] p-1">
                <div className="h-4 w-4 rounded-full bg-white transition-transform" />
              </div>
            }
          />
          <SettingCard
            title="New User Registration"
            description="Allow new users to sign up."
            action={
              <div className="flex h-6 w-11 items-center rounded-full bg-[var(--primary)] p-1">
                <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
              </div>
            }
          />
        </div>
      </div>
    </AdminLayout>
  )
}
