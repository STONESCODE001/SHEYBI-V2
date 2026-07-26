"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { HeroBanner, CategoryTabs, MarketFeed } from "@/components/parent"
import { MOCK_8_MARKETS } from "@/lib/mock-markets"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState("trending")

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-8 md:gap-10">
        <HeroBanner />

        <div className="flex flex-col gap-6">
          <CategoryTabs
            categories={[
              { value: "trending", label: "Trending", count: 12 },
              { value: "new", label: "New", count: 8 },
              { value: "sports", label: "Sports" },
              { value: "entertainment", label: "Entertainment" },
              { value: "politics", label: "Politics" },
            ]}
            activeCategory={activeTab}
            onCategoryChange={setActiveTab}
          />

          <MarketFeed
            markets={MOCK_8_MARKETS}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
