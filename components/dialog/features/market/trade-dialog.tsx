"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

export interface UserPosition {
  outcome: "yes" | "no"
  shares: number
  avgPrice: number
}

interface TradeDialogProps {
  isOpen: boolean
  onClose: (confirmed: boolean) => void
  payload: {
    marketId?: string
    marketTitle: string
    initialOutcome?: "yes" | "no"
    initialMode?: "buy" | "sell"
    yesProbability?: number // e.g. 50
    noProbability?: number  // e.g. 50
    yesPrice?: number       // e.g. 0.33
    noPrice?: number        // e.g. 0.20
    userPosition?: UserPosition | null
  }
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

/**
 * TradeDialog
 * Ultra-simple, friendly Gen Z trade execution sheet.
 * Renders as a modal dialog on desktop and a bottom sheet drawer on mobile.
 * Features single-outcome position collision detection (Single-Outcome Exposure Invariant).
 */
export function TradeDialog({ isOpen, onClose, payload, status }: TradeDialogProps) {
  const dialog = useDialog()

  const [mode, setMode] = React.useState<"buy" | "sell">(payload.initialMode || "buy")
  const [outcome, setOutcome] = React.useState<"yes" | "no">(payload.initialOutcome || "yes")
  const [amount, setAmount] = React.useState<string>("1000")
  const [sellPercentage, setSellPercentage] = React.useState<number>(100)

  // Prices and probabilities
  const yesPrice = payload.yesPrice || 0.33
  const noPrice = payload.noPrice || 0.20
  const activePrice = outcome === "yes" ? yesPrice : noPrice

  // Active user position if any
  const userPosition = payload.userPosition || null
  const hasCollision =
    mode === "buy" &&
    userPosition &&
    userPosition.shares > 0 &&
    userPosition.outcome !== outcome

  // Amount parsing
  const numericAmount = parseFloat(amount) || 0

  // Buy Mode Calculations (Zero-jargon)
  const sharesToReceive = activePrice > 0 ? Math.floor(numericAmount / activePrice) : 0
  const potentialWin = sharesToReceive * 1 // N1 payout per share at resolution
  const potentialProfit = Math.max(0, potentialWin - numericAmount)

  // Sell Mode Calculations
  const availableSharesToSell = userPosition?.outcome === outcome ? userPosition.shares : 0
  const sharesBeingSold = Math.floor((availableSharesToSell * sellPercentage) / 100)
  const cashReturn = (sharesBeingSold * activePrice).toFixed(2)

  // Fast preset stakes
  const buyPresets = ["500", "1000", "2000", "5000"]
  const sellPresets = [25, 50, 75, 100]

  const handleConfirmTrade = async () => {
    onClose(true)

    const actionText = mode === "buy" ? `Buying ${outcome.toUpperCase()}` : `Selling ${outcome.toUpperCase()}`
    const loader = dialog.loading({
      title: `${actionText} Order`,
      description: "Submitting order to prediction engine..."
    })

    await new Promise((r) => setTimeout(r, 1200))
    loader.update("Updating prediction balances...")
    await new Promise((r) => setTimeout(r, 800))

    loader.close()

    await dialog.success({
      title: mode === "buy" ? "Prediction Placed!" : "Position Sold!",
      description:
        mode === "buy"
          ? `Boom! You predicted ${outcome.toUpperCase()} with ₦${numericAmount.toLocaleString()}. Potential win: ₦${potentialWin.toLocaleString()}`
          : `You sold ${sharesBeingSold} ${outcome.toUpperCase()} shares for ₦${cashReturn}. Funds returned to wallet!`
    })
  }

  const handleSwitchToSellPosition = () => {
    if (userPosition) {
      setMode("sell")
      setOutcome(userPosition.outcome)
    }
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={() => onClose(false)}
      status={status}
      isFinancial={false}
      size="md"
      title="Trade Prediction"
      description="Place or edit your prediction order."
    >
      <DialogHeader className="p-0 text-left">
        <DialogTitle className="text-xl font-bold text-[var(--text-primary)]">
          {mode === "buy" ? "Place Prediction" : "Sell Position"}
        </DialogTitle>
        <DialogDescription className="text-sm text-[var(--text-muted)] line-clamp-2 mt-0.5">
          {payload.marketTitle}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-4">
        {/* Mode Selector (BUY / SELL) */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0B0E14] border border-[#1E2A44]">
          <button
            type="button"
            onClick={() => setMode("buy")}
            className={cn(
              "py-2.5 rounded-lg font-bold text-sm transition-all",
              mode === "buy"
                ? "bg-[#161F33] text-white shadow-sm border border-[#2B3240]"
                : "text-[var(--text-muted)] hover:text-white"
            )}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setMode("sell")}
            className={cn(
              "py-2.5 rounded-lg font-bold text-sm transition-all",
              mode === "sell"
                ? "bg-[#161F33] text-white shadow-sm border border-[#2B3240]"
                : "text-[var(--text-muted)] hover:text-white"
            )}
          >
            SELL
          </button>
        </div>

        {/* Outcome Selector (YES / NO) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOutcome("yes")}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
              outcome === "yes"
                ? "bg-[#30D878]/10 border-[#30D878] ring-1 ring-[#30D878]"
                : "bg-[#0B0E14] border-[#1E2A44] opacity-70 hover:opacity-100"
            )}
          >
            <span className="text-xs text-[var(--text-muted)] font-medium">Predict</span>
            <span className="text-lg font-black text-[#30D878] mt-0.5">YES</span>
          </button>

          <button
            type="button"
            onClick={() => setOutcome("no")}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
              outcome === "no"
                ? "bg-[#FFC91F]/10 border-[#FFC91F] ring-1 ring-[#FFC91F]"
                : "bg-[#0B0E14] border-[#1E2A44] opacity-70 hover:opacity-100"
            )}
          >
            <span className="text-xs text-[var(--text-muted)] font-medium">Predict</span>
            <span className="text-lg font-black text-[#FFC91F] mt-0.5">NO</span>
          </button>
        </div>

        {/* Single-Outcome Exposure Invariant Warning Banner */}
        {hasCollision && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200 leading-relaxed font-medium">
                You currently hold <strong className="text-white font-bold">{userPosition.shares} {userPosition.outcome.toUpperCase()}</strong> shares. Sheybi allows holding only one side of a market at a time. Sell your {userPosition.outcome.toUpperCase()} position first to buy {outcome.toUpperCase()}.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSwitchToSellPosition}
              className="mt-1 w-full bg-amber-500/20 border-amber-500/40 text-amber-200 hover:bg-amber-500/30 text-xs font-semibold"
            >
              Switch to Sell {userPosition.outcome.toUpperCase()} Position
            </Button>
          </div>
        )}

