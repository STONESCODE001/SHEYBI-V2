"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { PortfolioCard, StatisticCard } from "@/components/parent"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Briefcase, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = React.useState("open")

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-5xl flex flex-col gap-8 py-2">

        {/* Portfolio Value Summary Card */}
        <div className="w-full">
          <PortfolioCard
            totalValue="₦140,000.00"
            profitLoss="₦15,000.00"
            isProfit={true}
            percentageChange={12.0}
            status="Active"
          />
        </div>

        {/* Positions & Trades Section - Stacked Layout */}
        <div className="flex flex-col gap-4 w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-4">
            <TabsList className="bg-[var(--bg-surface-secondary)] border border-[var(--border-default)] p-1 rounded-xl w-full flex justify-start overflow-x-auto">
              <TabsTrigger value="open" className="rounded-lg font-semibold text-xs sm:text-sm px-4">
                Open Positions (4)
              </TabsTrigger>
              <TabsTrigger value="closed" className="rounded-lg font-semibold text-xs sm:text-sm px-4">
                Closed Positions (12)
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg font-semibold text-xs sm:text-sm px-4">
                Trade History
              </TabsTrigger>
            </TabsList>

            {/* Open Positions Tab Content */}
            <TabsContent value="open" className="mt-4 flex flex-col gap-4">
              {/* Position Card 1 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm hover:border-primary/30 transition-all duration-200">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-success-soft text-success border-success/20 font-bold">
                      YES Position
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)]">BBNaija • 50 Shares</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Who will win BBNaija Season 10?
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
                    <span>Avg Price: <strong className="text-[var(--text-primary)]">₦500.00</strong></span>
                    <span>Current Price: <strong className="text-success">₦650.00</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[var(--border-default)]">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-[var(--text-muted)]">Current Value</span>
                    <div className="text-base font-bold font-mono text-[var(--text-primary)]">₦32,500.00</div>
                    <div className="text-xs font-bold text-success flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="size-3.5" /> +₦7,500.00 (+30.0%)
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-danger text-danger hover:bg-danger/10">
                    Sell Position
                  </Button>
                </div>
              </div>

              {/* Position Card 2 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm hover:border-primary/30 transition-all duration-200">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-danger-soft text-danger border-danger/20 font-bold">
                      NO Position
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)]">Entertainment • 20 Shares</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Will Wizkid release an album before December 2026?
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
                    <span>Avg Price: <strong className="text-[var(--text-primary)]">₦1,000.00</strong></span>
                    <span>Current Price: <strong className="text-danger">₦850.00</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[var(--border-default)]">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-[var(--text-muted)]">Current Value</span>
                    <div className="text-base font-bold font-mono text-[var(--text-primary)]">₦17,000.00</div>
                    <div className="text-xs font-bold text-danger flex items-center justify-end gap-0.5">
                      <ArrowDownRight className="size-3.5" /> -₦3,000.00 (-15.0%)
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-danger text-danger hover:bg-danger/10">
                    Sell Position
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Closed Positions Tab Content */}
            <TabsContent value="closed" className="mt-4 flex flex-col gap-3">
              <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Head of House Week 4 Winner</h4>
                  <span className="text-xs text-success font-semibold">Resolved WON • Payout ₦45,000.00</span>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-none font-bold">
                  +₦15,000 Profit
                </Badge>
              </div>
            </TabsContent>

            {/* Trade History Tab Content */}
            <TabsContent value="history" className="mt-4 flex flex-col gap-3">
              <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Bought 50 YES Shares</div>
                  <div className="text-xs text-[var(--text-muted)]">Who will win BBNaija Season 10?</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-[var(--text-primary)]">₦25,000.00</div>
                  <div className="text-xs text-[var(--text-muted)]">Jul 22, 2026</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
