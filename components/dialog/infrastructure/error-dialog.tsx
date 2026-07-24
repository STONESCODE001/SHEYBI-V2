"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface ErrorDialogProps {
  isOpen: boolean
  onClose: (retry: boolean) => void
  payload: {
    title: string
    description?: string
    actionLabel?: string
    cancelLabel?: string
  }
  status: DialogStatus
}

export function ErrorDialog({ isOpen, onClose, payload, status }: ErrorDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={() => onClose(false)}
      status={status}
      size="sm"
      type="error"
      title={payload.title}
      description={payload.description}
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <AlertCircle className="h-12 w-12 text-danger animate-bounce duration-300" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>{payload.title}</DialogTitle>
          {payload.description && (
            <DialogDescription>{payload.description}</DialogDescription>
          )}
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onClose(false)}
          className="w-full sm:w-auto text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
        >
          {payload.cancelLabel || "Cancel"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => onClose(true)}
          className="w-full sm:w-auto bg-danger hover:bg-danger/90 text-white"
        >
          {payload.actionLabel || "Retry"}
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default ErrorDialog
