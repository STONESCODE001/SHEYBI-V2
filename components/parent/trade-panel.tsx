"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MarketOutcomeChip } from "@/components/child/market-outcome-chip"
import type { MarketOutcome } from "@/components/child/market-outcome-chip"
import { Loader2 } from "lucide-react"

type TradeMode = "buy" | "sell"

interface TradePanelProps extends React.ComponentProps<"div"> {
  /** Current trade mode. */
  readonly mode?: TradeMode
  /** Callback when mode changes. */
  readonly onModeChange?: (mode: TradeMode) => void
  /** Available outcomes for selection. */
  readonly outcomes?: readonly MarketOutcome[]
  /** Currently selected outcome. */
  readonly selectedOutcome?: MarketOutcome
  /** Callback when outcome selection changes. */
  readonly onOutcomeSelect?: (outcome: MarketOutcome) => void
  /** Current trade amount value. */
  readonly amount?: string
  /** Callback when amount changes. */
  readonly onAmountChange?: (amount: string) => void
  /** Current probability display value. */
  readonly currentProbability?: string
  /** Estimated shares display value. */
  readonly estimatedShares?: string
  /** Trading fee display value. */
  readonly tradingFee?: string
  /** Total cost / net amount display value. */
  readonly totalCost?: string
  /** Whether the trade button is enabled. */
  readonly canTrade?: boolean
  /** Whether a trade is being processed. */
  readonly processing?: boolean
  /** Whether the market is closed. */
  readonly marketClosed?: boolean
  /** Callback when the trade button is clicked. */
  readonly onTrade?: () => void
  /** Whether the panel is in a loading state. */
  readonly loading?: boolean
}

function TradePanelSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <Card
      className={cn(
        "w-full rounded-2xl border-[var(--border-default)] bg-[var(--bg-surface)] p-5",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="space-y-4">
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </Card>
  )
}

function TradePanel({
  mode = "buy",
  onModeChange,
  outcomes = ["yes", "no"],
  selectedOutcome,
  onOutcomeSelect,
  amount = "",
  onAmountChange,
  currentProbability,
  estimatedShares,
  tradingFee,
  totalCost,
  canTrade = false,
  processing = false,
  marketClosed = false,
  onTrade,
  loading = false,
  className,
  ...props
}: TradePanelProps): React.ReactElement {
  if (loading) {
    return <TradePanelSkeleton className={className} />
  }

  const tradeButtonLabel = mode === "buy"
    ? selectedOutcome
      ? `Buy ${selectedOutcome === "yes" ? "Yes" : "No"}`
      : "Select an outcome"
    : selectedOutcome
      ? `Sell ${selectedOutcome === "yes" ? "Yes" : "No"}`
      : "Select an outcome"

  const tradeButtonColor =
    selectedOutcome === "yes"
      ? "bg-[var(--market-yes)] hover:bg-[var(--market-yes-hover)] text-white"
      : selectedOutcome === "no"
        ? "bg-[var(--market-no)] hover:bg-[var(--market-no-hover)] text-white"
        : ""

  return (
    <div
      data-slot="trade-panel"
      className={cn(
        "w-full rounded-2xl",
        "border border-[var(--border-default)] bg-[var(--bg-surface)]",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        "p-5",
        className
      )}
      {...props}
    >
      {/* Header — Buy/Sell toggle */}
      <Tabs
        value={mode}
        onValueChange={(val) => onModeChange?.(val as TradeMode)}
      >
        <TabsList className="w-full" aria-label="Trade mode">
          <TabsTrigger
            value="buy"
            className="min-h-[44px] flex-1"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="min-h-[44px] flex-1"
          >
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Outcome selection */}
      <div className="mt-4 flex gap-2">
        {outcomes.map((outcome) => (
          <button
            key={outcome}
            type="button"
            aria-pressed={selectedOutcome === outcome}
            onClick={() => onOutcomeSelect?.(outcome)}
            className={cn(
              "rounded-lg transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-[var(--border-active)] outline-none",
              selectedOutcome === outcome && "ring-2 ring-[var(--border-active)]"
            )}
          >
            <MarketOutcomeChip outcome={outcome} />
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="trade-amount" className="text-sm text-[var(--text-secondary)]">
          Amount (₦)
        </Label>
        <Input
          id="trade-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmountChange?.(e.target.value)}
          disabled={marketClosed}
          className={cn(
            "h-11 rounded-lg font-mono text-base tabular-nums",
            "border-[var(--border-default)]",
            "focus-visible:border-[var(--border-active)]"
          )}
        />
      </div>

      {/* Trade preview */}
      <div className="mt-4 space-y-2">
        {currentProbability && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Current Probability</span>
            <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
              {currentProbability}
            </span>
          </div>
        )}
        {estimatedShares && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Estimated Shares</span>
            <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
              {estimatedShares}
            </span>
          </div>
        )}
        {tradingFee && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Trading Fee</span>
            <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
              {tradingFee}
            </span>
          </div>
        )}
        {totalCost && (
          <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-2 text-sm">
            <span className="font-semibold text-[var(--text-primary)]">
              {mode === "buy" ? "Total Cost" : "Net Amount"}
            </span>
            <span className="font-mono font-bold tabular-nums text-[var(--text-primary)]">
              {totalCost}
            </span>
          </div>
        )}
      </div>

      {/* Trade button */}
      <Button
        size="lg"
        className={cn(
          "mt-4 min-h-11 w-full rounded-xl font-semibold",
          tradeButtonColor
        )}
        disabled={!canTrade || processing || marketClosed}
        onClick={onTrade}
        aria-label={tradeButtonLabel}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Processing...
          </>
        ) : marketClosed ? (
          "Market Closed"
        ) : (
          tradeButtonLabel
        )}
      </Button>
    </div>
  )
}

export { TradePanel, TradePanelSkeleton }
export type { TradePanelProps, TradeMode }
