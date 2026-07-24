"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Timer } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface RateLimitDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
}

export function RateLimitDialog({ isOpen, onClose, status }: RateLimitDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Too Many Requests"
      description="You have hit our rate limit."
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <Timer className="h-12 w-12 text-[var(--state-error)]" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>Slow Down!</DialogTitle>
          <DialogDescription>
            You are making requests too quickly. Please wait a few seconds before trying your action again.
          </DialogDescription>
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full bg-primary text-white hover:bg-primary-hover">
          Dismiss
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default RateLimitDialog
