import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatisticDisplay } from "@/components/child/statistic-display"

interface ProfileSummaryCardProps extends React.ComponentProps<"div"> {
  /** User display name. */
  readonly username: string
  /** User avatar URL. */
  readonly avatarUrl?: string
  /** Whether the user is verified. */
  readonly verified?: boolean
  /** Number of markets traded. */
  readonly marketsTraded?: string
  /** Win rate percentage. */
  readonly winRate?: string
  /** Member since date. */
  readonly memberSince?: string
  /** Whether the card is in a loading state. */
  readonly loading?: boolean
  /** Edit profile click handler. */
  readonly onEditProfile?: () => void
}

function ProfileSummaryCardSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-7 w-32 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <div className="flex w-full justify-center gap-6">
          <Skeleton className="h-10 w-20 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}

function ProfileSummaryCard({
  username,
  avatarUrl,
  verified = false,
  marketsTraded,
  winRate,
  memberSince,
  loading = false,
  onEditProfile,
  className,
  ...props
}: ProfileSummaryCardProps): React.ReactElement {
  if (loading) {
    return <ProfileSummaryCardSkeleton className={className} {...props} />
  }

  const initials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      data-slot="profile-summary-card"
      className={cn(
        "w-full rounded-2xl",
        "border border-[var(--border-default)] bg-[var(--bg-surface)]",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        "p-5 transition-colors duration-200",
        "hover:bg-[var(--bg-hover)]",
        className
      )}
      {...props}
    >
      {/* Header — Avatar, username, verification */}
      <div className="flex flex-col items-center gap-3">
        <Avatar size="lg" className="size-20">
          {avatarUrl && (
            <AvatarImage src={avatarUrl} alt={`${username} profile photo`} />
          )}
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>

        <h3 className="text-xl font-semibold leading-7 text-center text-[var(--text-primary)]">
          {username}
        </h3>

        {verified && (
          <Badge variant="default" className="rounded-md text-xs">
            Verified
          </Badge>
        )}
      </div>

      {/* Content — Statistics */}
      <div className="mt-6 flex justify-center gap-6">
        {marketsTraded && (
          <StatisticDisplay
            value={marketsTraded}
            label="Markets"
            className="items-center text-center [&_[data-slot=statistic-value]]:text-lg [&_[data-slot=statistic-value]]:font-bold"
          />
        )}
        {winRate && (
          <StatisticDisplay
            value={winRate}
            label="Win Rate"
            className="items-center text-center [&_[data-slot=statistic-value]]:text-lg [&_[data-slot=statistic-value]]:font-bold"
          />
        )}
        {memberSince && (
          <StatisticDisplay
            value={memberSince}
            label="Member Since"
            className="items-center text-center [&_[data-slot=statistic-value]]:text-lg [&_[data-slot=statistic-value]]:font-bold"
          />
        )}
      </div>

      {/* Edit profile button */}
      {onEditProfile && (
        <Button
          variant="outline"
          size="lg"
          className="mt-6 min-h-11 w-full rounded-xl"
          onClick={onEditProfile}
          aria-label="Edit profile"
        >
          Edit Profile
        </Button>
      )}
    </div>
  )
}

export { ProfileSummaryCard, ProfileSummaryCardSkeleton }
export type { ProfileSummaryCardProps }
