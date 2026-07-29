"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { ArrowLeft } from "lucide-react"
import { RatioBar } from "@/components/child/ratio-bar"
import { OddsButton } from "@/components/child/odds-button"
import { useDialog } from "@/components/dialog"
import { cn } from "@/lib/utils"

export interface BinaryMarketData {
  id: string
  title: string
  category?: string
  rules?: string
  yesOptionId?: string
  noOptionId?: string
  yesProbability?: number // e.g. 50
  noProbability?: number  // e.g. 50
  yesOddsText?: string    // e.g. "1k → 3k"
  noOddsText?: string     // e.g. "1k → 5k"
  yesPrice?: number       // e.g. 0.33
  noPrice?: number        // e.g. 0.20
  tradeHistory?: Array<{
    id: string
    shares: number
    outcome: "yes" | "no"
    timestamp: string
  }>
  userPosition?: {
    outcome: "yes" | "no"
    shares: number
    avgPrice: number
  } | null
}

interface BinaryMarketViewProps {
  market: BinaryMarketData
}

/**
 * DB INTEGRATION NOTE (database-schema.md & prediction-engine.md):
 * ----------------------------------------------------------------
 * In a live environment, outcome probabilities are dynamically derived from the constant-product
 * automated market maker (AMM) liquidity pool balances or outcome share prices:
 * 
 *   Yes Probability % = (pool_balance_no / (pool_balance_yes + pool_balance_no)) * 100
 *   No Probability %  = 100 - Yes Probability %
 * 
 * Odds returns (e.g. "1k → 3k", "1k → 5k") are calculated from share price payout ratios:
 *   Shares per ₦1,000 stake = 1000 / outcome.current_price
 *   Potential Return at resolution = Shares * ₦1.00
 * 
 * Position Holdings (Single-Outcome Exposure Invariant):
 *   Users may only hold an active position in ONE outcome of a given market at any single moment.
 */
export function BinaryMarketView({ market }: BinaryMarketViewProps): React.ReactElement {
  const dialog = useDialog()
  const router = useRouter()
  const { isSignedIn } = useAuth()

  const yesProbability = market.yesProbability ?? 50
  const noProbability = market.noProbability ?? (100 - yesProbability)

  const yesOddsText = market.yesOddsText || "1k → 3k"
  const noOddsText = market.noOddsText || "1k → 5k"

  const hasRules = Boolean(market.rules && market.rules.trim())
  const marketRules = hasRules ? market.rules : "Rules unavailable for this market. Trading is currently disabled."

  const historyItems = market.tradeHistory || [
    { id: "1", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
    { id: "2", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
    { id: "3", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
    { id: "4", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
    { id: "5", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
  ]

  const handleOpenTradeDialog = (outcome: "yes" | "no") => {
    if (!isSignedIn) {
      router.push("/auth/sign-in")
      return
    }
    if (!hasRules) return
    const selectedOptionId = outcome === "yes" ? market.yesOptionId : market.noOptionId
    dialog.open("trade/dialog", {
      marketId: market.id,
      optionId: selectedOptionId,
      marketTitle: market.title,
      initialOutcome: outcome,
      initialMode: "buy",
      yesProbability,
      noProbability,
      yesPrice: market.yesPrice || 0.33,
      noPrice: market.noPrice || 0.20,
      userPosition: market.userPosition || null,
    })
  }

  return (
    <div data-slot="binary-market-view" className="flex flex-col min-h-screen bg-[var(--bg-base)]">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        {/* Back Link Button */}
        <div>
          <Link
            href="/markets"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FFC91F] hover:underline transition-colors"
          >
            <ArrowLeft className="size-4 stroke-[2.5]" />
            Back
          </Link>
        </div>

        {/* Headline Market Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
          {market.title}
        </h1>

        {/* Probability Header & Ratio Split Bar */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-sm sm:text-base font-extrabold">
            <span className="text-[#30D878]">Yes ( {yesProbability}% Chance )</span>
            <span className="text-[#FFC91F]">No ( {noProbability}% Chance )</span>
          </div>

          {/* Dual-Color Split Ratio Bar */}
          <RatioBar
            yesProbability={yesProbability}
            noProbability={noProbability}
            className="h-2.5 sm:h-3 rounded-full"
          />
        </div>

        {/* Quick Outcome Selection / Betting Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 p-1.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)]">
          <button
            type="button"
            disabled={!hasRules}
            onClick={() => handleOpenTradeDialog("yes")}
            className={cn(
              "w-full text-left transition-transform active:scale-[0.98] focus:outline-none",
              !hasRules && "opacity-50 cursor-not-allowed"
            )}
          >
            <OddsButton label="Yes" odds={yesOddsText} variant="yes" className="h-12 sm:h-14 px-4 text-base" />
          </button>

          <button
            type="button"
            disabled={!hasRules}
            onClick={() => handleOpenTradeDialog("no")}
            className={cn(
              "w-full text-left transition-transform active:scale-[0.98] focus:outline-none",
              !hasRules && "opacity-50 cursor-not-allowed"
            )}
          >
            <OddsButton label="No" odds={noOddsText} variant="no" className="h-12 sm:h-14 px-4 text-base" />
          </button>
        </div>

        {/* Market Rules Section */}
        <div className="py-5 border-y border-[var(--border-default)] space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            Market Rules
          </h2>
          <p className={cn("text-sm leading-relaxed", hasRules ? "text-[var(--text-muted)]" : "text-amber-400 font-medium")}>
            {marketRules}
          </p>
        </div>

        {/* Trade History Section */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            Trade History
          </h2>

          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 sm:p-5 divide-y divide-[var(--border-default)]/50">
            {historyItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex justify-between items-center py-3 first:pt-0 last:pb-0 text-sm font-semibold"
              >
                <div className="text-[var(--text-primary)]">
                  Bought {item.shares}{" "}
                  <span className={cn(item.outcome === "yes" ? "text-[var(--market-yes)]" : "text-[var(--accent-yellow)]")}>
                    {item.outcome.toUpperCase()}
                  </span>{" "}
                  Shares
                </div>
                <div className="text-xs text-[var(--text-muted)] font-normal">
                  {item.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explore Markets Centered CTA */}
        <div className="pt-2 pb-4 text-center">
          <Link
            href="/markets"
            className="inline-flex items-center justify-center w-full px-8 py-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-yellow)]/50 font-extrabold text-sm text-[var(--text-primary)] transition-all shadow-md active:scale-[0.99]"
          >
            see more ...
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BinaryMarketView
