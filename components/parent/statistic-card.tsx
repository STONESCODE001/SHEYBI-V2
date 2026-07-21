import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { StatisticDisplay } from "@/components/child/statistic-display"
import { PercentageIndicator } from "@/components/child/percentage-indicator"

interface StatisticCardProps extends React.ComponentProps<"div"> {
  /** The label describing the metric. */
  readonly label: string
  /** The primary metric value. */
  readonly value: string
  /** Whether the value is a financial/numeric value (uses mono font). */
  readonly numeric?: boolean
  /** Optional percentage change. */
  readonly trend?: number
  /** Size variant for the primary value. */
  readonly size?: "default" | "lg"
  /** Whether the card is in a loading state. */
  readonly loading?: boolean
}

function StatisticCardSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>
    </div>
  )
}

function StatisticCard({
  label,
  value,
  numeric = true,
  trend,
  size = "default",
  loading = false,
  className,
  ...props
}: StatisticCardProps): React.ReactElement {
  if (loading) {
    return <StatisticCardSkeleton className={className} />
  }

  return (
    <div
      data-slot="statistic-card"
      className={cn(
        "w-full rounded-2xl",
        "border border-[var(--border-default)] bg-[var(--bg-surface)]",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        "p-4 transition-colors duration-200",
        "hover:bg-[var(--bg-hover)]",
        className
      )}
      {...props}
    >
      {/* Label */}
      <span className="text-sm leading-5 text-[var(--text-muted)]">
        {label}
      </span>

      {/* Primary value */}
      <p
        className={cn(
          "mt-1 font-bold tabular-nums text-[var(--text-primary)]",
          numeric && "font-mono",
          size === "lg" ? "text-2xl leading-8" : "text-xl leading-7"
        )}
      >
        {value}
      </p>

      {/* Trend indicator */}
      {trend !== undefined && (
        <div className="mt-1">
          <PercentageIndicator
            value={Math.abs(trend)}
            aria-label={`${trend >= 0 ? "Up" : "Down"} ${Math.abs(trend)}%`}
          />
        </div>
      )}
    </div>
  )
}

export { StatisticCard, StatisticCardSkeleton }
export type { StatisticCardProps }
