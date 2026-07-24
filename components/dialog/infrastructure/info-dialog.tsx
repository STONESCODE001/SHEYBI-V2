"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface InfoDialogProps {
  isOpen: boolean
  onClose: () => void
  payload: {
    title: string
    description?: string
    actionLabel?: string
  }
  status: DialogStatus
}

export function InfoDialog({ isOpen, onClose, payload, status }: InfoDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      type="alert"
      title={payload.title}
      description={payload.description}
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <HelpCircle className="h-12 w-12 text-info" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>{payload.title}</DialogTitle>
          {payload.description && (
            <DialogDescription>{payload.description}</DialogDescription>
          )}
        </DialogHeader>
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full bg-primary text-white hover:bg-primary-hover">
          {payload.actionLabel || "Got It"}
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default InfoDialog
