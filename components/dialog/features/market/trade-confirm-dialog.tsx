"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"
import { MarketOutcomeChip } from "@/components/child/market-outcome-chip"
import { cn } from "@/lib/utils"

interface TradeConfirmDialogProps {
  isOpen: boolean
  onClose: (confirmed: boolean) => void
  payload: {
    marketTitle: string
    outcome: "yes" | "no"
    amount: string
    probability: string
    estimatedShares: string
    tradingFee: string
    totalCost: string
    isBuy?: boolean
  }
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

export function TradeConfirmDialog({ isOpen, onClose, payload, status, setStatus }: TradeConfirmDialogProps) {
  const dialog = useDialog()
  const isBuy = payload.isBuy ?? true

  const handleConfirm = async () => {
    onClose(true) // Resolve standard confirm path

    const loader = dialog.loading({
      title: isBuy ? "Executing Buy Order" : "Executing Sell Order",
      description: "Submitting order to prediction engine..."
    })

    // Simulate prediction engine execution
    await new Promise((r) => setTimeout(r, 1500))
    loader.update("Updating prediction balances...")
    await new Promise((r) => setTimeout(r, 1000))

    loader.close()

    // Show success dialog
    await dialog.success({
      title: isBuy ? "Shares Purchased" : "Shares Sold",
      description: `Your order for ${payload.estimatedShares} ${payload.outcome === "yes" ? "YES" : "NO"} shares has been successfully executed.`
    })

    // Trigger state refresh (simulation / event dispatch)
    console.log("[Dialog Framework] Refreshing prediction market and portfolio state.")
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={() => onClose(false)}
      status={status}
      isFinancial={true} // financial locked dialog
      size="sm"
      title="Confirm Trade"
      description="Review your trade details before submission."
    >
      <DialogHeader className="p-0">
        <DialogTitle className="text-xl">Confirm Trade</DialogTitle>
        <DialogDescription>Your order will be matched immediately. Please review execution details.</DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-4">
        {/* Market Title block */}
        <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-secondary)]">
          <span className="text-[var(--text-muted)] text-xs block uppercase tracking-wider font-semibold">Prediction Market</span>
          <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{payload.marketTitle}</p>
        </div>

        {/* Trade summary card details */}
        <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-muted)] font-medium">Position Outcome</span>
            <MarketOutcomeChip outcome={payload.outcome} className="scale-95 origin-right">
              {payload.outcome === "yes" ? "YES" : "NO"}
            </MarketOutcomeChip>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-muted)] font-medium">Estimated Shares</span>
            <span className="font-mono font-semibold text-[var(--text-primary)]">{payload.estimatedShares}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-muted)] font-medium">Probability</span>
            <span className="font-mono font-semibold text-[var(--text-primary)]">{payload.probability}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-muted)] font-medium">Trading Fee</span>
            <span className="font-mono font-semibold text-[var(--text-primary)]">{payload.tradingFee}</span>
          </div>

          <div className="flex justify-between items-center text-sm border-t border-[var(--border-default)] pt-2.5">
            <span className="font-semibold text-[var(--text-primary)]">
              {isBuy ? "Total Cost" : "Net Payout"}
            </span>
            <span className="font-mono font-bold text-[var(--text-primary)] text-lg">
              {payload.totalCost}
            </span>
          </div>
        </div>

        <DialogFooter className="p-0 gap-2">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="w-full sm:w-1/2 text-[var(--text-secondary)] border-[var(--border-default)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn(
              "w-full sm:w-1/2 text-white font-semibold",
              payload.outcome === "yes"
                ? "bg-[var(--market-yes)] hover:bg-[var(--market-yes-hover)]"
                : "bg-[var(--market-no)] hover:bg-[var(--market-no-hover)]"
            )}
          >
            Confirm {isBuy ? "Buy" : "Sell"}
          </Button>
        </DialogFooter>
      </div>
    </ResponsiveWrapper>
  )
}
export default TradeConfirmDialog
