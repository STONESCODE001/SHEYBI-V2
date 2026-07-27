"use client"

import * as React from "react"
import { X, CheckCircle2, AlertTriangle, Trophy } from "lucide-react"
import { toast } from "sonner"

/**
 * Explanatory Interface: ResolveMarketDialogProps
 * Configuration props for controlling the market resolution modal.
 */
export interface ResolveMarketDialogProps {
  /** Controls modal visibility */
  isOpen: boolean
  /** Callback fired when modal is closed */
  onClose: () => void
  /** The target market object being resolved */
  market: {
    id: string
    title: string
    category: string
    options: { id: string; title: string }[]
  } | null
  /** Callback fired when the admin resolves the market with a winning option ID */
  onResolveMarket: (marketId: string, winningOptionId: string) => void
}

/**
 * Explanatory Component: ResolveMarketDialog
 * Allows administrators to select the winning outcome for a closed prediction market.
 * Resolving a market triggers financial settlement: winning position holders receive ₦ payouts
 * and losing positions become settled to ₦0.
 */
export function ResolveMarketDialog({
  isOpen,
  onClose,
  market,
  onResolveMarket,
}: ResolveMarketDialogProps) {
  const [selectedOptionId, setSelectedOptionId] = React.useState<string>("")

  if (!isOpen || !market) return null

  /**
   * Handles market resolution confirmation
   */
  const handleConfirmResolution = () => {
    if (!selectedOptionId) {
      toast.error("Please select a winning outcome option!")
      return
    }

    const winningOption = market.options.find((opt) => opt.id === selectedOptionId)
    onResolveMarket(market.id, selectedOptionId)
    toast.success(`Market resolved successfully! Winner declared: ${winningOption?.title}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-surface-subtle shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold text-text-primary">Resolve Prediction Market</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-container hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-border bg-surface-bright p-4">
            <span className="text-xs font-semibold text-text-muted uppercase">Market Title</span>
            <p className="mt-1 text-base font-semibold text-text-primary">{market.title}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Select Declared Winning Outcome *
            </label>
            <div className="space-y-2">
              {market.options.map((option) => {
                const isSelected = selectedOptionId === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOptionId(option.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-success bg-success/10 text-success"
                        : "border-border bg-surface-bright text-text-primary hover:border-success/40"
                    }`}
                  >
                    <span className="font-semibold text-sm">{option.title}</span>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-success" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Alert Warning */}
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3.5 text-warning">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong>Warning</strong>: Resolving a market is <strong>irreversible</strong>. Winning position holders will receive ₦ payouts immediately according to prediction engine settlement rules.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border p-5 bg-surface-subtle rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmResolution}
            className="rounded-xl bg-success text-on-primary px-5 py-2.5 text-sm font-semibold hover:bg-success/90 shadow-md transition-all"
          >
            Confirm & Settle Payouts
          </button>
        </div>
      </div>
    </div>
  )
}
