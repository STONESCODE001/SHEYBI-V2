import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EmptyIllustration } from "@/components/child/empty-illustration"
import { MarketCard, MarketCardSkeleton } from "./market-card"
import type { MarketCardProps } from "./market-card"

interface MarketFeedProps extends React.ComponentProps<"div"> {
  /** Array of market data to display. */
  readonly markets: readonly MarketCardProps[]
  /** Whether the feed is in a loading state. */
  readonly loading?: boolean
  /** Number of skeleton cards to show during loading. */
  readonly skeletonCount?: number
  /** Empty state title. */
  readonly emptyTitle?: string
  /** Empty state description. */
  readonly emptyDescription?: string
  /** Optional action button text for empty state. */
  readonly emptyActionLabel?: string
  /** Optional action button handler for empty state. */
  readonly onEmptyAction?: () => void
}

function MarketFeed({
  markets,
  loading = false,
  skeletonCount = 6,
  emptyTitle = "No markets found",
  emptyDescription = "There are no markets to display right now. Check back later for new predictions.",
  emptyActionLabel,
  onEmptyAction,
  className,
  ...props
}: MarketFeedProps): React.ReactElement {
  if (loading) {
    return (
      <div
        data-slot="market-feed"
        role="feed"
        aria-busy="true"
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
          className
        )}
        {...props}
      >
        {Array.from({ length: skeletonCount }, (_, i) => (
          <MarketCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    )
  }

  if (markets.length === 0) {
    return (
      <div
        data-slot="market-feed"
        role="feed"
        aria-busy="false"
        className={cn("w-full", className)}
        {...props}
      >
        <EmptyIllustration
          title={emptyTitle}
          description={emptyDescription}
        >
          {emptyActionLabel && onEmptyAction && (
            <Button
              variant="default"
              size="lg"
              className="min-h-11 rounded-xl"
              onClick={onEmptyAction}
            >
              {emptyActionLabel}
            </Button>
          )}
        </EmptyIllustration>
      </div>
    )
  }

  return (
    <div
      data-slot="market-feed"
      role="feed"
      aria-busy="false"
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
      {...props}
    >
      {markets.map((market, index) => (
        <MarketCard key={market.title + index} {...market} />
      ))}
    </div>
  )
}

export { MarketFeed }
export type { MarketFeedProps }
