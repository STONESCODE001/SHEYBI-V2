"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface ComingSoonDialogProps {
  isOpen: boolean
  onClose: () => void
  payload?: {
    featureName?: string
  }
  status: DialogStatus
}

export function ComingSoonDialog({ isOpen, onClose, payload, status }: ComingSoonDialogProps) {
  const feature = payload?.featureName || "This feature"

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Coming Soon"
      description="Feature is currently in development."
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <Sparkles className="h-12 w-12 text-[var(--accent-secondary)]" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>Coming Soon!</DialogTitle>
          <DialogDescription>
            {feature} is under development and will be released in an upcoming update. Stay tuned!
          </DialogDescription>
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full bg-primary text-white hover:bg-primary-hover">
          Exiting
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default ComingSoonDialog
