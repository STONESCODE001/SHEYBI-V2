"use client"

import * as React from "react"
import { Wallet, Store, ArrowUpRight, Lightbulb, ShieldCheck } from "lucide-react"

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
}

/**
 * Explanatory Component: AdminSummaryCards
 * Renders sleek, high-level numerical KPI stat cards for platform operators.
 * Gives instant visibility into platform financial health and operational queues.
 */
export function AdminSummaryCards({
  totalPlatformBalance = 14850000,
  activeMarketsCount = 18,
  pendingWithdrawalsCount = 5,
  pendingWithdrawalsAmount = 345000,
  pendingSuggestionsCount = 12,
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 
        STAT CARD 1: Total Platform Funds
        What it means: Total liquidity across user wallets and house balance.
      */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-subtle p-4 shadow-sm transition-all hover:border-primary/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Total Platform Funds</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            {formatNaira(totalPlatformBalance)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-success">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>Calculated live from active wallets</span>
        </div>
      </div>

      {/* 
        STAT CARD 2: Active Prediction Markets
        What it means: Number of live markets currently open for user predictions.
      */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-subtle p-4 shadow-sm transition-all hover:border-primary/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Active Markets</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
            <Store className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            {activeMarketsCount}
          </span>
        </div>
        <span className="text-xs text-text-secondary">Open & trading live</span>
      </div>

      {/* 
        STAT CARD 3: Pending Withdrawal Requests
        What it means: Payout requests submitted by users that need admin approval.
      */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-subtle p-4 shadow-sm transition-all hover:border-primary/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Pending Withdrawals</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            {pendingWithdrawalsCount}
          </span>
        </div>
        <span className="text-xs text-warning">
          Total: {formatNaira(pendingWithdrawalsAmount)} awaiting review
        </span>
      </div>

      {/* 
        STAT CARD 4: User Market Suggestions
        What it means: Ideas submitted by platform users awaiting admin review & publishing.
      */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-subtle p-4 shadow-sm transition-all hover:border-primary/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Pending Suggestions</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-trending-accent/10 text-trending-accent">
            <Lightbulb className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            {pendingSuggestionsCount}
          </span>
        </div>
        <span className="text-xs text-text-secondary">Community market ideas</span>
      </div>
    </div>
  )
}
