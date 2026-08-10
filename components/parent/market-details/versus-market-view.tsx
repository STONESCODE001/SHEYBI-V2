"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { ArrowLeft, User, HelpCircle } from "lucide-react"
import { RatioBar } from "@/components/child/ratio-bar"
import { OddsButton } from "@/components/child/odds-button"
import { useDialog } from "@/components/dialog"
import { cn } from "@/lib/utils"

export interface PlayerData {
  id: string
  name: string
  avatarUrl?: string
  probability?: number // e.g. 50
  yesOptionId?: string
  noOptionId?: string
  yesOddsText?: string // e.g. "1k → 3k"
  noOddsText?: string  // e.g. "1k → 5k"
  yesPrice?: number    // e.g. 0.33
  noPrice?: number     // e.g. 0.20
}

export interface VersusMarketData {
  id: string
  title: string
  category?: string
  rules?: string
  player1: PlayerData
  player2: PlayerData
  tradeHistory?: Array<{
    id: string
    shares: number
    outcome: "yes" | "no"
    playerName?: string
    timestamp: string
  }>
  userPosition?: {
    outcome: "yes" | "no"
    playerName?: string
    shares: number
    avgPrice: number
  } | null
}

interface VersusMarketViewProps {
  market: VersusMarketData
}

/**
 * DB INTEGRATION NOTE (database-schema.md & prediction-engine.md):
 * ----------------------------------------------------------------
 * 1v1 Versus Markets represent a direct head-to-head matchup between two options/players.
 * The probabilities of Player 1 and Player 2 are derived from their share prices / AMM pools:
 * 
 *   Player 1 Probability % = (pool_balance_player2 / (pool_balance_player1 + pool_balance_player2)) * 100
 *   Player 2 Probability % = 100 - Player 1 Probability %
 * 
 * Single-Outcome Exposure Invariant:
 *   Users may only hold an active position in ONE outcome of a given market at any single moment.
 */
