"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { SectionHeader, NotificationItem } from "@/components/parent"

export default function NotificationsPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <SectionHeader
          title="Notifications"
          actionLabel="Mark all as read"
          onAction={() => console.log("Mark all read")}
        />

        <div className="flex flex-col gap-2">
          <NotificationItem
            notificationType="market"
            title="Market Resolved"
            description="The market 'Next Reality TV Winner' has resolved to YES."
            timestamp="2 hours ago"
            unread={true}
          />
          <NotificationItem
            notificationType="wallet"
            title="Deposit Successful"
            description="Your deposit of $150.00 has been credited to your wallet."
            timestamp="1 day ago"
            unread={false}
          />
          <NotificationItem
            notificationType="system"
            title="New Follower"
            description="TraderBob started following you."
            timestamp="2 days ago"
            unread={false}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
