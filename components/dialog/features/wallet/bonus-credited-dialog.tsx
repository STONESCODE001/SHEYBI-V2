"use client"

import * as React from "react"
import Image from "next/image"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"

interface BonusCreditedDialogProps {
  isOpen: boolean
  onClose: () => void
  payload?: {
    amount?: number
  }
  status: DialogStatus
}

export function BonusCreditedDialog({ isOpen, onClose, payload, status }: BonusCreditedDialogProps) {
  const bonusAmount = payload?.amount || 300

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      type="success"
      title="Bonus Credited!"
    >
      <div className="flex flex-col items-center text-center py-4 px-2 gap-4">
        {/* Gift Box graphic from public directory */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center animate-in zoom-in-75 duration-300">
          <Image
            src="/gift-box.png"
            alt="Bonus Gift Box"
            width={128}
            height={128}
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>

        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Bonus Credited!
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1 max-w-[260px]">
            ₦{bonusAmount.toLocaleString()} playable bonus has been added to your wallet.
          </DialogDescription>
        </DialogHeader>
      </div>

      <DialogFooter>
        <Button
          onClick={onClose}
          className="w-full bg-[#FFC91F] hover:bg-[#e0b01b] text-black font-bold h-11 rounded-xl shadow-md transition-all cursor-pointer"
        >
          Start Predicting
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}

export default BonusCreditedDialog
