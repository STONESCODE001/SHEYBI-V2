"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: (result: boolean) => void
  payload: {
    title: string
    description?: string
    actionLabel?: string
    cancelLabel?: string
    isFinancial?: boolean
  }
  status: DialogStatus
}

export function ConfirmDialog({ isOpen, onClose, payload, status }: ConfirmDialogProps) {
  const isLocked = payload.isFinancial || status === "disabled" || status === "pending"

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={() => onClose(false)}
      status={status}
      isFinancial={payload.isFinancial}
      size="sm"
      type="confirm"
      title={payload.title}
      description={payload.description}
    >
      <DialogHeader>
        <DialogTitle>{payload.title}</DialogTitle>
        {payload.description && (
          <DialogDescription>{payload.description}</DialogDescription>
        )}
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onClose(false)}
          disabled={isLocked}
          className="w-full sm:w-auto text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
        >
          {payload.cancelLabel || "Cancel"}
        </Button>
        <Button
          variant="default"
          onClick={() => onClose(true)}
          disabled={isLocked}
          className={cn(
            "w-full sm:w-auto text-white",
            payload.isFinancial
              ? "bg-success hover:bg-success/90"
              : "bg-primary hover:bg-primary-hover"
          )}
        >
          {payload.actionLabel || "Confirm"}
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default ConfirmDialog
