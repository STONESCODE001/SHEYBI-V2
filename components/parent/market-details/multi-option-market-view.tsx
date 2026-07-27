"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { ArrowLeft, User } from "lucide-react"
import { OddsButton } from "@/components/child/odds-button"
import { useDialog } from "@/components/dialog"
import { cn } from "@/lib/utils"

export interface CandidateData {
  id: string
  name: string
  avatarUrl?: string
  tradesVolume?: string // e.g. "₦667k"
  yesOddsText?: string  // e.g. "1k → 3k"
  noOddsText?: string   // e.g. "1k → 3k"
  yesPrice?: number     // e.g. 0.33
  noPrice?: number      // e.g. 0.33
  probability?: number  // e.g. 33
}

export interface MultiOptionMarketData {
  id: string
  title: string
  category?: string
  totalTradesVolume?: string // e.g. "₦ 250,000"
  rules?: string
  candidates: CandidateData[]
  tradeHistory?: Array<{
    id: string
    shares: number
    outcome: "yes" | "no"
    candidateName?: string
    timestamp: string
  }>
  userPosition?: {
    candidateId?: string
    candidateName?: string
    outcome: "yes" | "no"
    shares: number
    avgPrice: number
  } | null
}

interface MultiOptionMarketViewProps {
  market: MultiOptionMarketData
}

/**
 * DB INTEGRATION NOTE (database-schema.md & prediction-engine.md):
 * ----------------------------------------------------------------
 * Multi-Option Markets represent a multi-candidate prediction market (e.g. "Who will win BBNaija?").
 * Each candidate has an independent YES/NO outcome price based on their liquidity pool.
 * 
 * Single-Outcome Exposure Invariant:
 *   Users may only hold an active position in ONE candidate/outcome of a given market at a time.
 */
export function MultiOptionMarketView({ market }: MultiOptionMarketViewProps): React.ReactElement {
  const dialog = useDialog()
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const [showAllCandidates, setShowAllCandidates] = React.useState(false)
  const [showAllHistory, setShowAllHistory] = React.useState(false)

  const hasRules = Boolean(market.rules && market.rules.trim())
  const marketRules = hasRules ? market.rules : "Rules unavailable for this market. Trading is currently disabled."

  // Initial candidate limit is 6 (matching Figma design)
  const visibleCandidates = showAllCandidates
    ? market.candidates
    : market.candidates.slice(0, 6)

  const historyItems = market.tradeHistory || [
    { id: "1", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
    { id: "2", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
    { id: "3", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
    { id: "4", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
    { id: "5", shares: 200, outcome: "yes", timestamp: "5 Mins ago" },
  ]

  const visibleHistory = showAllHistory ? historyItems : historyItems.slice(0, 4)

  const handleOpenTradeDialog = (candidate: CandidateData, outcome: "yes" | "no") => {
    if (!isSignedIn) {
      router.push("/auth/sign-in")
      return
    }
    if (!hasRules) return
    dialog.open("trade/dialog", {
      marketId: market.id,
      candidateId: candidate.id,
      optionId: candidate.id,
      marketTitle: `${market.title} (${candidate.name})`,
      initialOutcome: outcome,
      initialMode: "buy",
      yesProbability: candidate.probability || 33,
      noProbability: 100 - (candidate.probability || 33),
      yesPrice: candidate.yesPrice || 0.33,
      noPrice: candidate.noPrice || 0.33,
      userPosition: market.userPosition || null,
    })
  }

  return (
    <div data-slot="multi-option-market-view" className="flex flex-col min-h-screen bg-[var(--bg-base)]">
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

        {/* Headline Market Title & Total Trades Volume Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
            {market.title}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">
            Trades: {market.totalTradesVolume || "₦ 250,000"}
          </p>
        </div>

        {/* Candidate Row Cards List */}
        <div className="space-y-3">
          {visibleCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] gap-3 transition-all hover:border-[var(--border-hover)]"
            >
              {/* Left Side: Avatar + Name + Volume Metric */}
              <div className="flex items-center gap-3">
                <div className="relative size-12 sm:size-14 overflow-hidden rounded-xl bg-[var(--bg-surface)] flex-shrink-0 flex items-center justify-center">
                  {candidate.avatarUrl ? (
                    <Image
                      src={candidate.avatarUrl}
                      alt={candidate.name}
                      fill
                      sizes="(max-width: 768px) 56px, 56px"
                      className="object-cover"
                    />
                  ) : (
                    <User className="size-6 text-[var(--accent-green)]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-tight">
                    {candidate.name}
                  </h3>
                  <span className="text-xs text-[var(--text-muted)] font-normal">
                    Trades: {candidate.tradesVolume || "₦667k"}
                  </span>
                </div>
              </div>

              {/* Right Side: Dual Outcome Odds Pair */}
              <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:min-w-[280px]">
                <button
                  type="button"
                  disabled={!hasRules}
                  onClick={() => handleOpenTradeDialog(candidate, "yes")}
                  className={cn(
                    "w-full text-left active:scale-[0.98] focus:outline-none",
                    !hasRules && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <OddsButton
                    label="Yes"
                    odds={candidate.yesOddsText || "1k → 3k"}
                    variant="yes"
                    className="h-11 sm:h-12 px-3 text-xs sm:text-sm"
                  />
                </button>
                <button
                  type="button"
                  disabled={!hasRules}
                  onClick={() => handleOpenTradeDialog(candidate, "no")}
                  className={cn(
                    "w-full text-left active:scale-[0.98] focus:outline-none",
                    !hasRules && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <OddsButton
                    label="No"
                    odds={candidate.noOddsText || "1k → 3k"}
                    variant="no"
                    className="h-11 sm:h-12 px-3 text-xs sm:text-sm"
                  />
                </button>
              </div>
            </div>
          ))}

          {/* Candidate Expander Button ("show more housemates...") */}
          {market.candidates.length > 6 && !showAllCandidates && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowAllCandidates(true)}
                className="w-full py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] font-bold text-xs uppercase tracking-wider text-[var(--accent-green)] transition-all active:scale-[0.99]"
              >
                show more housemates...
              </button>
            </div>
          )}
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
            {visibleHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex justify-between items-center py-3 first:pt-0 last:pb-0 text-sm font-semibold"
              >
                <div className="text-[var(--text-primary)]">
                  Bought {item.shares}{" "}
                  <span className={cn(item.outcome === "yes" ? "text-[var(--market-yes)]" : "text-[var(--accent-yellow)]")}>
                    {item.outcome.toUpperCase()}
                  </span>{" "}
                  Shares {item.candidateName && `from ${item.candidateName}`}
                </div>
                <div className="text-xs text-[var(--text-muted)] font-normal">
                  {item.timestamp}
                </div>
              </div>
            ))}
          </div>

          {/* Trade History Expander Button ("show full trade history...") */}
          {historyItems.length > 4 && !showAllHistory && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setShowAllHistory(true)}
                className="w-full py-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] font-semibold text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all active:scale-[0.99]"
              >
                show full trade history...
              </button>
            </div>
          )}
        </div>

        {/* Explore Markets Full-Width CTA ("see more ...") */}
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

export default MultiOptionMarketView
