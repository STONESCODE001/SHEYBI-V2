import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { StatisticDisplay } from "@/components/child/statistic-display"
import { PercentageIndicator } from "@/components/child/percentage-indicator"

interface PortfolioCardProps extends React.ComponentProps<"div"> {
  /** Total portfolio value in Naira. */
  readonly totalValue: string
  /** Total profit/loss amount in Naira. */
  readonly profitLoss?: string
  /** Whether the profit/loss is positive. */
  readonly isProfit?: boolean
  /** Overall percentage change. */
  readonly percentageChange?: number
  /** Portfolio status text. */
  readonly status?: string
  /** Whether the card is in a loading state. */
  readonly loading?: boolean
}

function PortfolioCardSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
      </div>
    </div>
  )
}

function PortfolioCard({
  totalValue,
  profitLoss,
  isProfit = true,
  percentageChange,
  status,
  loading = false,
  className,
  ...props
}: PortfolioCardProps): React.ReactElement {
  if (loading) {
    return <PortfolioCardSkeleton className={className} />
  }

  return (
    <div
      data-slot="portfolio-card"
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold leading-7 text-[var(--text-primary)]">
          Portfolio
        </h3>
        {status && (
          <Badge variant="secondary" className="rounded-md text-xs">
            {status}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="mt-4 space-y-3">
        {/* Primary value */}
        <p className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {totalValue}
        </p>

        {/* Profit/Loss and percentage */}
        <div className="flex items-center gap-3">
          {profitLoss && (
            <span
              className={cn(
                "font-mono text-sm font-semibold tabular-nums",
                isProfit
                  ? "text-[var(--profit)]"
                  : "text-[var(--loss)]"
              )}
            >
              {isProfit ? "+" : "−"}{profitLoss}
            </span>
          )}

          {percentageChange !== undefined && (
            <PercentageIndicator
              value={Math.abs(percentageChange)}
              aria-label={`${percentageChange >= 0 ? "Up" : "Down"} ${Math.abs(percentageChange)}%`}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export { PortfolioCard, PortfolioCardSkeleton }
export type { PortfolioCardProps }
