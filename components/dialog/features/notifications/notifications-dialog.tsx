"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription, DialogScrollArea, DialogLoadingState, DialogEmptyState, DialogErrorState, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { NotificationItem } from "@/components/parent/notification-item"

interface NotificationsDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
}

interface NotificationData {
  id: string
  title: string
  description?: string
  notificationType: "market" | "trade" | "wallet" | "system"
  unread: boolean
  timestamp: string
}

const INITIAL_NOTIFICATIONS: NotificationData[] = [
  {
    id: "1",
    title: "Deposit Successful",
    description: "Your deposit of ₦50,000.00 via Mastercard has been completed.",
    notificationType: "wallet",
    unread: true,
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    title: "Trade Executed",
    description: "Your buy order for 150 YES shares on Central Bank interest rates filled at 45¢.",
    notificationType: "trade",
    unread: true,
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    title: "Market Closing Soon",
    description: "The BBNaija Season 11 launch prediction market is closing in 12 hours.",
    notificationType: "market",
    unread: false,
    timestamp: "1 day ago",
  },
]

export function NotificationsDialog({ isOpen, onClose, status }: NotificationsDialogProps) {
  const [notifications, setNotifications] = React.useState<NotificationData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    setError(null)

    // Simulate API fetch delay
    const timer = setTimeout(() => {
      try {
        setNotifications(INITIAL_NOTIFICATIONS)
        setLoading(false)
      } catch (err) {
        setError("Failed to load notifications. Please try again.")
        setLoading(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isOpen])

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const handleItemClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="md"
      title="Notifications"
      description="View your system notifications, wallet alerts and predictions updates."
    >
      <DialogHeader className="p-0 flex flex-row items-center justify-between">
        <div>
          <DialogTitle className="text-xl">Notifications</DialogTitle>
          <DialogDescription>
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}.
          </DialogDescription>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs text-primary hover:text-primary-hover font-medium underline"
          >
            Mark all read
          </Button>
        )}
      </DialogHeader>

      <div className="mt-4 flex-1">
        {loading && <DialogLoadingState message="Fetching notifications..." />}

        {error && (
          <DialogErrorState
            title="Unable to load feed"
            message={error}
          />
        )}

        {!loading && !error && notifications.length === 0 && (
          <DialogEmptyState
            title="All caught up!"
            description="You don't have any notifications right now."
          />
        )}

        {!loading && !error && notifications.length > 0 && (
          <DialogScrollArea className="max-h-[350px] flex flex-col gap-2 divide-y divide-[var(--border-default)]/20" role="list">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                title={notif.title}
                description={notif.description}
                notificationType={notif.notificationType}
                unread={notif.unread}
                timestamp={notif.timestamp}
                onClick={() => handleItemClick(notif.id)}
              />
            ))}
          </DialogScrollArea>
        )}
      </div>

      <DialogFooter className="mt-4 p-0">
        <Button onClick={onClose} className="w-full text-[var(--text-secondary)] border-[var(--border-default)]" variant="outline">
          Dismiss
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default NotificationsDialog
