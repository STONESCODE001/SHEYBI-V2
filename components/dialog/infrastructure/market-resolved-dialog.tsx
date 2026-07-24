"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface MarketResolvedDialogProps {
  isOpen: boolean
  onClose: () => void
  payload: {
    title: string
    resolution?: string
    payout?: string
  }
  status: DialogStatus
}

export function MarketResolvedDialog({ isOpen, onClose, payload, status }: MarketResolvedDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Market Resolved"
      description="A market has been resolved."
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <Award className="h-12 w-12 text-[var(--state-success)]" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>Market Resolved!</DialogTitle>
          <DialogDescription className="font-semibold text-foreground mt-2">
            {payload.title}
          </DialogDescription>
          <div className="mt-4 p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] w-full text-center">
            <span className="text-xs text-[var(--text-muted)] block uppercase tracking-wider">Winning Outcome</span>
            <span className="font-mono text-xl font-bold text-[var(--market-yes)] block mt-1">{payload.resolution || "YES"}</span>
            {payload.payout && (
              <span className="text-sm text-[var(--text-secondary)] block mt-2 font-mono">
                Payout: {payload.payout}
              </span>
            )}
          </div>
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full bg-primary text-white hover:bg-primary-hover">
          Great!
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default MarketResolvedDialog
