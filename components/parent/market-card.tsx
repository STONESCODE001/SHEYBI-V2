"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CardImage } from "@/components/child/card-image"
import { MarketOutcomeChip } from "@/components/child/market-outcome-chip"
import { CountdownTimer } from "@/components/child/countdown-timer"
import { StatisticDisplay } from "@/components/child/statistic-display"
import { ActionIcon } from "@/components/child/action-icon"
import { Share2, Bookmark } from "lucide-react"

interface MarketCardProps extends React.ComponentProps<"article"> {
  /** Market title. */
  readonly title: string
  /** Market description. */
  readonly description?: string
  /** Thumbnail image URL. */
  readonly imageUrl?: string
  /** Category label text. */
  readonly category: string
  /** Market status text. */
  readonly status: string
  /** Current Yes probability (0–100). */
  readonly yesProbability?: number
  /** Current No probability (0–100). */
  readonly noProbability?: number
  /** Market closing date. */
  readonly closingDate?: Date
  /** Volume in Naira. */
  readonly volume?: string
  /** Number of traders. */
  readonly traders?: string
  /** Whether the card is in loading state. */
  readonly loading?: boolean
  /** Whether the card is disabled. */
  readonly disabled?: boolean
  /** Card click handler (navigate to market details). */
  readonly onClick?: () => void
  /** Trade button click handler. */
  readonly onTrade?: () => void
  /** Share button click handler. */
  readonly onShare?: () => void
  /** Bookmark button click handler. */
  readonly onBookmark?: () => void
  /** Whether the market is bookmarked. */
  readonly bookmarked?: boolean
}

function MarketCardSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <Card
      className={cn(
        "w-full rounded-2xl border-[var(--border-default)] bg-[var(--bg-surface)] p-0 overflow-hidden",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="ml-auto h-4 w-20 rounded-md" />
        </div>
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </Card>
  )
}

function MarketCard({
  title,
  description,
  imageUrl,
  category,
  status,
  yesProbability,
  noProbability,
  closingDate,
  volume,
  traders,
  loading = false,
  disabled = false,
  onClick,
  onTrade,
  onShare,
  onBookmark,
  bookmarked = false,
  className,
  ...props
}: MarketCardProps): React.ReactElement {
  if (loading) {
    return <MarketCardSkeleton className={className} />
  }

  return (
    <article
      data-slot="market-card"
      aria-label={title}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "link" : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={
        onClick && !disabled
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        "group/market-card w-full rounded-2xl",
        "border border-[var(--border-default)] bg-[var(--bg-surface)]",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        "transition-all duration-200",
        "outline-none",
        onClick && !disabled && [
          "cursor-pointer",
          "hover:bg-[var(--bg-hover)] hover:border-[var(--border-hover)]",
          "hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        ],
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      {/* Thumbnail */}
      <div className="overflow-hidden rounded-t-2xl">
        <CardImage
          src={imageUrl}
          alt={`${title} thumbnail`}
          className="rounded-none"
        />
      </div>

      {/* Header — category, status, countdown */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <Badge variant="secondary" className="rounded-md text-xs">
          {category}
        </Badge>
        <Badge variant="outline" className="rounded-md text-xs">
          {status}
        </Badge>
        {closingDate && (
          <div className="ml-auto">
            <CountdownTimer targetDate={closingDate} size="sm" />
          </div>
        )}
      </div>

      {/* Content — title, description, outcomes, stats */}
      <div className="space-y-3 px-4 pt-3">
        <h3 className="line-clamp-2 text-lg font-semibold leading-[26px] text-[var(--text-primary)]">
          {title}
        </h3>

        {description && (
          <p className="line-clamp-2 text-sm leading-5 text-[var(--text-secondary)]">
            {description}
          </p>
        )}

        {/* Outcome chips */}
        {(yesProbability !== undefined || noProbability !== undefined) && (
          <div className="flex gap-2">
            {yesProbability !== undefined && (
              <MarketOutcomeChip outcome="yes">
                Yes {yesProbability}%
              </MarketOutcomeChip>
            )}
            {noProbability !== undefined && (
              <MarketOutcomeChip outcome="no">
                No {noProbability}%
              </MarketOutcomeChip>
            )}
          </div>
        )}

        {/* Statistics row */}
        {(volume || traders) && (
          <div className="flex gap-6">
            {volume && (
              <StatisticDisplay
                value={volume}
                label="Volume"
                className="text-sm [&_[data-slot=statistic-value]]:text-sm [&_[data-slot=statistic-value]]:font-semibold"
              />
            )}
            {traders && (
              <StatisticDisplay
                value={traders}
                label="Traders"
                className="text-sm [&_[data-slot=statistic-value]]:text-sm [&_[data-slot=statistic-value]]:font-semibold"
              />
            )}
          </div>
        )}
      </div>

      {/* Footer — trade button and action icons */}
      <div className="flex items-center gap-2 px-4 pb-4 pt-3">
        <Button
          variant="default"
          size="lg"
          className="min-h-11 flex-1 rounded-xl"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            onTrade?.()
          }}
          disabled={disabled}
        >
          Trade
        </Button>
        <div className="flex gap-1">
          <ActionIcon
            icon={Share2}
            aria-label="Share market"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              onShare?.()
            }}
          />
          <ActionIcon
            icon={Bookmark}
            aria-label="Bookmark market"
            active={bookmarked}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              onBookmark?.()
            }}
          />
        </div>
      </div>
    </article>
  )
}

export { MarketCard, MarketCardSkeleton }
export type { MarketCardProps }
