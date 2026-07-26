"use client"

import * as React from "react"
import { PublicLayout } from "@/components/layouts"
import { HeroBanner, CategoryTabs, MarketFeed } from "@/components/parent"
import { MOCK_8_MARKETS } from "@/lib/mock-markets"

export default function LandingPage() {
  const [activeTab, setActiveTab] = React.useState("trending")

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
          <MarketFeed markets={MOCK_8_MARKETS} activeCategory={activeTab} />
        </section>
      </div>
    </PublicLayout>
  )
}

