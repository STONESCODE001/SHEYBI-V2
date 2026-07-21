import * as React from "react"
import { cn } from "@/lib/utils"

type MarketOutcome = "yes" | "no" | "pending"

interface MarketOutcomeChipProps extends React.ComponentProps<"span"> {
  /** The market outcome to display. */
  readonly outcome: MarketOutcome
}

const OUTCOME_LABELS: Record<MarketOutcome, string> = {
  yes: "Yes",
  no: "No",
  pending: "Pending",
}

function MarketOutcomeChip({
  outcome,
  className,
  ...props
}: MarketOutcomeChipProps): React.ReactElement {
  return (
    <span
      data-slot="market-outcome-chip"
      data-outcome={outcome}
      role="status"
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2.5 py-0.5",
        "text-xs font-semibold whitespace-nowrap",
        "transition-colors duration-200",
        outcome === "yes" && [
          "bg-[var(--market-yes)]/15 text-[var(--market-yes)]",
          "hover:bg-[var(--market-yes)]/25",
        ],
        outcome === "no" && [
          "bg-[var(--market-no)]/15 text-[var(--market-no)]",
          "hover:bg-[var(--market-no)]/25",
        ],
        outcome === "pending" && [
          "bg-[var(--bg-hover)] text-[var(--text-muted)]",
          "hover:bg-[var(--bg-active)]",
        ],
        className
      )}
      {...props}
    >
      {OUTCOME_LABELS[outcome]}
    </span>
  )
}

export { MarketOutcomeChip }
export type { MarketOutcomeChipProps, MarketOutcome }
