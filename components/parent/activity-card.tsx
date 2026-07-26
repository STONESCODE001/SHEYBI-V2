import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { StatisticDisplay } from "@/components/child/statistic-display"

type ActivityType = "trade" | "deposit" | "withdrawal" | "market_event"

interface ActivityCardProps extends React.ComponentProps<"div"> {
  /** Username of the person who performed the action. */
  readonly username: string
  /** User avatar URL. */
  readonly avatarUrl?: string
  /** Description of the activity. */
  readonly description: string
  /** Activity type for the badge. */
  readonly activityType: ActivityType
  /** Transaction amount. */
  readonly amount?: string
  /** Timestamp of the activity. */
  readonly timestamp: string
  /** Full date/time for accessibility. */
  readonly fullDateTime?: string
  /** Whether the card is in a loading state. */
  readonly loading?: boolean
  /** Click handler. */
  readonly onClick?: () => void
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  trade: "Trade",
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  market_event: "Event",
}

function ActivityCardSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2", className)}>
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </div>
      <div className="space-y-1.5 text-right">
        <Skeleton className="ml-auto h-4 w-16 rounded-md" />
        <Skeleton className="ml-auto h-4 w-12 rounded-md" />
      </div>
    </div>
  )
}

function ActivityCard({
  username,
  avatarUrl,
  description,
  activityType,
  amount,
  timestamp,
  fullDateTime,
  loading = false,
  onClick,
  className,
  ...props
}: ActivityCardProps): React.ReactElement {
  if (loading) {
    return <ActivityCardSkeleton className={className} />
  }

  const initials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      data-slot="activity-card"
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
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2",
        "transition-colors duration-200",
        "hover:bg-[var(--bg-hover)]",
        "outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        onClick && "cursor-pointer",
        className
      )}
      {...props}
    >
      {/* Left: Avatar */}
      <Avatar size="default" className="shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      {/* Centre: Description */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-[var(--text-primary)]">
          <span className="font-semibold">{username}</span>{" "}
          {description}
        </p>
        <time
          className="text-xs text-[var(--text-muted)]"
          aria-label={fullDateTime || timestamp}
          dateTime={fullDateTime}
        >
          {timestamp}
        </time>
      </div>

      {/* Right: Amount */}
      {amount && (
        <div className="flex shrink-0 flex-col items-end">
          <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
            {amount}
          </span>
        </div>
      )}
    </div>
  )
}

export { ActivityCard, ActivityCardSkeleton }
export type { ActivityCardProps, ActivityType }
