import * as React from "react"
import { Wallet, Store, ArrowUpRight, Lightbulb, ShieldCheck, Coins, Layers } from "lucide-react"

/**
 * Explanatory Interface: AdminSummaryCardsProps
 * Defines the numerical and monetary metrics displayed at the top of the Admin Dashboard.
 */
export interface AdminSummaryCardsProps {
  /** Total funds currently held on the platform in Nigerian Naira (₦), calculated from active wallets */
  totalPlatformBalance: number
  /** Number of live/active prediction markets currently open for trading */
  activeMarketsCount: number
  /** Number of pending withdrawal requests awaiting operator review */
  pendingWithdrawalsCount: number
  /** Total value of pending withdrawals in Nigerian Naira (₦) */
  pendingWithdrawalsAmount: number
  /** Number of user-submitted market suggestions awaiting review */
  pendingSuggestionsCount: number
  /** Total earnings/revenue collected by the platform from withdrawal fees in ₦ */
  platformRevenue?: number
  /** Total seed capital (liquidity) injected across all markets in ₦ */
  totalSeedLiquidity?: number
}

/**
 * Explanatory Component: AdminSummaryCards
 * Renders sleek, high-level numerical KPI stat cards for platform operators.
 * Gives instant visibility into platform financial health, earnings, and operational queues.
 */
export function AdminSummaryCards({
  totalPlatformBalance = 0,
  activeMarketsCount = 0,
  pendingWithdrawalsCount = 0,
  pendingWithdrawalsAmount = 0,
  pendingSuggestionsCount = 0,
  platformRevenue = 0,
  totalSeedLiquidity = 0,
}: Partial<AdminSummaryCardsProps>) {
  /** Helper function to format numbers cleanly into Nigerian Naira currency strings (₦) */
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* STAT CARD 1: Platform Revenue / Earnings */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg-surface p-4 shadow-sm transition-all hover:border-primary/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted">Platform Revenue</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft text-success">
            <Coins className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-extrabold tracking-tight text-success">
            {formatNaira(platformRevenue)}
          </span>
        </div>
        <span className="text-xs text-text-secondary">User fees collected</span>
      </div>

      {/* STAT CARD 2: Total Seed Capital */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg-surface p-4 shadow-sm transition-all hover:border-primary/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted">Total Seed Capital</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-extrabold tracking-tight text-text-primary">
            {formatNaira(totalSeedLiquidity)}
          </span>
        </div>
        <span className="text-xs text-text-secondary">Liquidity across markets</span>
      </div>

      {/* STAT CARD 3: Total Platform Funds */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg-surface p-4 shadow-sm transition-all hover:border-primary/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted">Total User Funds</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-extrabold tracking-tight text-text-primary">
            {formatNaira(totalPlatformBalance)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-success font-semibold">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>Active trading volume</span>
        </div>
      </div>

      {/* STAT CARD 4: Active Prediction Markets */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg-surface p-4 shadow-sm transition-all hover:border-primary/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted">Active Markets</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
            <Store className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-extrabold tracking-tight text-text-primary">
            {activeMarketsCount}
          </span>
        </div>
        <span className="text-xs text-text-secondary">Open & trading live</span>
      </div>

      {/* STAT CARD 5: Pending Withdrawal Requests */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg-surface p-4 shadow-sm transition-all hover:border-warning/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted">Pending Payouts</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-extrabold tracking-tight text-text-primary">
            {pendingWithdrawalsCount}
          </span>
        </div>
        <span className="text-xs font-bold text-warning">
          Total: {formatNaira(pendingWithdrawalsAmount)}
        </span>
      </div>

      {/* STAT CARD 6: User Market Suggestions */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg-surface p-4 shadow-sm transition-all hover:border-primary/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-muted">Suggestions</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-trending-accent/10 text-trending-accent">
            <Lightbulb className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-extrabold tracking-tight text-text-primary">
            {pendingSuggestionsCount}
          </span>
        </div>
        <span className="text-xs text-text-secondary">Community ideas</span>
      </div>
    </div>
  )
}
