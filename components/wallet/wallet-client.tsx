"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { AuthenticatedLayout } from "@/components/layouts"
import { WalletCard, ActivityCard } from "@/components/parent"
import { WalletCardSkeleton, ActivityItemSkeleton } from "@/components/ui/skeletons"
import { useDialog } from "@/components/dialog"
import { useWallet } from "@/lib/hooks/use-wallet"
import { useLedger } from "@/lib/hooks/use-ledger"
import { useKyc } from "@/lib/hooks/use-kyc"
import { History, Loader2 } from "lucide-react"
import { db } from "@/lib/instant"
import { verifyAndCreditDeposit } from "@/lib/actions/paystack-actions"

// Maps ledger eventType → ActivityCard activityType
function ledgerEventToActivityType(eventType: string): "deposit" | "withdrawal" | "trade" | "market_event" {
  if (eventType === "DEPOSIT") return "deposit"
  if (eventType === "WITHDRAWAL" || eventType === "WITHDRAWAL_REFUND") return "withdrawal"
  if (eventType === "SETTLEMENT_WIN") return "market_event"
  return "trade"
}

export function WalletClientContent() {
  const dialog = useDialog()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()

  const { wallet, availableBalance, isLoading: walletLoading } = useWallet()
  const { entries, isLoading: ledgerLoading } = useLedger(20)
  const { kycStatus } = useKyc()

  const processedRef = React.useRef<string | null>(null)

  // Handle fallback Paystack redirect verification
  React.useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref")
    if (reference && processedRef.current !== reference) {
      processedRef.current = reference

      const verifyRedirectPayment = async () => {
        try {
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

  // Explicit userId filter matching authenticated Clerk user ID
  const { data: withdrawalData } = db.useQuery(
    user?.id
      ? {
          withdrawal_requests: {
            $: {
              where: { userId: user.id },
              order: { createdAt: "desc" },
            },
          },
        }
      : null
  )
  const userWithdrawals = (withdrawalData as any)?.withdrawal_requests || []

  const formattedBalance = `₦${availableBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`

  // Map KYC status to wallet card badge text
  const walletBadgeStatus =
    kycStatus === "approved"
      ? "Active"
      : kycStatus === "pending"
      ? "Pending KYC"
      : kycStatus === "rejected"
      ? "KYC Rejected"
      : "Unverified"

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8 py-2">
      {/* Wallet Card */}
      <div className="w-full">
        {walletLoading ? (
          <WalletCardSkeleton />
        ) : (
          <WalletCard
            availableBalance={formattedBalance}
            status={walletBadgeStatus}
            onDeposit={() => dialog.open("wallet/deposit")}
            onWithdraw={() => {
              if (kycStatus !== "approved") {
                dialog.open("profile/kyc")
                return
              }
              dialog.open("wallet/withdraw")
            }}
          />
        )}
      </div>

      {/* Transaction History Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <History className="size-5 text-[var(--text-secondary)]" />
            <span>Transaction History</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm">
          {ledgerLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <ActivityItemSkeleton key={i} />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">No transactions yet.</p>
          ) : (
            entries.map((entry: any) => {
              let statusLabel = ""
              if (entry.eventType === "WITHDRAWAL") {
                const matched = userWithdrawals.find((w: any) => w.id === entry.referenceId || w.userId === entry.userId)
                const status = matched?.status?.toLowerCase()
                if (status === "approved" || status === "sent") {
                  statusLabel = " (Money Sent)"
                } else if (status === "rejected") {
                  statusLabel = " (Rejected & Refunded)"
                } else {
                  statusLabel = " (Pending Review)"
                }
              }

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

export function WalletClient() {
  return (
    <AuthenticatedLayout>
      <Suspense
        fallback={
          <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8">
            <WalletCardSkeleton />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <ActivityItemSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <WalletClientContent />
      </Suspense>
    </AuthenticatedLayout>
  )
}
