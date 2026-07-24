"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { PortfolioCard, StatisticCard, ActivityCard } from "@/components/parent"

export default function PortfolioPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex-1">
            <PortfolioCard
              totalValue="$1,245.50"
              profitLoss="$45.20"
              isProfit={true}
              percentageChange={3.8}
              status="Active"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:w-1/3 md:grid-cols-1 lg:w-1/4">
            <StatisticCard label="Open Positions" value="12" />
            <StatisticCard label="Win Rate" value="64%" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Active Positions</h2>
          <div className="flex flex-col gap-4">
            <ActivityCard
              activityType="trade"
              username="Market"
              description="Will the Central Bank lower interest rates? You hold 150 YES shares"
              amount="$67.50"
              timestamp="Current Value: $75.00 (+11.1%)"
            />
            <ActivityCard
              activityType="trade"
              username="Market"
              description="Next Reality TV Winner. You hold 50 NO shares"
              amount="$30.00"
              timestamp="Current Value: $25.00 (-16.6%)"
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
