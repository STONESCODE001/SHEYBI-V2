"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { WalletCard, ActivityCard } from "@/components/parent"
import { useDialog } from "@/components/dialog"
import { ArrowDownLeft, ArrowUpRight, History, Wallet as WalletIcon } from "lucide-react"

export default function WalletPage() {
  const dialog = useDialog()
  const availableBalance = "₦125,000.00"

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-4xl flex flex-col gap-8 py-2">

        {/* Primary Wallet Summary Card (Full Width, No Total Deposits/Withdrawals) */}
        <div className="w-full">
          <WalletCard
            availableBalance={availableBalance}
            status="Active"
            onDeposit={() => dialog.open("wallet/deposit")}
            onWithdraw={() => dialog.open("wallet/withdraw")}
          />
        </div>

        {/* Recent Transaction History Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <History className="size-5 text-[var(--text-secondary)]" />
              <span>Transaction History</span>
            </h2>
            <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg-surface-secondary)] px-3 py-1 rounded-full border border-[var(--border-default)]">
              Last 30 Days
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm">
            <ActivityCard
              activityType="deposit"
              username="System"
              description="Paystack Card Deposit"
              timestamp="Today, 2:45 PM"
              amount="+₦50,000.00"
            />
            <ActivityCard
              activityType="trade"
              username="Market"
              description="Bought YES: Who will win BBNaija Season 10?"
              timestamp="Yesterday, 6:12 PM"
              amount="-₦10,000.00"
            />
            <ActivityCard
              activityType="withdrawal"
              username="System"
              description="Bank Withdrawal (GTBank)"
              timestamp="Jul 20, 2026"
              amount="-₦25,000.00"
            />
            <ActivityCard
              activityType="trade"
              username="Market"
              description="Payout Won: Head of House Challenge"
              timestamp="Jul 18, 2026"
              amount="+₦35,000.00"
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
