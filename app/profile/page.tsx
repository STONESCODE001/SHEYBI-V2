"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { ProfileSummaryCard, StatisticCard } from "@/components/parent"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useDialog } from "@/components/dialog"
import { User, ShieldCheck, Settings as SettingsIcon, Sparkles } from "lucide-react"

export default function ProfilePage() {
  const dialog = useDialog()

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-4xl flex flex-col gap-8 py-2">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <User className="size-6 text-primary" />
              <span>User Profile</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Manage your personal identity, account settings, and trading performance.
            </p>
          </div>
        </div>

        {/* Mobile View: Profile Summary Card with Edit Button Trigger */}
        <div className="block md:hidden">
          <ProfileSummaryCard
            username="Jane Doe"
            verified={true}
            marketsTraded="156"
            winRate="64.5%"
            memberSince="Jan 2026"
            onEditProfile={() => dialog.open("profile/edit", { currentUsername: "Jane Doe" })}
          />
        </div>

        {/* Desktop View: Inline Clerk User Profile Container Layout */}
        <div className="hidden md:flex flex-col gap-6">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="size-16 border-2 border-primary/20" />
                <div className="absolute -bottom-1 -right-1 bg-success text-white p-0.5 rounded-full">
                  <ShieldCheck className="size-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Jane Doe</h2>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">
                    Verified Trader
                  </Badge>
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">jane.doe@example.com • Member since Jan 2026</p>
              </div>
            </div>

            <Button
              onClick={() => dialog.open("profile/edit", { currentUsername: "Jane Doe" })}
              className="bg-primary text-white hover:bg-primary-hover rounded-xl font-semibold gap-2"
            >
              <SettingsIcon className="size-4" />
              <span>Account Settings (Clerk)</span>
            </Button>
          </div>

          {/* Inline Clerk User Profile Slot Placeholder */}
          <div className="rounded-2xl border border-dashed border-primary/30 bg-[var(--bg-surface-secondary)]/60 p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="size-4" />
              <span>Clerk Authentication Slot</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              On desktop viewports, the native Clerk <code className="font-mono text-primary">&lt;UserProfile /&gt;</code> component will render inline directly within this surface container when backend authentication is connected.
            </p>
          </div>
        </div>

        {/* User Stats Summary Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatisticCard label="Leaderboard Rank" value="#1,204" />
          <StatisticCard label="Win Rate" value="64.5%" />
          <StatisticCard label="Markets Traded" value="156" />
          <StatisticCard label="Total Net Profit" value="+₦450,000" />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
