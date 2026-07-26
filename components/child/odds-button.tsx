"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface OddsButtonProps extends React.ComponentProps<"div"> {
  /**
   * Outcome label e.g., "Yes" or "No".
   */
  readonly label: string
  /**
   * DB INTEGRATION NOTE:
   * Formatted odds string (e.g., "1k -> 3k") representing the stake -> payout ratio.
   * Can be calculated dynamically from market option probability: Payout = Base Stake / Probability.
   */
  readonly odds: string
  /**
   * Outcome type for color styling: 'yes' uses Green (#30D878), 'no' uses Yellow (#FFC91F).
   */
  readonly variant?: "yes" | "no"
}

/**
 * OddsButton component
 * Renders an outcome display button (e.g., "Yes  1k -> 3k") linearly straight on a single line.
 * Keeps text responsive with tight padding and shrink constraints so it fits on all screen widths.
 */
export function OddsButton({
  label,
  odds,
  variant = "yes",
  className,
  ...props
}: OddsButtonProps): React.ReactElement {
  return (
    <div
      data-slot="odds-button"
      className={cn(
        "flex min-h-[38px] w-full min-w-0 flex-1 flex-row items-center justify-between gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl bg-[#0D1424] px-2.5 sm:px-3 py-1.5 transition-colors overflow-hidden",
        "group-hover/market-card:bg-[#121B30]",
        className
      )}
      {...props}
    >
      {/* Outcome label (e.g., Yes / No) - strictly single line */}
      <span className="shrink-0 text-xs font-semibold whitespace-nowrap text-slate-300">
        {label}
      </span>

      {/* Odds payout text (e.g., 1k -> 3k) - strictly single line font-mono */}
      <span
        className={cn(
          "shrink-0 text-xs font-bold tracking-tight whitespace-nowrap font-mono",
          variant === "yes" ? "text-[#30D878]" : "text-[#FFC91F]"
        )}
      >
        {odds}
      </span>
    </div>
  )
}
