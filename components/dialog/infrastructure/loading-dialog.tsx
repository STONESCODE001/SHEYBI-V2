"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Loader2 } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription } from "../primitives"
import { DialogStatus } from "../types"

interface LoadingDialogProps {
  isOpen: boolean
  onClose: () => void
  payload: {
    title: string
    message?: string
  }
  status: DialogStatus
}

export function LoadingDialog({ isOpen, onClose, payload, status }: LoadingDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      isFinancial={true}
      size="sm"
      type="loading"
      showCloseButton={false}
      title={payload.title}
    >
      <div className="flex flex-col items-center text-center py-6 gap-3" aria-live="assertive">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>{payload.title}</DialogTitle>
          {payload.message && (
            <DialogDescription className="animate-pulse">{payload.message}</DialogDescription>
          )}
        </DialogHeader>
      </div>
    </ResponsiveWrapper>
  )
}
export default LoadingDialog
