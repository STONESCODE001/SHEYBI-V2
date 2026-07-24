"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface SuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  payload: {
    title: string
    description?: string
    actionLabel?: string
  }
  status: DialogStatus
}

export function SuccessDialog({ isOpen, onClose, payload, status }: SuccessDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      type="success"
      title={payload.title}
      description={payload.description}
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <CheckCircle2 className="h-12 w-12 text-success animate-in zoom-in-50 duration-200" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>{payload.title}</DialogTitle>
          {payload.description && (
            <DialogDescription>{payload.description}</DialogDescription>
          )}
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full bg-primary text-white hover:bg-primary-hover">
          {payload.actionLabel || "Done"}
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default SuccessDialog
