"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { SectionHeader, SettingCard } from "@/components/parent"
import { useDialog } from "@/components/dialog"

export default function SettingsPage() {
  const dialog = useDialog()

  const handleChangeEmail = () => {
    dialog.open("settings/change-email", { currentEmail: "jane.doe@example.com" })
  }

  const handleUpdatePassword = () => {
    dialog.open("settings/update-password")
  }

  const handleDeleteAccount = async () => {
    const confirmed = await dialog.confirm({
      title: "Delete Account",
      description: "Are you sure you want to permanently delete your account and all associated data? This action is irreversible.",
      cancelLabel: "Keep Account",
      actionLabel: "Delete Forever"
    })
    if (confirmed) {
      const loader = dialog.loading({
        title: "Deleting Account",
        description: "Wiping all user details and database records..."
      })
      await new Promise((r) => setTimeout(r, 1500))
      loader.close()
      
      await dialog.success({
        title: "Account Wiped",
        description: "Your Sheybi account has been permanently deleted. We are sorry to see you go."
      })
      window.location.href = "/"
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <SectionHeader title="Settings" />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Account</h2>
            <SettingCard
              title="Email Address"
              description="jane.doe@example.com"
              action={
                <button onClick={handleChangeEmail} className="text-sm font-medium text-[var(--primary)] hover:underline cursor-pointer outline-none">
                  Change
                </button>
              }
            />
            <SettingCard
              title="Password"
              description="Last changed 3 months ago"
              action={
                <button onClick={handleUpdatePassword} className="text-sm font-medium text-[var(--primary)] hover:underline cursor-pointer outline-none">
                  Update
                </button>
              }
            />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Preferences</h2>
            <SettingCard
              title="Push Notifications"
              description="Receive alerts for market resolutions and deposits."
              action={
                <div className="flex h-6 w-11 items-center rounded-full bg-[var(--primary)] p-1">
                  <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
                </div>
              }
            />
            <SettingCard
              title="Email Digest"
              description="Weekly summary of your portfolio performance."
              action={
                <div className="flex h-6 w-11 items-center rounded-full bg-[var(--bg-surface-secondary)] p-1 border border-[var(--border-default)]">
                  <div className="h-4 w-4 rounded-full bg-white transition-transform" />
                </div>
              }
            />
          </div>
          
          <div className="flex flex-col gap-4">
             <h2 className="text-lg font-semibold text-[var(--danger)]">Danger Zone</h2>
             <SettingCard
              title="Delete Account"
              description="Permanently delete your account and all associated data."
              action={
                <button onClick={handleDeleteAccount} className="text-sm font-medium text-[var(--danger)] hover:underline cursor-pointer outline-none">
                  Delete
                </button>
              }
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
