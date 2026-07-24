"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface AlertDialogProps {
  isOpen: boolean
  onClose: (result?: any) => void
  payload: {
    title: string
    description?: string
    actionLabel?: string
    isFinancial?: boolean
  }
  status: DialogStatus
}

export function AlertDialog({ isOpen, onClose, payload, status }: AlertDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={() => onClose()}
      status={status}
      isFinancial={payload.isFinancial}
      size="sm"
      type="alert"
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
        <Button onClick={() => onClose()} className="w-full sm:w-auto bg-primary text-white hover:bg-primary-hover">
          {payload.actionLabel || "OK"}
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default AlertDialog
