"use client"

import { cn } from "@/lib/utils"
import type { TickerItem } from "./types"
import { DEFAULT_TICKER_ITEMS } from "./constants"

interface LiveMarketTickerProps {
  readonly items?: readonly TickerItem[]
  readonly className?: string
}

function LiveMarketTicker({
  items = DEFAULT_TICKER_ITEMS,
  className,
}: LiveMarketTickerProps) {
  if (items.length === 0) {
    return null
  }

  const loop = [...items, ...items]

  return (
    <div
      data-slot="live-market-ticker"
      aria-hidden="true"
      className={cn(
        "shell-ticker-track relative z-10 flex h-10 w-full shrink-0 items-center overflow-hidden",
        "border-b border-[var(--border-default)] bg-[var(--bg-surface-secondary)]",
        "max-md:h-8",
        className
      )}
    >
      <div className="shell-ticker-content flex min-w-max items-center gap-8 px-4">
        {loop.map((item, index) => (
          <span
            key={`${item.id}-${index}`}
            className="flex items-center gap-2 font-mono text-sm whitespace-nowrap text-[var(--text-secondary)]"
          >
            <span className="text-[var(--text-primary)]">{item.label}</span>
            <span className="text-[var(--accent-primary)]">{item.change}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export { LiveMarketTicker }
export type { LiveMarketTickerProps }
