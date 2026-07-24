"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface MarketSuspendedDialogProps {
  isOpen: boolean
  onClose: () => void
  payload: {
    title: string
    reason?: string
  }
  status: DialogStatus
}

export function MarketSuspendedDialog({ isOpen, onClose, payload, status }: MarketSuspendedDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Market Suspended"
      description="Trading on this market has been suspended."
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <AlertCircle className="h-12 w-12 text-destructive animate-pulse" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>Market Suspended</DialogTitle>
          <DialogDescription className="font-semibold text-foreground mt-2">
            {payload.title}
          </DialogDescription>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Reason: {payload.reason || "Under administrative review. Trading is locked temporarily."}
          </p>
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full bg-primary text-white hover:bg-primary-hover">
          Understood
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default MarketSuspendedDialog
