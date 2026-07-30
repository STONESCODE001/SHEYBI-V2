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
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-muted)]">Platform Revenue</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Coins className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-emerald-400">
            {formatNaira(platformRevenue)}
          </span>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">3% withdrawal fees collected</span>
      </div>

      {/* STAT CARD 2: Total Seed Capital */}
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm transition-all hover:border-blue-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-muted)]">Total Seed Capital</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {formatNaira(totalSeedLiquidity)}
          </span>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">Injected across all markets</span>
      </div>

      {/* STAT CARD 3: Total Platform Funds */}
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm transition-all hover:border-[var(--accent-yellow)]/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-muted)]">Total User Funds</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {formatNaira(totalPlatformBalance)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--market-yes)]">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>Active wallet balances</span>
        </div>
      </div>

      {/* STAT CARD 4: Active Prediction Markets */}
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm transition-all hover:border-[var(--accent-yellow)]/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-muted)]">Active Markets</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
            <Store className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {activeMarketsCount}
          </span>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">Open & trading live</span>
      </div>

      {/* STAT CARD 5: Pending Withdrawal Requests */}
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm transition-all hover:border-[var(--accent-yellow)]/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-muted)]">Pending Payouts</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-yellow)]/10 text-[var(--accent-yellow)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {pendingWithdrawalsCount}
          </span>
        </div>
        <span className="text-xs text-[var(--accent-yellow)]">
          Total: {formatNaira(pendingWithdrawalsAmount)}
        </span>
      </div>

      {/* STAT CARD 6: User Market Suggestions */}
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm transition-all hover:border-[var(--accent-yellow)]/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-muted)]">Suggestions</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-trending-accent/10 text-trending-accent">
            <Lightbulb className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {pendingSuggestionsCount}
          </span>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">Community ideas</span>
      </div>
    </div>
  )
}
