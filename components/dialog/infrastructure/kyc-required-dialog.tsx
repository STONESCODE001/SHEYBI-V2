"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface KYCRequiredDialogProps {
  isOpen: boolean
  onClose: (approved: boolean) => void
  status: DialogStatus
}

export function KYCRequiredDialog({ isOpen, onClose, status }: KYCRequiredDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={() => onClose(false)}
      status={status}
      size="sm"
      title="Identity Verification Required"
      description="KYC verification is required for this action."
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <ShieldCheck className="h-12 w-12 text-primary" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>Verification Required</DialogTitle>
          <DialogDescription>
            Under regulatory compliance, you must complete your identity verification (KYC) before performing deposits, withdrawals, or large trades.
          </DialogDescription>
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onClose(false)} className="w-full sm:w-auto text-[var(--text-secondary)] border-[var(--border-default)]">
          Cancel
        </Button>
        <Button onClick={() => onClose(true)} className="w-full sm:w-auto bg-primary text-white hover:bg-primary-hover">
          Verify Identity
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default KYCRequiredDialog
