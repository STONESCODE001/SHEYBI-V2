import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatisticDisplay } from "@/components/child/statistic-display"

interface WalletCardProps extends React.ComponentProps<"div"> {
  /** Available balance in Naira. */
  readonly availableBalance: string
  /** Locked balance in Naira. */
  readonly lockedBalance?: string
  /** Portfolio value in Naira. */
  readonly portfolioValue?: string
  /** Wallet status text. */
  readonly status?: string
  /** Whether the card is in a loading state. */
  readonly loading?: boolean
  /** Deposit button click handler. */
  readonly onDeposit?: () => void
  /** Withdraw button click handler. */
  readonly onWithdraw?: () => void
}

function WalletCardSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <Card
      className={cn(
        "w-full rounded-2xl border-[var(--border-default)] bg-[var(--bg-surface)] p-5",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
        <div className="flex gap-6">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="h-5 w-28 rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 flex-1 rounded-xl" />
        </div>
      </div>
    </Card>
  )
}

function WalletCard({
  availableBalance,
  lockedBalance,
  portfolioValue,
  status,
  loading = false,
  onDeposit,
  onWithdraw,
  className,
  ...props
}: WalletCardProps): React.ReactElement {
  if (loading) {
    return <WalletCardSkeleton className={className} />
  }

  return (
    <div
      data-slot="wallet-card"
      className={cn(
        "w-full rounded-2xl",
        "border border-[var(--border-default)] bg-[var(--bg-surface)]",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        "p-5 transition-colors duration-200",
        "hover:bg-[var(--bg-hover)]",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold leading-7 text-[var(--text-primary)]">
          Wallet
        </h3>
        {status && (
          <Badge variant="secondary" className="rounded-md text-xs">
            {status}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        {/* Single primary balance */}
        <div aria-label="Available Balance">
          <span className="text-sm text-[var(--text-muted)]">Available Balance</span>
          <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-[var(--text-primary)]">
            {availableBalance}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex gap-3">
        <Button
          variant="default"
          size="lg"
          className="min-h-11 flex-1 rounded-xl"
          onClick={onDeposit}
        >
          Deposit
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="min-h-11 flex-1 rounded-xl"
          onClick={onWithdraw}
        >
          Withdraw
        </Button>
      </div>
    </div>
  )
}

export { WalletCard, WalletCardSkeleton }
export type { WalletCardProps }
