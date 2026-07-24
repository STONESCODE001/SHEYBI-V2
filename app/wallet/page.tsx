"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { WalletCard, StatisticCard, ActivityCard } from "@/components/parent"
import { useDialog } from "@/components/dialog"

export default function WalletPage() {
  const dialog = useDialog()
  const availableBalance = "₦395.50"

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex-1">
            <WalletCard
              availableBalance={availableBalance}
              lockedBalance="₦15.00"
              portfolioValue="₦1,245.50"
              status="Active"
              onDeposit={() => dialog.open("wallet/deposit")}
              onWithdraw={() => dialog.open("wallet/withdraw")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:w-1/3 md:grid-cols-1 lg:w-1/4">
            <StatisticCard label="Total Deposits" value="$1,500.00" />
            <StatisticCard label="Total Withdrawals" value="$250.00" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent Transactions</h2>
          <div className="flex flex-col gap-4">
            <ActivityCard
              activityType="deposit"
              username="System"
              description="Deposit via Card"
              timestamp="Oct 24, 2026"
              amount="+$150.00"
            />
            <ActivityCard
              activityType="trade"
              username="Market"
              description="Purchased YES shares: Will the Central Bank lower interest rates?"
              timestamp="Oct 23, 2026"
              amount="-$67.50"
            />
            <ActivityCard
              activityType="withdrawal"
              username="System"
              description="Withdrawal to Bank"
              timestamp="Oct 15, 2026"
              amount="-$100.00"
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
