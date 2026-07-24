"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { SectionHeader, StatisticCard, TradePanel, ActivityCard } from "@/components/parent"
import { useDialog } from "@/components/dialog"

export default function MarketDetailPage() {
  const dialog = useDialog()
  const marketTitle = "Will the Central Bank lower interest rates in the next quarter?"

  // Interactive Trade Panel states
  const [mode, setMode] = React.useState<"buy" | "sell">("buy")
  const [selectedOutcome, setSelectedOutcome] = React.useState<"yes" | "no">("yes")
  const [amount, setAmount] = React.useState("")

  // Calculate dynamic trade preview details
  const parsedAmount = parseFloat(amount) || 0
  const yesPrice = 0.45
  const noPrice = 0.55
  const probability = selectedOutcome === "yes" ? "45%" : "55%"
  const price = selectedOutcome === "yes" ? yesPrice : noPrice

  const estimatedShares = parsedAmount > 0 ? (parsedAmount / price).toFixed(0) : "0"
  const tradingFee = parsedAmount > 0 ? `₦${(parsedAmount * 0.02).toFixed(2)}` : "₦0.00"
  const totalCost = parsedAmount > 0 ? `₦${(parsedAmount * 1.02).toFixed(2)}` : "₦0.00"
  const canTrade = parsedAmount >= 100 && !!selectedOutcome

  const handleShare = () => {
    dialog.open("market/share", {
      marketTitle,
    })
  }

  const handleTrade = () => {
    if (!canTrade) return
    dialog.open("trade/confirm", {
      marketTitle,
      outcome: selectedOutcome,
      amount,
      probability,
      estimatedShares,
      tradingFee,
      totalCost,
      isBuy: mode === "buy"
    })
  }

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex flex-1 flex-col gap-6">
          <SectionHeader
            title={marketTitle}
            description="Market resolves on Dec 31, 2026. Data sourced from official publications."
            actionLabel="Share"
            onAction={handleShare}
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatisticCard label="Volume" value="₦1.2M" />
            <StatisticCard label="Traders" value="1,245" />
            <StatisticCard label="Liquidity" value="₦450K" />
            <StatisticCard label="Your Position" value="-" />
          </div>

          <div className="h-64 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] flex items-center justify-center text-sm text-[var(--text-muted)]">
            Chart Placeholder
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h3>
            <ActivityCard
              activityType="trade"
              username="User123"
              description="bought Yes at 45¢"
              timestamp="2 mins ago"
              amount="₦150.00"
            />
            <ActivityCard
              activityType="trade"
              username="TraderBob"
              description="bought No at 55¢"
              timestamp="5 mins ago"
              amount="₦420.00"
            />
            <ActivityCard
              activityType="market_event"
              username="System"
              description="Market terms updated"
              timestamp="1 day ago"
            />
          </div>
        </div>

        <div className="w-full lg:w-[360px] lg:shrink-0">
          <TradePanel
            mode={mode}
            onModeChange={setMode}
            outcomes={["yes", "no"]}
            selectedOutcome={selectedOutcome}
            onOutcomeSelect={(o) => setSelectedOutcome(o as "yes" | "no")}
            amount={amount}
            onAmountChange={setAmount}
            currentProbability={probability}
            estimatedShares={estimatedShares}
            tradingFee={tradingFee}
            totalCost={totalCost}
            canTrade={canTrade}
            onTrade={handleTrade}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
