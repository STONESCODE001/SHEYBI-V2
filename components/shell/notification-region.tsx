"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationDot } from "@/components/child/notification-dot"
import type { ShellVariant } from "./types"

interface NotificationRegionProps {
  readonly variant: ShellVariant
  readonly unreadCount?: number
  readonly className?: string
}

function NotificationRegion({
  variant,
  unreadCount = 0,
  className,
}: NotificationRegionProps) {
  const href = variant === "admin" ? "/admin" : "/notifications"
  const hasUnread = unreadCount > 0
  const label = hasUnread
    ? `Notifications, ${unreadCount} unread`
    : "Notifications"

  return (
    <Link
      href={href}
      data-slot="notification-region"
      aria-label={label}
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
        "text-[var(--text-muted)] outline-none transition-colors duration-200",
        "hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        className
      )}
    >
      <Bell className="size-5" aria-hidden="true" />
      <NotificationDot variant="alert" visible={hasUnread} />
      {hasUnread ? (
        <span className="sr-only">{unreadCount} unread</span>
      ) : null}
    </Link>
  )
}

export { NotificationRegion }
export type { NotificationRegionProps }
