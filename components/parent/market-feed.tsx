import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EmptyIllustration } from "@/components/child/empty-illustration"
import { MarketCard, MarketCardSkeleton } from "./market-card"
import type { MarketCardProps } from "./market-card"

interface MarketFeedProps extends React.ComponentProps<"div"> {
  /** Array of market data to display. */
  readonly markets: readonly MarketCardProps[]
  /** Selected category filter. */
  readonly activeCategory?: string
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
  /** Whether to show the full-width 'see more ...' button below grid. Defaults to true. */
  readonly showSeeMore?: boolean
  /** Target link URL for 'see more ...' button. Defaults to /markets. */
  readonly seeMoreHref?: string
}

function MarketFeed({
  markets,
  activeCategory,
  loading = false,
  skeletonCount = 6,
  emptyTitle = "No markets found",
  emptyDescription = "There are no markets to display right now. Check back later for new predictions.",
  emptyActionLabel,
  onEmptyAction,
  showSeeMore = true,
  seeMoreHref = "/markets",
  className,
  ...props
}: MarketFeedProps): React.ReactElement {
  const displayedMarkets = React.useMemo(() => {
    if (!activeCategory || activeCategory === "trending") return markets
    return markets.filter((m) => {
      const cat = m.categoryLabel?.toLowerCase() || ""
      const selected = activeCategory.toLowerCase()
      if (selected === "hoh") return cat.includes("hoh") || cat.includes("bbnaija")
      if (selected === "weekly") return cat.includes("weekly") || cat.includes("eviction") || cat.includes("bbnaija")
      return cat.includes(selected)
    })
  }, [markets, activeCategory])
  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
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
      </div>
    )
  }

  if (displayedMarkets.length === 0) {
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
    <div data-slot="market-feed-container" className="flex flex-col gap-6 w-full">
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
        {displayedMarkets.map((market, index) => (
          <MarketCard key={market.title + index} {...market} />
        ))}
      </div>

      {showSeeMore && (
        <div className="w-full flex justify-center pt-2">
          <Link
            href={seeMoreHref}
            className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl bg-[#111726] hover:bg-[#1A2338] border border-[var(--border-default)] text-sm font-semibold text-gray-300 hover:text-white transition-all duration-200 select-none shadow-sm cursor-pointer"
          >
            see more ...
          </Link>
        </div>
      )}
    </div>
  )
}

export { MarketFeed }
export type { MarketFeedProps }

