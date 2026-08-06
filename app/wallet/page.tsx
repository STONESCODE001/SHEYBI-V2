"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layouts"
import { WalletCard, ActivityCard } from "@/components/parent"
import { useDialog } from "@/components/dialog"
import { useWallet } from "@/lib/hooks/use-wallet"
import { useLedger } from "@/lib/hooks/use-ledger"
import { History } from "lucide-react"

import { db } from "@/lib/instant"
import { verifyAndCreditDeposit } from "@/lib/actions/paystack-actions"

// Maps ledger eventType → ActivityCard activityType
function ledgerEventToActivityType(eventType: string): "deposit" | "withdrawal" | "trade" | "market_event" {
  if (eventType === "DEPOSIT") return "deposit"
  if (eventType === "WITHDRAWAL" || eventType === "WITHDRAWAL_REFUND") return "withdrawal"
  if (eventType === "SETTLEMENT_WIN") return "market_event"
  return "trade"
}

import { Suspense } from "react"
import { Loader2 } from "lucide-react"

// ... existing imports ...

function WalletPageContent() {
  const dialog = useDialog()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const { wallet, availableBalance, isLoading: walletLoading } = useWallet()
  const { entries, isLoading: ledgerLoading } = useLedger(20)

  // Handle fallback Paystack redirect verification
  React.useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref")
    if (reference) {
      const verifyRedirectPayment = async () => {
        try {
          // Clear URL to prevent re-verifying on refresh
          router.replace("/wallet", { scroll: false })
          
          const verifyResult = await verifyAndCreditDeposit(reference)
          if (verifyResult.success) {
            await dialog.success({
              title: "Deposit Successful",
              description: `₦${verifyResult.data?.depositAmount.toLocaleString()} added to your wallet.`
            })
            router.refresh()
          } else {
            await dialog.error({
              title: "Verification Pending",
              description: verifyResult.error ?? "We are confirming your payment."
            })
          }
        } catch (error) {
          console.error("Verification error:", error)
        }
      }
      verifyRedirectPayment()
    }
  }, [searchParams, router, dialog])

  const { data: withdrawalData } = db.useQuery({
    withdrawal_requests: {
      $: { order: { createdAt: "desc" } },
    },
  })
  const userWithdrawals = (withdrawalData as any)?.withdrawal_requests || []

  const formattedBalance = walletLoading
    ? "Loading..."
    : `₦${availableBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8 py-2">
      <div className="w-full">
        <WalletCard
          availableBalance={formattedBalance}
          status={wallet ? "Active" : "Loading"}
          onDeposit={() => dialog.open("wallet/deposit")}
          onWithdraw={() => dialog.open("wallet/withdraw")}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <History className="size-5 text-[var(--text-secondary)]" />
            <span>Transaction History</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm">
          {ledgerLoading ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">Loading transactions...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">No transactions yet.</p>
          ) : (
            entries.map((entry: any) => {
              let statusLabel = ""
              if (entry.eventType === "WITHDRAWAL") {
                const matched = userWithdrawals.find((w: any) => w.userId === entry.userId)
                const status = matched?.status?.toLowerCase()
                if (status === "approved" || status === "sent") {
                  statusLabel = " (Money Sent)"
                } else if (status === "rejected") {
                  statusLabel = " (Rejected & Refunded)"
                } else {
                  statusLabel = " (Pending Review)"
                }
              }

              // Determine whether transaction is a reduction (-) or addition (+)
              const isOutflow =
                entry.eventType === "WITHDRAWAL" ||
                entry.eventType === "WITHDRAWAL_FEE" ||
                entry.eventType === "BUY_POSITION" ||
                (entry.eventType === "TRADE" &&
                  (entry.description?.toLowerCase().includes("buy") || entry.amount < 0))

              const sign = isOutflow ? "-" : "+"
              const formattedAmount = `${sign}₦${Math.abs(entry.amount).toLocaleString("en-NG")}`

              return (
                <ActivityCard
                  key={entry.id}
                  activityType={ledgerEventToActivityType(entry.eventType)}
                  username={entry.eventType === "WITHDRAWAL_FEE" ? "FEE" : entry.eventType}
                  description={`${entry.description}${statusLabel}`}
                  timestamp={new Date(entry.createdAt).toLocaleString("en-NG")}
                  amount={formattedAmount}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function WalletPage() {
  return (
    <AuthenticatedLayout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }>
        <WalletPageContent />
      </Suspense>
    </AuthenticatedLayout>
  )
}
