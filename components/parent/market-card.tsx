"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RatioBar } from "@/components/child/ratio-bar"
import { OddsButton } from "@/components/child/odds-button"

/**
 * DB INTEGRATION NOTE:
 * Helper function to calculate display odds string (e.g. "1k -> 3k") from probability (0 - 100).
 * Formula derived from Prediction Engine (context/prediction-engine.md):
 * Potential Payout = Base Stake (₦1,000) / Probability.
 */
export function formatOddsFromProbability(
  probabilityPercent?: number,
  baseStake = 1000
): string {
  if (!probabilityPercent || probabilityPercent <= 0) return "1k -> 1k"
  const p = probabilityPercent / 100
  const potentialPayout = Math.round(baseStake / p)
  const stakeK = `${baseStake / 1000}k`
  const payoutK =
    potentialPayout >= 1000
      ? `${Math.round(potentialPayout / 1000)}k`
      : `₦${potentialPayout}`
  return `${stakeK} -> ${payoutK}`
}

export interface ContestantOption {
  /** DB INTEGRATION NOTE: Option / Contestant ID */
  id: string
  /** Contestant or Option Name */
  name: string
  /** Contestant Avatar / Image URL */
  avatarUrl?: string
  /** DB INTEGRATION NOTE: Pre-formatted odds or probability percentage */
  odds?: string
  probability?: number
}

export interface MarketCardProps extends React.ComponentProps<"article"> {
  /**
   * DB INTEGRATION NOTE:
   * Market ID for navigation to /markets/[id].
   */
  readonly id?: string
  /**
   * Market Title / Question (Headline).
   */
  readonly title: string
  /**
   * Card Variant based on Figma Renders:
   * - 'binary': Standard Yes/No market card.
   * - '1v1': Head-to-head 1v1 matchup card with contestant avatars and VS badge.
   * - 'multi_option': Multi-candidate card with stacked contestant rows.
   */
  readonly variant?: "binary" | "1v1" | "multi_option"
  /**
   * DB INTEGRATION NOTE:
   * Contestant data for 1v1 matchups (requires 2 contestants) or multi-option markets.
   */
  readonly contestants?: readonly ContestantOption[]
  /**
   * DB INTEGRATION NOTE:
   * Current Yes outcome probability (0 - 100).
   */
  readonly yesProbability?: number
  /**
   * DB INTEGRATION NOTE:
   * Current No outcome probability (0 - 100).
   */
  readonly noProbability?: number
  /**
   * DB INTEGRATION NOTE:
   * Formatted Yes odds e.g. "1k -> 3k". If omitted, calculated dynamically from yesProbability.
   */
  readonly yesOdds?: string
  /**
   * DB INTEGRATION NOTE:
   * Formatted No odds e.g. "1k -> 5k". If omitted, calculated dynamically from noProbability.
   */
  readonly noOdds?: string
  /** Whether the card is loading. */
  readonly loading?: boolean
  /** Whether the card is disabled. */
  readonly disabled?: boolean
}

/**
 * Loading Skeleton matching Figma Card Dimensions
 */
function MarketCardSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <Card
      className={cn(
        "h-full w-full rounded-2xl border border-white/10 bg-[#0B101D] p-5 shadow-sm space-y-4 flex flex-col justify-between",
        className
      )}
    >
      <Skeleton className="h-6 w-3/4 rounded-lg bg-white/10" />
      <Skeleton className="h-2 w-full rounded-full bg-white/10" />
      <div className="h-12 w-full rounded-2xl bg-[#080D19] p-1.5 flex gap-2">
        <Skeleton className="h-full flex-1 rounded-xl bg-white/10" />
        <Skeleton className="h-full flex-1 rounded-xl bg-white/10" />
      </div>
    </Card>
  )
}

/**
 * MarketCard Component
 * Implements the Figma Render Specification as the sole source of truth.
 * Ensures equal card height in grid rows (`h-full flex flex-col justify-between`).
 * Keeps odds buttons strictly linear on a single line.
 */
