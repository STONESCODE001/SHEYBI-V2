"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Wrench } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../primitives"
import { DialogStatus } from "../types"

interface MaintenanceDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
}

export function MaintenanceDialog({ isOpen, onClose, status }: MaintenanceDialogProps) {
  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="System Maintenance"
      description="Sheybi is undergoing scheduled maintenance."
      showCloseButton={false}
    >
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <Wrench className="h-12 w-12 text-primary animate-pulse" />
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>System Maintenance</DialogTitle>
          <DialogDescription>
            We are performing updates to improve your experience. We will be back online shortly. Thank you for your patience!
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
export default MaintenanceDialog
