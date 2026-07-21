import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationDot } from "@/components/child/notification-dot"

type NotificationType = "market" | "trade" | "wallet" | "system"

interface NotificationItemProps extends React.ComponentProps<"div"> {
  /** Notification title. */
  readonly title: string
  /** Notification description. */
  readonly description?: string
  /** Notification type for the badge. */
  readonly notificationType: NotificationType
  /** Source avatar URL (system or user). */
  readonly avatarUrl?: string
  /** Source name for the avatar fallback. */
  readonly sourceName?: string
  /** Whether the notification is unread. */
  readonly unread?: boolean
  /** Timestamp display text. */
  readonly timestamp: string
  /** Full date/time for accessibility. */
  readonly fullDateTime?: string
  /** Whether the item is in a loading state. */
  readonly loading?: boolean
  /** Click handler (navigate to related screen). */
  readonly onClick?: () => void
}

const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  market: "Market",
  trade: "Trade",
  wallet: "Wallet",
  system: "System",
}

function NotificationItemSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <div className={cn("flex items-start gap-3 px-3 py-3", className)}>
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
      <Skeleton className="h-5 w-14 rounded-md" />
    </div>
  )
}

function NotificationItem({
  title,
  description,
  notificationType,
  avatarUrl,
  sourceName = "System",
  unread = false,
  timestamp,
  fullDateTime,
  loading = false,
  onClick,
  className,
  ...props
}: NotificationItemProps): React.ReactElement {
  if (loading) {
    return <NotificationItemSkeleton className={className} />
  }

  const initials = sourceName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      data-slot="notification-item"
      role="listitem"
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      aria-label={`${unread ? "Unread: " : ""}${title}`}
      className={cn(
        "flex items-start gap-3 rounded-xl px-3 py-3",
        "transition-colors duration-200",
        unread ? "bg-[var(--bg-surface-secondary)]" : "bg-transparent",
        "hover:bg-[var(--bg-hover)]",
        "active:bg-[var(--bg-active)]",
        "outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        onClick && "cursor-pointer",
        className
      )}
      {...props}
    >
      {/* Left: Avatar with NotificationDot */}
      <div className="relative shrink-0">
        <Avatar size="default">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={sourceName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <NotificationDot visible={unread} />
      </div>

      {/* Centre: Title, description, timestamp */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "truncate text-sm text-[var(--text-primary)]",
            unread && "font-semibold"
          )}
        >
          {title}
        </p>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-[var(--text-muted)]">
            {description}
          </p>
        )}
        <time
          className="mt-1 block text-xs text-[var(--text-muted)]"
          aria-label={fullDateTime || timestamp}
          dateTime={fullDateTime}
        >
          {timestamp}
        </time>
      </div>

      {/* Right: Notification type badge */}
      <Badge variant="secondary" className="shrink-0 rounded-md text-xs">
        {NOTIFICATION_LABELS[notificationType]}
      </Badge>
    </div>
  )
}

export { NotificationItem, NotificationItemSkeleton }
export type { NotificationItemProps, NotificationType }
