"use client"

import * as React from "react"
import { PublicLayout } from "@/components/layouts"
import { HeroBanner, CategoryTabs, MarketFeed } from "@/components/parent"
import { MOCK_8_MARKETS } from "@/lib/mock-markets"
import { useMarkets } from "@/lib/hooks/use-markets"
import { adaptMarketToCardProps } from "@/lib/market-adapter"

export default function LandingPage() {
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
    <PublicLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        {/* Top Hero Banner with stacked headline typography & 3D mascot */}
        <HeroBanner mascotUrl="/sheybi-mascot.png" />

        {/* Category Filter Tabs */}
        <CategoryTabs
          activeCategory={activeTab}
          onCategoryChange={setActiveTab}
        />

        {/* Market Feed Grid */}
        <section className="flex flex-col gap-4">
          <MarketFeed markets={displayedMarkets} activeCategory={activeTab} loading={isLoading} />
        </section>
      </div>
    </PublicLayout>
  )
}