        {/* Buy Mode Input & Presets */}
        {mode === "buy" && !hasCollision && (
          <div className="space-y-3">
            <label className="text-xs text-[var(--text-muted)] font-medium block">
              Enter Amount (₦)
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-[var(--text-muted)]">
                ₦
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 pl-8 pr-4 rounded-xl border border-[#1E2A44] bg-[#0B0E14] font-mono text-lg font-bold text-white focus:outline-none focus:border-[#30D878]"
              />
            </div>

            {/* Quick Stake Pills */}
            <div className="flex gap-2">
              {buyPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors border",
                    amount === preset
                      ? "bg-[#30D878]/20 border-[#30D878] text-[#30D878]"
                      : "bg-[#0B0E14] border-[#1E2A44] text-[var(--text-muted)] hover:text-white"
                  )}
                >
                  ₦{preset}
                </button>
              ))}
            </div>

            {/* Human-First Win Projection (Zero Jargon) */}
            <div className="p-4 rounded-xl border border-[#1E2A44] bg-[#0B0E14] space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-muted)] font-medium">Your Stake</span>
                <span className="font-mono font-bold text-white">₦{numericAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-[#1E2A44] pt-2">
                <span className="text-[var(--text-muted)] font-medium">If You Win</span>
                <span className="font-mono font-black text-lg text-[#30D878]">
                  ₦{potentialWin.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)]">Net Profit Potential</span>
                <span className="font-mono font-bold text-[#30D878]">
                  +₦{potentialProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sell Mode Input & Presets */}
        {mode === "sell" && (
          <div className="space-y-3">
            {availableSharesToSell === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#1E2A44] bg-[#0B0E14] text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  You don't hold any <strong className="text-white">{outcome.toUpperCase()}</strong> shares in this market to sell.
                </p>
              </div>
            ) : (
              <>
                <label className="text-xs text-[var(--text-muted)] font-medium block">
                  Select Percentage to Sell
                </label>

                {/* Sell Percentage Pills */}
                <div className="flex gap-2">
                  {sellPresets.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSellPercentage(pct)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-colors border",
                        sellPercentage === pct
                          ? "bg-[#FFC91F]/20 border-[#FFC91F] text-[#FFC91F]"
                          : "bg-[#0B0E14] border-[#1E2A44] text-[var(--text-muted)] hover:text-white"
                      )}
                    >
                      {pct}% {pct === 100 && "(ALL)"}
                    </button>
                  ))}
                </div>

                {/* Sell Return Summary */}
                <div className="p-4 rounded-xl border border-[#1E2A44] bg-[#0B0E14] space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-muted)] font-medium">Shares to Sell</span>
                    <span className="font-mono font-bold text-white">{sharesBeingSold} Shares</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-[#1E2A44] pt-2">
                    <span className="text-[var(--text-muted)] font-medium">Cash Returned to Wallet</span>
                    <span className="font-mono font-black text-lg text-[#FFC91F]">
                      ₦{cashReturn}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleConfirmTrade}
          disabled={
            hasCollision ||
            (mode === "buy" && numericAmount < 100) ||
            (mode === "sell" && sharesBeingSold <= 0)
          }
          className={cn(
            "w-full h-12 rounded-xl text-base font-extrabold text-[#0B0E14] mt-1 shadow-md transition-all",
            outcome === "yes"
              ? "bg-[#30D878] hover:bg-[#28B865]"
              : "bg-[#FFC91F] hover:bg-[#E0B01B]"
          )}
        >
          {mode === "buy" ? (
            <>
              Predict {outcome.toUpperCase()} with ₦{numericAmount.toLocaleString()}
            </>
          ) : (
            <>
              Confirm Sell {sharesBeingSold} {outcome.toUpperCase()} Shares
            </>
          )}
        </Button>
      </div>
    </ResponsiveWrapper>
  )
}

export default TradeDialog
