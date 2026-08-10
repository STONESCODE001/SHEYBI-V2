"use client"

import React, { useState } from "react"
import { ResponsiveDialog } from "@/components/dialog/responsive-wrapper"
import { PauseCircle, PlayCircle, Users } from "lucide-react"

export interface AdminOptionItem {
  id: string
  name: string
  probability?: number
  isPaused?: boolean
}

export interface ManageOptionsDialogProps {
  isOpen: boolean
  onClose: () => void
  marketId: string
  marketTitle: string
  options: AdminOptionItem[]
  onToggleOptionPause: (optionId: string, currentIsPaused: boolean) => Promise<void>
}

/**
 * ManageOptionsDialog Component
 * Allows administrators to manage individual options (e.g. housemates/candidates) in multi-option markets.
 * Admins can pause or unpause trading for specific candidates (such as upon eviction).
 */
export function ManageOptionsDialog({
  isOpen,
  onClose,
  marketId,
  marketTitle,
  options,
  onToggleOptionPause,
}: ManageOptionsDialogProps) {
  const [loadingOptionId, setLoadingOptionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async (optionId: string, currentIsPaused: boolean) => {
    try {
      setLoadingOptionId(optionId)
      setError(null)
      await onToggleOptionPause(optionId, currentIsPaused)
    } catch (err: any) {
      setError(err.message || "Failed to update option state.")
    } finally {
      setLoadingOptionId(null)
    }
  }

  return (
    <ResponsiveDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Housemates / Market Options"
    >
      <div className="space-y-4 p-1">
        {/* Helper Banner */}
        <div className="p-3 bg-surface-container border border-border rounded-xl flex items-start gap-2.5 text-xs text-text-secondary">
          <Users className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <div>
            <p className="font-bold text-text-primary">Individual Option Trading Control</p>
            <p className="mt-0.5 text-text-muted">
              Pausing a housemate hides their YES and NO trading buttons on the public market view.
              Use this when a housemate is evicted or disqualified.
            </p>
          </div>
        </div>

        {/* Market Title Badge */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            Multi-Option Market
          </label>
          <div className="p-3 bg-bg-surface-secondary border border-border rounded-xl font-bold text-text-primary text-sm">
            {marketTitle}
          </div>
        </div>

        {/* Error Display */}
        {error && <p className="text-xs text-danger font-semibold">{error}</p>}

        {/* Options List Table */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {options.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-muted font-medium">
              No options found for this market.
            </div>
          ) : (
            options.map((opt) => {
              const isPaused = Boolean(opt.isPaused)
              const isLoading = loadingOptionId === opt.id

              return (
                <div
                  key={opt.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isPaused
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-bg-surface-secondary border-border hover:border-border-hover"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-text-primary flex items-center gap-2">
                      {opt.name}
                      {isPaused && (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Paused
                        </span>
                      )}
                    </span>
                    {opt.probability !== undefined && (
                      <span className="text-xs text-text-muted font-medium">
                        Current Prob: {opt.probability}%
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleToggle(opt.id, isPaused)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                      isPaused
                        ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                        : "bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20"
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" />
                        {isLoading ? "Unpausing..." : "Unpause Option"}
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" />
                        {isLoading ? "Pausing..." : "Pause Option"}
                      </>
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary rounded-xl border border-border"
          >
            Done
          </button>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