function MarketCard({
  id = "1",
  title,
  variant = "binary",
  contestants = [],
  yesProbability = 33.3,
  noProbability = 66.7,
  yesOdds,
  noOdds,
  loading = false,
  disabled = false,
  className,
  ...props
}: MarketCardProps): React.ReactElement {
  if (loading) {
    return <MarketCardSkeleton className={className} />
  }

  // Calculate dynamic odds from probabilities if explicit odds strings are not provided
  const computedYesOdds =
    yesOdds || formatOddsFromProbability(yesProbability)
  const computedNoOdds =
    noOdds || formatOddsFromProbability(noProbability)

  const detailHref = `/markets/${id}`
  const defaultTestImg = "/testimg.png"

  return (
    <article
      data-slot="market-card"
      aria-label={title}
      className={cn("h-full w-full flex flex-col", className)}
      {...props}
    >
      <Link
        href={disabled ? "#" : detailHref}
        className={cn(
          "group/market-card flex h-full flex-col justify-between w-full rounded-2xl border border-white/10 bg-[#0B101D] p-4 sm:p-5 text-white transition-all duration-200",
          "hover:border-white/20 hover:bg-[#0E1526] hover:shadow-md",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {/* ============================================================ */}
        {/* VARIANT 1: 1V1 MATCHUP CARD                                  */}
        {/* ============================================================ */}
        {variant === "1v1" && (
          <div className="flex flex-col flex-1 justify-between space-y-4">
            <div className="space-y-4">
              {/* Question Title */}
              <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-white group-hover/market-card:text-slate-100">
                {title}
              </h3>

              {/* Contestant 1 vs Contestant 2 Raw Headshots */}
              <div className="flex items-center justify-center gap-6 py-1">
                {/* Left Contestant Headshot */}
                <div className="relative h-16 w-16">
                  <Image
                    src={contestants[0]?.avatarUrl || defaultTestImg}
                    alt={contestants[0]?.name || "Contestant 1"}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Center VS Label */}
                <span className="text-base font-black tracking-wider text-slate-300">
                  VS
                </span>

                {/* Right Contestant Headshot */}
                <div className="relative h-16 w-16">
                  <Image
                    src={contestants[1]?.avatarUrl || defaultTestImg}
                    alt={contestants[1]?.name || "Contestant 2"}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Split Probability Ratio Bar */}
              <RatioBar
                yesProbability={yesProbability}
                noProbability={noProbability}
              />

              {/* Outcome Odds Housing Container (Main Base BG Color) */}
              <div className="flex flex-row items-center gap-2 rounded-2xl border border-white/5 bg-[#080D19] p-1.5">
                <OddsButton label="Yes" odds={computedYesOdds} variant="yes" />
                <OddsButton label="No" odds={computedNoOdds} variant="no" />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VARIANT 2: BINARY YES/NO CARD                                */}
        {/* ============================================================ */}
        {variant === "binary" && (
          <div className="flex flex-col flex-1 justify-between space-y-4">
            {/* Question Title */}
            <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-white group-hover/market-card:text-slate-100">
              {title}
            </h3>

            <div className="space-y-4 pt-2">
              {/* Split Probability Ratio Bar */}
              <RatioBar
                yesProbability={yesProbability}
                noProbability={noProbability}
              />

              {/* Outcome Odds Housing Container (Main Base BG Color) */}
              <div className="flex flex-row items-center gap-2 rounded-2xl border border-white/5 bg-[#080D19] p-1.5">
                <OddsButton label="Yes" odds={computedYesOdds} variant="yes" />
                <OddsButton label="No" odds={computedNoOdds} variant="no" />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VARIANT 3: MULTIPLE OPTIONS CARD                             */}
        {/* ============================================================ */}
        {variant === "multi_option" && (
          <div className="flex flex-col flex-1 justify-between space-y-4">
            {/* Question Title */}
            <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-white group-hover/market-card:text-slate-100">
              {title}
            </h3>

            <div className="space-y-3 pt-2">
              {/* Stacked Contestant / Outcome Rows in Housing Container */}
              <div className="space-y-2 rounded-2xl border border-white/5 bg-[#080D19] p-2">
                {contestants.map((c, i) => (
                  <div
                    key={c.id || i}
                    className="flex items-center justify-between rounded-xl bg-[#0D1424] p-2.5 transition-colors group-hover/market-card:bg-[#121B30]"
                  >
                    <div className="flex items-center gap-3">
                      {/* Raw Contestant Avatar */}
                      <div className="relative h-8 w-8">
                        <Image
                          src={c.avatarUrl || defaultTestImg}
                          alt={c.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-200">
                        {c.name}
                      </span>
                    </div>
                    {/* Odds Button inside Row Housing Container */}
                    <div className="rounded-lg border border-white/5 bg-[#080D19] p-1 flex-initial">
                      <OddsButton
                        label="Yes"
                        odds={
                          c.odds ||
                          formatOddsFromProbability(c.probability || 25)
                        }
                        variant="yes"
                        className="min-h-[32px] py-1 px-3 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Expander Link housed in Main Base BG Container */}
              <div className="rounded-xl border border-white/5 bg-[#080D19] p-2.5 text-center">
                <span className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
                  see more ...
                </span>
              </div>
            </div>
          </div>
        )}
      </Link>
    </article>
  )
}

export { MarketCard, MarketCardSkeleton }
