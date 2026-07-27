"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { HeroBanner, CategoryTabs, MarketFeed } from "@/components/parent"
import { MOCK_8_MARKETS } from "@/lib/mock-markets"
import { useMarkets } from "@/lib/hooks/use-markets"
import { adaptMarketToCardProps } from "@/lib/market-adapter"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState("trending")

  const { markets: dbMarkets, isLoading } = useMarkets({
    categorySlug: activeTab,
    state: "open",
  })

  const displayedMarkets = React.useMemo(() => {
    if (isLoading) return MOCK_8_MARKETS
    if (dbMarkets && dbMarkets.length > 0) {
      return dbMarkets.map(adaptMarketToCardProps)
    }
    return MOCK_8_MARKETS
  }, [dbMarkets, isLoading])

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-8 md:gap-10">
        <HeroBanner />

        <div className="flex flex-col gap-6">
          <CategoryTabs
            categories={[
              { value: "trending", label: "Trending", count: dbMarkets.length || 12 },
              { value: "weekly", label: "Weekly", count: 8 },
              { value: "hoh", label: "HOH" },
              { value: "entertainment", label: "Entertainment" },
            ]}
            activeCategory={activeTab}
            onCategoryChange={setActiveTab}
          />

          <MarketFeed
            markets={displayedMarkets}
            activeCategory={activeTab}
            loading={isLoading}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
