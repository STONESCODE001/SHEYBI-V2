import * as React from "react"
import { cn } from "@/lib/utils"

type PercentageLevel = "low" | "medium" | "high"

interface PercentageIndicatorProps extends React.ComponentProps<"span"> {
  /** The percentage value to display (0–100). */
  readonly value: number
  /** Override the automatic level detection. */
  readonly level?: PercentageLevel
}

/** Determine colour level from percentage value. */
function resolveLevel(value: number): PercentageLevel {
  if (value < 33) return "low"
  if (value < 66) return "medium"
  return "high"
}

function PercentageIndicator({
  value,
  level,
  className,
  ...props
}: PercentageIndicatorProps): React.ReactElement {
  const resolvedLevel = level ?? resolveLevel(value)
  const displayValue = `${Math.round(value)}%`

  return (
    <span
      data-slot="percentage-indicator"
      data-level={resolvedLevel}
      className={cn(
        "inline-flex items-center font-mono text-sm font-semibold tabular-nums",
        "transition-colors duration-200",
        resolvedLevel === "low" && "text-[var(--state-error)]",
        resolvedLevel === "medium" && "text-[var(--state-warning)]",
        resolvedLevel === "high" && "text-[var(--state-success)]",
        className
      )}
      {...props}
    >
      {displayValue}
    </span>
  )
}

export { PercentageIndicator }
export type { PercentageIndicatorProps, PercentageLevel }