export function VersusMarketView({ market }: VersusMarketViewProps): React.ReactElement {
  const dialog = useDialog()
  const router = useRouter()
  const { isSignedIn } = useAuth()

  const player1 = market.player1
  const player2 = market.player2

  const p1RawProb = player1.probability ?? 50
  const rawP1 = p1RawProb > 0 && p1RawProb <= 1 ? p1RawProb * 100 : p1RawProb
  const p1Prob = Number(rawP1.toFixed(1))

  const p2RawProb = player2.probability ?? (100 - p1Prob)
  const rawP2 = p2RawProb > 0 && p2RawProb <= 1 ? p2RawProb * 100 : p2RawProb
  const p2Prob = Number(rawP2.toFixed(1))

  const hasRules = Boolean(market.rules && market.rules.trim())
  const marketRules = hasRules ? market.rules : "Rules unavailable for this market. Trading is currently disabled."

  const historyItems = market.tradeHistory || []

  const handleOpenTradeDialog = (player: PlayerData, outcome: "yes" | "no") => {
    if (!isSignedIn) {
      router.push("/auth/sign-in")
      return
    }
    if (!hasRules) return

    const targetOptionId = outcome === "yes"
      ? (player.yesOptionId || player.id)
      : (player.noOptionId || player.id)

    dialog.open("trade/dialog", {
      marketId: market.id,
      optionId: targetOptionId,
      playerName: player.name,
      optionName: player.name,
      marketTitle: market.title,
      initialOutcome: outcome,
      initialMode: "buy",
      yesProbability: player.probability || 50,
      noProbability: 100 - (player.probability || 50),
      yesPrice: player.yesPrice || 0.33,
      noPrice: player.noPrice || 0.20,
      userPosition: market.userPosition || null,
    })
  }

  return (
    <div data-slot="versus-market-view" className="flex flex-col min-h-screen bg-[var(--bg-base)]">
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

        {/* Master 1v1 Prediction Explanation Banner */}
        <div className="p-3.5 rounded-2xl bg-[#141E33] flex items-start gap-2.5 shadow-sm text-xs sm:text-sm text-slate-200">
          <HelpCircle className="size-4 text-[#0EA5E9] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-400 font-bold">How 1v1 Predictions Work:</strong> Pick <span className="text-[#30D878] font-bold">YES</span> if you think that candidate will win, or <span className="text-[#FFC91F] font-bold">NO</span> if you think they will lose.
          </p>
        </div>

        {/* MOBILE VIEW (Stacked 1v1 Cards) */}
        <div className="md:hidden space-y-6">
          {/* Player 1 Block */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative size-36 sm:size-40 overflow-hidden rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center shadow-lg border border-white/10">
              {player1.avatarUrl ? (
                <Image
                  src={player1.avatarUrl}
                  alt={player1.name}
                  fill
                  sizes="(max-width: 768px) 160px, 160px"
                  className="object-cover object-top"
                />
              ) : (
                <User className="size-16 text-[var(--accent-green)]" />
              )}
            </div>

            <h2 className="text-lg font-black text-[var(--text-primary)]">{player1.name}</h2>

            <div className="space-y-1.5 w-full">
              <div className="grid grid-cols-2 gap-2.5 w-full p-1.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => handleOpenTradeDialog(player1, "yes")}
                  className="w-full text-left active:scale-[0.98] focus:outline-none"
                >
                  <OddsButton
                    label="Yes"
                    odds={player1.yesOddsText || "1k → 3k"}
                    variant="yes"
                    className="h-12 px-3"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenTradeDialog(player1, "no")}
                  className="w-full text-left active:scale-[0.98] focus:outline-none"
                >
                  <OddsButton
                    label="No"
                    odds={player1.noOddsText || "1k → 5k"}
                    variant="no"
                    className="h-12 px-3"
                  />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400 text-center px-1">
                <HelpCircle className="size-3 text-[#0EA5E9] shrink-0" />
                <span><span className="text-[#30D878] font-bold">YES</span> = {player1.name} wins | <span className="text-[#FFC91F] font-bold">NO</span> = {player1.name} loses</span>
              </div>
            </div>
          </div>

          {/* Central VS Separator */}
          <div className="text-center my-2">
            <span className="text-2xl font-black text-[var(--accent-yellow)] tracking-widest uppercase">
              VS
            </span>
          </div>

          {/* Player 2 Block */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative size-36 sm:size-40 overflow-hidden rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center shadow-lg border border-white/10">
              {player2.avatarUrl ? (
                <Image
                  src={player2.avatarUrl}
                  alt={player2.name}
                  fill
                  sizes="(max-width: 768px) 160px, 160px"
                  className="object-cover object-top"
                />
              ) : (
                <User className="size-16 text-[var(--accent-yellow)]" />
              )}
            </div>

            <h2 className="text-lg font-black text-[var(--text-primary)]">{player2.name}</h2>

            <div className="space-y-1.5 w-full">
              <div className="grid grid-cols-2 gap-2.5 w-full p-1.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => handleOpenTradeDialog(player2, "yes")}
                  className="w-full text-left active:scale-[0.98] focus:outline-none"
                >
                  <OddsButton
                    label="Yes"
                    odds={player2.yesOddsText || "1k → 3k"}
                    variant="yes"
                    className="h-12 px-3"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenTradeDialog(player2, "no")}
                  className="w-full text-left active:scale-[0.98] focus:outline-none"
                >
                  <OddsButton
                    label="No"
                    odds={player2.noOddsText || "1k → 5k"}
                    variant="no"
                    className="h-12 px-3"
                  />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400 text-center px-1">
                <HelpCircle className="size-3 text-[#0EA5E9] shrink-0" />
                <span><span className="text-[#30D878] font-bold">YES</span> = {player2.name} wins | <span className="text-[#FFC91F] font-bold">NO</span> = {player2.name} loses</span>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW (Hero Matchup Card) */}
        <div className="hidden md:block space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-6 shadow-xl">
            <div className="grid grid-cols-3 items-center text-center">
              {/* Player 1 Avatar & Name */}
              <div className="flex flex-col items-center space-y-2.5">
                <div className="relative size-36 md:size-40 overflow-hidden rounded-2xl bg-[var(--bg-base)] flex items-center justify-center shadow-lg border border-white/10">
                  {player1.avatarUrl ? (
                    <Image
                      src={player1.avatarUrl}
                      alt={player1.name}
                      fill
                      sizes="(max-width: 768px) 160px, 160px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <User className="size-16 text-[var(--accent-green)]" />
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{player1.name}</h2>
                <span className="text-sm font-extrabold text-[var(--accent-green)]">
                  {p1Prob}% Chance
                </span>
              </div>

              {/* Central VS */}
              <div className="flex items-center justify-center">
                <span className="text-3xl font-black text-[var(--accent-yellow)] tracking-widest">
                  VS
                </span>
              </div>

              {/* Player 2 Avatar & Name */}
              <div className="flex flex-col items-center space-y-2.5">
                <div className="relative size-36 md:size-40 overflow-hidden rounded-2xl bg-[var(--bg-base)] flex items-center justify-center shadow-lg border border-white/10">
                  {player2.avatarUrl ? (
                    <Image
                      src={player2.avatarUrl}
                      alt={player2.name}
                      fill
                      sizes="(max-width: 768px) 160px, 160px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <User className="size-16 text-[var(--accent-yellow)]" />
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{player2.name}</h2>
                <span className="text-sm font-extrabold text-[var(--accent-yellow)]">
                  {p2Prob}% Chance
                </span>
              </div>
            </div>

            {/* Split Ratio Bar */}
            <RatioBar
              yesProbability={p1Prob}
              noProbability={p2Prob}
              className="h-3 rounded-full"
            />
          </div>

          {/* Desktop Dual Player Odds Rows */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player 1 Odds Pair */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2.5 p-1.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => handleOpenTradeDialog(player1, "yes")}
                  className="w-full text-left active:scale-[0.98] focus:outline-none"
                >
                  <OddsButton
                    label="Yes"
                    odds={player1.yesOddsText || "1k → 3k"}
                    variant="yes"
                    className="h-14 px-4 text-base"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenTradeDialog(player1, "no")}
                  className="w-full text-left active:scale-[0.98] focus:outline-none"
                >
                  <OddsButton
                    label="No"
                    odds={player1.noOddsText || "1k → 5k"}
                    variant="no"
                    className="h-14 px-4 text-base"
                  />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs font-medium text-slate-400 text-center px-1">
                <HelpCircle className="size-3.5 text-[#0EA5E9] shrink-0" />
                <span><span className="text-[#30D878] font-bold">YES</span> = {player1.name} wins | <span className="text-[#FFC91F] font-bold">NO</span> = {player1.name} loses</span>
              </div>
            </div>

            {/* Player 2 Odds Pair */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2.5 p-1.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => handleOpenTradeDialog(player2, "yes")}
                  className="w-full text-left active:scale-[0.98] focus:outline-none"
                >
                  <OddsButton
                    label="Yes"
                    odds={player2.yesOddsText || "1k → 3k"}
                    variant="yes"
                    className="h-14 px-4 text-base"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenTradeDialog(player2, "no")}
                  className="w-full text-left active:scale-[0.98] focus:outline-none"
                >
                  <OddsButton
                    label="No"
                    odds={player2.noOddsText || "1k → 5k"}
                    variant="no"
                    className="h-14 px-4 text-base"
                  />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs font-medium text-slate-400 text-center px-1">
                <HelpCircle className="size-3.5 text-[#0EA5E9] shrink-0" />
                <span><span className="text-[#30D878] font-bold">YES</span> = {player2.name} wins | <span className="text-[#FFC91F] font-bold">NO</span> = {player2.name} loses</span>
              </div>
            </div>
          </div>
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
            {historyItems.length === 0 ? (
              <div className="text-center py-4 text-xs sm:text-sm text-[var(--text-muted)] font-medium">
                No trades placed on this matchup yet. Be the first to trade!
              </div>
            ) : (
              historyItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex justify-between items-center py-3 first:pt-0 last:pb-0 text-sm font-semibold"
                >
                  <div className="text-[var(--text-primary)]">
                    Trade {item.shares}{" "}
                    <span className={cn(item.outcome === "yes" ? "text-[var(--market-yes)] font-bold" : "text-[var(--accent-yellow)] font-bold")}>
                      {item.outcome.toUpperCase()}
                    </span>{" "}
                    Shares {item.playerName && `from ${item.playerName}`}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-normal">
                    {item.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Explore Markets Centered CTA ("see more ...") */}
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

export default VersusMarketView
