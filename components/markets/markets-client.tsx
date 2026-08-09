"use client"

import * as React from "react"
import { PublicLayout } from "@/components/layouts"
import { CategoryTabs, MarketFeed } from "@/components/parent"
import { useMarkets } from "@/lib/hooks/use-markets"
import { useCategories } from "@/lib/hooks/use-categories"
import { adaptMarketToCardProps } from "@/lib/market-adapter"

export function MarketsClient() {
  const [activeTab, setActiveTab] = React.useState("all")

  const { categories: dbCategories } = useCategories()
  const { markets: dbMarkets, isLoading } = useMarkets({
    state: activeTab === "all" ? undefined : "open",
    categorySlug: activeTab,
  })

  const categoriesTabs = React.useMemo(() => {
    const defaultTabs = [
      { value: "all", label: "All Markets" },
      { value: "trending", label: "Trending" },
    ]
    const dbTabs = (dbCategories || []).map((c) => ({
      value: c.slug,
      label: c.name,
    }))
    const seen = new Set<string>()
    return [...defaultTabs, ...dbTabs].filter((t) => {
      if (seen.has(t.value)) return false
      seen.add(t.value)
      return true
    })
  }, [dbCategories])

  const displayedMarkets = React.useMemo(() => {
    if (!dbMarkets || dbMarkets.length === 0) return []
    return dbMarkets.map(adaptMarketToCardProps)
  }, [dbMarkets])

  return (
    <PublicLayout>
      <div className="flex flex-col gap-6">
        <CategoryTabs
          categories={categoriesTabs}
          activeCategory={activeTab}
          onCategoryChange={setActiveTab}
        />
        <MarketFeed
          markets={displayedMarkets}
          activeCategory={activeTab}
          loading={isLoading}
          skeletonCount={6}
        />
      </div>
    </PublicLayout>
  )
}
