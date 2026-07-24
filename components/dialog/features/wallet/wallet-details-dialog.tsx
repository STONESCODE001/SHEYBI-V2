"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { WalletCard } from "@/components/parent/wallet-card"
import { ActivityCard } from "@/components/parent/activity-card"
import { DialogHeader, DialogTitle, DialogDescription, DialogScrollArea } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"

interface WalletDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  payload?: {
    availableBalance?: string
  }
  status: DialogStatus
}

export function WalletDetailsDialog({ isOpen, onClose, payload, status }: WalletDetailsDialogProps) {
  const dialog = useDialog()
  const balance = payload?.availableBalance || "₦145,200.00"

  const handleDeposit = () => {
    onClose()
    // Open deposit dialog
    dialog.open("wallet/deposit")
  }

  const handleWithdraw = () => {
    onClose()
    // Open withdraw dialog
    dialog.open("wallet/withdraw")
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="md"
      title="Wallet Details"
      description="View available balances and recent transaction history."
    >
      <DialogHeader className="p-0">
        <DialogTitle className="text-xl">Wallet Overview</DialogTitle>
        <DialogDescription>Manage your funds, track locked tokens, and view transaction statements.</DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-6">
        <WalletCard
          availableBalance={balance}
          lockedBalance="₦12,500.00"
          portfolioValue="₦48,200.00"
          status="Active"
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</h4>
          <DialogScrollArea className="flex flex-col gap-3 max-h-[250px]">
            <ActivityCard
              activityType="deposit"
              username="Jane Doe"
              description="Deposited via Mastercard"
              timestamp="Today, 2:45 PM"
              amount="+₦50,000.00"
            />
            <ActivityCard
              activityType="trade"
              username="Jane Doe"
              description="Bought 150 YES shares on Central Bank interest rate market"
              timestamp="Yesterday, 1:12 PM"
              amount="-₦10,000.00"
            />
            <ActivityCard
              activityType="withdrawal"
              username="Jane Doe"
              description="Withdrew to GTBank"
              timestamp="Oct 15, 2:10 PM"
              amount="-₦25,000.00"
            />
          </DialogScrollArea>
        </div>
      </div>
    </ResponsiveWrapper>
  )
}
export default WalletDetailsDialog
