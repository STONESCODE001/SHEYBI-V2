import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CardImage } from "@/components/child/card-image"
import { MarketOutcomeChip } from "@/components/child/market-outcome-chip"
import { CountdownTimer } from "@/components/child/countdown-timer"

interface SearchResultCardProps extends React.ComponentProps<"div"> {
  /** Market title. */
  readonly title: string
  /** Thumbnail image URL. */
  readonly imageUrl?: string
  /** Category label text. */
  readonly category: string
  /** Market status text. */
  readonly status: string
  /** Current Yes probability (0–100). */
  readonly yesProbability?: number
  /** Market closing date. */
  readonly closingDate?: Date
  /** Whether the card is in a loading state. */
  readonly loading?: boolean
  /** Click handler (navigate to market details). */
  readonly onClick?: () => void
}

function SearchResultCardSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl px-3 py-3", className)}>
      <Skeleton className="size-16 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-14 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-md" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
    </div>
  )
}

function SearchResultCard({
  title,
  imageUrl,
  category,
  status,
  yesProbability,
  closingDate,
  loading = false,
  onClick,
  className,
  ...props
}: SearchResultCardProps): React.ReactElement {
  if (loading) {
    return <SearchResultCardSkeleton className={className} />
  }

  return (
    <div
      data-slot="search-result-card"
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
      aria-label={`${title} - ${category} - ${status}`}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3",
        "transition-colors duration-200",
        "hover:bg-[var(--bg-hover)]",
        "active:bg-[var(--bg-active)]",
        "outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        onClick && "cursor-pointer",
        className
      )}
      {...props}
    >
      {/* Left: Small thumbnail */}
      <div className="size-16 shrink-0 overflow-hidden rounded-xl">
        <CardImage
          src={imageUrl}
          alt={`${title} thumbnail`}
          className="size-16 rounded-xl"
        />
      </div>

      {/* Centre: Title and badges */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="line-clamp-2 text-base font-medium leading-6 text-[var(--text-primary)]">
          {title}
        </p>
        <div className="flex gap-2">
          <Badge variant="secondary" className="rounded-md text-xs">
            {category}
          </Badge>
          <Badge variant="outline" className="rounded-md text-xs">
            {status}
          </Badge>
        </div>
      </div>

      {/* Right: Outcome and countdown */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {yesProbability !== undefined && (
          <MarketOutcomeChip outcome="yes">
            {yesProbability}%
          </MarketOutcomeChip>
        )}
        {closingDate && (
          <CountdownTimer targetDate={closingDate} size="sm" />
        )}
      </div>
    </div>
  )
}

export { SearchResultCard, SearchResultCardSkeleton }
export type { SearchResultCardProps }
