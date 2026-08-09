"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { PortfolioCard } from "@/components/parent"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ActivityItemSkeleton } from "@/components/ui/skeletons"
import { usePositions } from "@/lib/hooks/use-positions"
import { useLedger } from "@/lib/hooks/use-ledger"
import { useDialog } from "@/components/dialog"
import { sellPositionAction } from "@/lib/actions/trade-actions"
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"

export function PortfolioClient() {
  const dialog = useDialog()
  const [activeTab, setActiveTab] = React.useState("open")
  const [sellingPositionId, setSellingPositionId] = React.useState<string | null>(null)

  const { openPositions, closedPositions, isLoading: positionsLoading } = usePositions()
  const { entries: ledgerEntries, isLoading: ledgerLoading } = useLedger(50)

  const tradeHistoryEntries = ledgerEntries.filter(
    (e: any) => e.eventType === "TRADE_BUY" || e.eventType === "TRADE_SELL"
  )

  // Calculate Total Portfolio Value & Total PnL
  let totalValue = 0
  let totalInvested = 0

  openPositions.forEach((pos: any) => {
    const market = pos.market
    const options = market?.options || []
    const option = options.find((o: any) => o.id === pos.optionId)
    const currentPrice = option?.sharePrice ?? pos.averageEntryPrice ?? 0.5
    const posCurrentValue = pos.sharesOwned * currentPrice

    totalValue += posCurrentValue
    totalInvested += pos.investedAmount || 0
  })

  const profitLoss = totalValue - totalInvested
  const isProfit = profitLoss >= 0
  const percentageChange = totalInvested > 0 ? (Math.abs(profitLoss) / totalInvested) * 100 : 0

  // Sell Position Handler
  const handleSellPosition = async (pos: any) => {
    try {
      const confirmSell = await dialog.confirm({
        title: "Sell Position",
        description: `Are you sure you want to sell your ${Math.round(pos.sharesOwned).toLocaleString()} shares in "${pos.market?.title}"?`
      })

      if (!confirmSell) return

      setSellingPositionId(pos.id)

      const idempotencyKey = `sell_${pos.id}_${Date.now()}`
      const result = await sellPositionAction(
        pos.marketId,
        pos.optionId,
        pos.sharesOwned,
        idempotencyKey
      )

      setSellingPositionId(null)

      if (!result.success) {
        await dialog.error({
          title: "Sale Failed",
          description: result.error ?? "Failed to sell position."
        })
        return
      }

      await dialog.success({
        title: "Position Sold",
        description: `Successfully sold position! ₦${result.data?.netProceeds.toLocaleString()} credited to your wallet.`
      })
    } catch (err) {
      setSellingPositionId(null)
      const msg = err instanceof Error ? err.message : "Failed to execute sale."
      await dialog.error({
        title: "Error",
        description: msg
      })
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-5xl flex flex-col gap-8 py-2">

        {/* Portfolio Value Summary Card */}
        <div className="w-full">
          <PortfolioCard
            totalValue={`₦${totalValue.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
            profitLoss={`${isProfit ? "+" : "-"}₦${Math.abs(profitLoss).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
            isProfit={isProfit}
            percentageChange={parseFloat(percentageChange.toFixed(1))}
            status="Active"
          />
        </div>

        {/* Positions & Trades Section */}
        <div className="flex flex-col gap-4 w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-4">
            <TabsList className="bg-[var(--bg-surface-secondary)] border border-[var(--border-default)] p-1 rounded-xl w-full flex justify-start overflow-x-auto">
              <TabsTrigger value="open" className="rounded-lg font-semibold text-xs sm:text-sm px-4">
                Open Positions ({openPositions.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="rounded-lg font-semibold text-xs sm:text-sm px-4">
                Closed Positions ({closedPositions.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg font-semibold text-xs sm:text-sm px-4">
                Trade History ({tradeHistoryEntries.length})
              </TabsTrigger>
            </TabsList>

            {/* Open Positions Tab Content */}
            <TabsContent value="open" className="mt-4 flex flex-col gap-4">
              {positionsLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ActivityItemSkeleton key={i} />
                  ))}
                </div>
              ) : openPositions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-muted)]">
                  You have no active open positions yet. Place a trade on any prediction market to build your portfolio!
                </div>
              ) : (
                openPositions.map((pos: any) => {
                  const market = pos.market
                  const options = market?.options || []
                  const option = options.find((o: any) => o.id === pos.optionId)
                  const optionName = option?.name ?? "Outcome"
                  const currentPrice = option?.sharePrice ?? pos.averageEntryPrice ?? 0.5
                  const currentValue = pos.sharesOwned * currentPrice
                  const posPnL = currentValue - pos.investedAmount
                  const posIsProfit = posPnL >= 0
                  const posPct = pos.investedAmount > 0 ? (Math.abs(posPnL) / pos.investedAmount) * 100 : 0
                  const isSelling = sellingPositionId === pos.id

                  return (
                    <div
                      key={pos.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              optionName.toUpperCase() === "NO"
                                ? "bg-danger-soft text-danger border-danger/20 font-bold"
                                : "bg-success-soft text-success border-success/20 font-bold"
                            }
                          >
                            {optionName} Position
                          </Badge>
                          <span className="text-xs text-[var(--text-muted)]">
                            {Math.round(pos.sharesOwned).toLocaleString()} Shares
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[var(--text-primary)]">
                          {market?.title || "Prediction Market"}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
                          <span>
                            Invested: <strong className="text-[var(--text-primary)]">₦{pos.investedAmount.toLocaleString()}</strong>
                          </span>
                          <span>
                            Avg Entry: <strong className="text-[var(--text-primary)]">₦{pos.averageEntryPrice.toFixed(2)}</strong>
                          </span>
                          <span>
                            Current Price: <strong className={posIsProfit ? "text-success" : "text-danger"}>₦{currentPrice.toFixed(2)}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[var(--border-default)]">
                        <div className="text-left md:text-right">
                          <span className="text-xs text-[var(--text-muted)]">Current Value</span>
                          <div className="text-base font-bold font-mono text-[var(--text-primary)]">
                            ₦{currentValue.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                          </div>
                          <div
                            className={`text-xs font-bold flex items-center justify-end gap-0.5 ${
                              posIsProfit ? "text-success" : "text-danger"
                            }`}
                          >
                            {posIsProfit ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                            {posIsProfit ? "+" : "-"}₦{Math.abs(posPnL).toLocaleString("en-NG", { minimumFractionDigits: 2 })} ({posPct.toFixed(1)}%)
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSelling}
                          onClick={() => handleSellPosition(pos)}
                          className="rounded-xl text-xs font-bold border-danger text-danger hover:bg-danger/10"
                        >
                          {isSelling ? <Loader2 className="size-3.5 animate-spin" /> : "Sell Position"}
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </TabsContent>

            {/* Closed Positions Tab Content */}
            <TabsContent value="closed" className="mt-4 flex flex-col gap-3">
              {positionsLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ActivityItemSkeleton key={i} />
                  ))}
                </div>
              ) : closedPositions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-muted)]">
                  No closed or resolved positions yet.
                </div>
              ) : (
                closedPositions.map((pos: any) => {
                  const pnl = pos.realizedProfitLoss ?? 0
                  const isWin = pnl >= 0

                  return (
                    <div
                      key={pos.id}
                      className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {pos.market?.title || "Market Position"}
                        </h4>
                        <span className={`text-xs font-semibold ${isWin ? "text-success" : "text-danger"}`}>
                          State: {pos.state.toUpperCase()} • Invested ₦{pos.investedAmount.toLocaleString()}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          isWin
                            ? "bg-success/10 text-success border-none font-bold"
                            : "bg-danger/10 text-danger border-none font-bold"
                        }
                      >
                        {isWin ? "+" : "-"}₦{Math.abs(pnl).toLocaleString()}
                      </Badge>
                    </div>
                  )
                })
              )}
            </TabsContent>

            {/* Trade History Tab Content */}
            <TabsContent value="history" className="mt-4 flex flex-col gap-3">
              {ledgerLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ActivityItemSkeleton key={i} />
                  ))}
                </div>
              ) : tradeHistoryEntries.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-muted)]">
                  No completed trade transactions found in ledger.
                </div>
              ) : (
                tradeHistoryEntries.map((entry: any) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {entry.eventType === "TRADE_BUY" ? "Bought Option Shares" : "Sold Option Shares"}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{entry.description}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-[var(--text-primary)]">
                        ₦{Math.abs(entry.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {new Date(entry.createdAt).toLocaleDateString("en-NG")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
