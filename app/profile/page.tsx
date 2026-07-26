"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { ProfileSummaryCard, StatisticCard, SectionHeader } from "@/components/parent"
import { useDialog } from "@/components/dialog"

export default function ProfilePage() {
  const dialog = useDialog()

  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex max-w-4xl flex-col gap-8 md:gap-10">
        <ProfileSummaryCard
          username="Jane Doe"
          verified={true}
          marketsTraded="156"
          winRate="64%"
          memberSince="Oct 2026"
          onEditProfile={() => dialog.open("profile/edit", { currentUsername: "Jane Doe" })}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatisticCard label="Rank" value="#1,204" />
          <StatisticCard label="Win Rate" value="64%" />
          <StatisticCard label="Total Trades" value="156" />
          <StatisticCard label="Profit" value="+₦450,000" />
        </div>

        <div className="flex flex-col gap-4">
          <SectionHeader title="Recent Activity" />
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-secondary)] text-sm text-[var(--text-muted)]">
            Activity Feed Placeholder
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
