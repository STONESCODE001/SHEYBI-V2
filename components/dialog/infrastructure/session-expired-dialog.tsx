"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface SessionExpiredDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
}

export function SessionExpiredDialog({ isOpen, onClose, status }: SessionExpiredDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Session Expired"
      description="Your session has expired. Please sign in again to continue."
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <AlertTriangle className="h-12 w-12 text-[var(--state-warning)]" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>Your session has expired. Please sign in again to continue trading.</DialogDescription>
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button onClick={() => {
          onClose();
          window.location.href = "/auth/sign-in";
        }} className="w-full bg-primary text-white hover:bg-primary-hover">
          Sign In
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default SessionExpiredDialog
