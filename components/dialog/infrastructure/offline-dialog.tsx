"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface OfflineDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
}

export function OfflineDialog({ isOpen, onClose, status }: OfflineDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Connection Lost"
      description="You are currently offline."
      showCloseButton={false}
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <WifiOff className="h-12 w-12 text-destructive animate-pulse" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>Connection Lost</DialogTitle>
          <DialogDescription>
            Please check your internet connection. We will re-establish connection as soon as network is restored.
          </DialogDescription>
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full bg-primary text-white hover:bg-primary-hover">
          OK
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default OfflineDialog
