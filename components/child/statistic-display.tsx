import * as React from "react"
import { cn } from "@/lib/utils"

interface StatisticValueProps extends React.ComponentProps<"span"> {
  /** The numeric or text value to display. */
  readonly children: React.ReactNode
}

function StatisticValue({
  className,
  children,
  ...props
}: StatisticValueProps): React.ReactElement {
  return (
    <span
      data-slot="statistic-value"
      className={cn(
        "font-mono text-2xl font-bold tabular-nums",
        "text-[var(--text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

interface StatisticLabelProps extends React.ComponentProps<"span"> {
  /** The descriptive label for the statistic. */
  readonly children: React.ReactNode
}

function StatisticLabel({
  className,
  children,
  ...props
}: StatisticLabelProps): React.ReactElement {
  return (
    <span
      data-slot="statistic-label"
      className={cn(
        "text-sm text-[var(--text-muted)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

interface StatisticDisplayProps extends React.ComponentProps<"div"> {
  /** The numeric or text value. */
  readonly value: React.ReactNode
  /** The descriptive label. */
  readonly label: string
}

function StatisticDisplay({
  value,
  label,
  className,
  ...props
}: StatisticDisplayProps): React.ReactElement {
  return (
    <div
      data-slot="statistic-display"
      className={cn(
        "flex flex-col gap-1",
        "md:flex-row md:items-baseline md:gap-2",
        className
      )}
      {...props}
    >
      <StatisticValue>{value}</StatisticValue>
      <StatisticLabel>{label}</StatisticLabel>
    </div>
  )
}

export { StatisticDisplay, StatisticValue, StatisticLabel }
export type { StatisticDisplayProps, StatisticValueProps, StatisticLabelProps }
