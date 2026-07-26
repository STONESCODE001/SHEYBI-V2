"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RatioBarProps extends React.ComponentProps<"div"> {
  /**
   * DB INTEGRATION NOTE:
   * Pass the Yes outcome probability percentage (0 - 100) calculated by the prediction engine.
   */
  readonly yesProbability?: number
  /**
   * DB INTEGRATION NOTE:
   * Pass the No outcome probability percentage (0 - 100).
   * If omitted, it will automatically default to `100 - yesProbability`.
   */
  readonly noProbability?: number
}

/**
 * RatioBar component
 * Renders the dual-color split probability bar featured in Sheybi Market Cards.
 * Green segment represents Yes/Option 1 probability; Yellow segment represents No/Option 2 probability.
 */
export function RatioBar({
  yesProbability = 50,
  noProbability,
  className,
  ...props
}: RatioBarProps): React.ReactElement {
  // Ensure percentages total 100% cleanly
  const validatedYes = Math.max(0, Math.min(100, yesProbability))
  const validatedNo =
    noProbability !== undefined
      ? Math.max(0, Math.min(100, noProbability))
      : 100 - validatedYes

  return (
    <div
      data-slot="ratio-bar"
      role="progressbar"
      aria-valuenow={validatedYes}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Market ratio: ${validatedYes}% Yes, ${validatedNo}% No`}
      className={cn("flex h-1.5 w-full items-center gap-1 overflow-hidden rounded-full", className)}
      {...props}
    >
      {/* Green Yes / Primary Outcome segment */}
      <div
        className="h-full rounded-full bg-[#30D878] transition-all duration-300"
        style={{ width: `${validatedYes}%` }}
      />
      {/* Yellow No / Secondary Outcome segment */}
      <div
        className="h-full rounded-full bg-[#FFC91F] transition-all duration-300"
        style={{ width: `${validatedNo}%` }}
      />
    </div>
  )
}
