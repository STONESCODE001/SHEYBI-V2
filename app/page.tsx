"use client"

import * as React from "react"
import { PublicLayout } from "@/components/layouts"
import { HeroBanner, CategoryTabs, MarketFeed } from "@/components/parent"
import { useMarkets } from "@/lib/hooks/use-markets"
import { useCategories } from "@/lib/hooks/use-categories"
import { adaptMarketToCardProps } from "@/lib/market-adapter"

export default function LandingPage() {
  const [activeTab, setActiveTab] = React.useState("all")

  const { categories: dbCategories } = useCategories()
  const { markets: dbMarkets, isLoading } = useMarkets({
    categorySlug: activeTab,
    state: "open",
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
    // Remove duplicate slugs if any
    const seen = new Set<string>()
    return [...defaultTabs, ...dbTabs].filter((t) => {
      if (seen.has(t.value)) return false
      seen.add(t.value)
      return true
    })
  }, [dbCategories])

  const displayedMarkets = React.useMemo(() => {
    if (isLoading) return []
    if (!dbMarkets || dbMarkets.length === 0) return []
    return dbMarkets.map(adaptMarketToCardProps)
  }, [dbMarkets, isLoading])

  return (
    <PublicLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        {/* Top Hero Banner with stacked headline typography & 3D mascot */}
        <HeroBanner mascotUrl="/sheybi-mascot.png" />

        {/* Category Filter Tabs dynamically populated from InstantDB */}
        <CategoryTabs
          categories={categoriesTabs}
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
