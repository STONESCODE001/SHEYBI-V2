"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RatioBar } from "@/components/child/ratio-bar"
import { OddsButton } from "@/components/child/odds-button"
import { Heart } from "lucide-react"

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
  if (!probabilityPercent || probabilityPercent <= 0) return "₦1k -> ₦1k"
  const p = probabilityPercent / 100
  const potentialPayout = baseStake / p
  const stakeK = `₦${baseStake / 1000}k`
  let payoutK: string
  if (potentialPayout >= 1000) {
    const kVal = potentialPayout / 1000
    const formatted = Number.isInteger(kVal) ? kVal.toString() : kVal.toFixed(1).replace(/\.0$/, "")
    payoutK = `₦${formatted}k`
  } else {
    payoutK = `₦${Math.round(potentialPayout)}`
  }
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
  /**
   * DB INTEGRATION NOTE: Category label e.g. "Entertainment", "BBNaija", "Sports"
   */
  readonly categoryLabel?: string
  /**
   * DB INTEGRATION NOTE: Likes / Reaction count string e.g. "1.2k" or number
   */
  readonly likesCount?: number | string
  /**
   * DB INTEGRATION NOTE: Traded volume string e.g. "₦1.2M Vol"
   */
  readonly volume?: string
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
 * Ensures equal card height and mathematically aligned footers/likes across grid rows (`h-full flex flex-col justify-between`).
 * Keeps odds buttons strictly linear on a single line without breaking on screen width changes.
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
  categoryLabel = "Entertainment",
  likesCount = "1.2k",
  volume,
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
        aria-disabled={disabled ? true : undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault()
          }
        }}
        className={cn(
          "group/market-card flex h-full flex-col justify-between w-full rounded-2xl border border-white/10 bg-[#0B101D] p-4 sm:p-5 text-white transition-all duration-200 gap-4",
          "hover:border-white/20 hover:bg-[#0E1526] hover:shadow-md",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {/* ============================================================ */}
        {/* VARIANT 1: 1V1 MATCHUP CARD                                  */}
        {/* ============================================================ */}
        {variant === "1v1" && (
          <div className="flex flex-col flex-1 justify-between space-y-4">
            <div className="space-y-3">
              {/* Question Title (Fixed min-height slot for row alignment) */}
              <div className="min-h-[3.25rem] flex items-start">
                <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-snug tracking-tight text-white group-hover/market-card:text-slate-100">
                  {title}
                </h3>
              </div>

              {/* Contestant 1 vs Contestant 2 Raw Headshots */}
              <div className="flex items-center justify-center gap-6 py-1">
                {/* Left Contestant Headshot */}
                <div className="relative h-14 w-14 sm:h-16 sm:w-16">
                  <Image
                    src={contestants[0]?.avatarUrl || defaultTestImg}
                    alt={contestants[0]?.name || "Contestant 1"}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 64px, 64px"
                    className="object-contain"
                  />
                </div>

                {/* Center VS Label */}
                <span className="text-sm sm:text-base font-black tracking-wider text-slate-300">
                  VS
                </span>

                {/* Right Contestant Headshot */}
                <div className="relative h-14 w-14 sm:h-16 sm:w-16">
                  <Image
                    src={contestants[1]?.avatarUrl || defaultTestImg}
                    alt={contestants[1]?.name || "Contestant 2"}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 64px, 64px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* Split Probability Ratio Bar */}
              <RatioBar
                yesProbability={yesProbability}
                noProbability={noProbability}
              />

              {/* Outcome Odds Housing Container (Main Base BG Color) */}
              <div className="flex flex-row items-center gap-1.5 sm:gap-2 rounded-2xl border border-white/5 bg-[#080D19] p-1.5 w-full overflow-hidden">
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
            {/* Question Title (Fixed min-height slot for row alignment) */}
            <div className="min-h-[3.25rem] flex items-start">
              <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-snug tracking-tight text-white group-hover/market-card:text-slate-100">
                {title}
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              {/* Split Probability Ratio Bar */}
              <RatioBar
                yesProbability={yesProbability}
                noProbability={noProbability}
              />

              {/* Outcome Odds Housing Container (Main Base BG Color) */}
              <div className="flex flex-row items-center gap-1.5 sm:gap-2 rounded-2xl border border-white/5 bg-[#080D19] p-1.5 w-full overflow-hidden">
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
            {/* Question Title (Fixed min-height slot for row alignment) */}
            <div className="min-h-[3.25rem] flex items-start">
              <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-snug tracking-tight text-white group-hover/market-card:text-slate-100">
                {title}
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              {/* Stacked Contestant / Outcome Rows in Housing Container (Top 3 Max) */}
              <div className="space-y-2 rounded-2xl border border-white/5 bg-[#080D19] p-2">
                {contestants.slice(0, 3).map((c, i) => (
                  <div
                    key={c.id || i}
                    className="flex items-center justify-between rounded-xl bg-[#0D1424] p-2 sm:p-2.5 transition-colors group-hover/market-card:bg-[#121B30]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Raw Contestant Avatar */}
                      <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                        <Image
                          src={c.avatarUrl || defaultTestImg}
                          alt={c.name}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 32px, 32px"
                          className="object-contain"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                        {c.name}
                      </span>
                    </div>
                    {/* Odds Button inside Row Housing Container */}
                    <div className="rounded-lg border border-white/5 bg-[#080D19] p-1 shrink-0">
                      <OddsButton
                        label="Yes"
                        odds={
                          c.odds ||
                          formatOddsFromProbability(c.probability || 25)
                        }
                        variant="yes"
                        className="min-h-[30px] py-0.5 px-2 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Expander Link housed in Main Base BG Container */}
              <div className="rounded-xl border border-white/5 bg-[#080D19] p-2 text-center">
                <span className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
                  {contestants.length > 3
                    ? `see more ... (+${contestants.length - 3} more)`
                    : "see more ..."}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Standardized Card Footer (Always aligns horizontally at bottom) */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
          <span className="font-semibold text-slate-300 truncate max-w-[130px]">
            {categoryLabel}
          </span>
          <div className="flex items-center gap-3">
            {volume && (
              <span className="font-mono text-[11px] text-slate-400">{volume}</span>
            )}
            <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
              <Heart className="size-3.5 text-rose-500 fill-rose-500/20 shrink-0" />
              <span>{likesCount}</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export { MarketCard, MarketCardSkeleton }
