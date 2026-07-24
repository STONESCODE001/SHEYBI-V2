"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { HeroBanner, CategoryTabs, MarketFeed } from "@/components/parent"
const MOCK_MARKETS: any[] = [
  {
    title: "Placeholder Market",
    category: "Entertainment",
    status: "active",
    outcomes: [
      { id: "yes", label: "Yes", currentPrice: 0.45, color: "var(--success)" },
      { id: "no", label: "No", currentPrice: 0.55, color: "var(--danger)" },
    ],
  },
  {
    title: "Another Market",
    category: "Sports",
    status: "active",
    outcomes: [
      { id: "yes", label: "Yes", currentPrice: 0.75, color: "var(--success)" },
      { id: "no", label: "No", currentPrice: 0.25, color: "var(--danger)" },
    ],
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState("trending")

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-8 md:gap-10">
        <HeroBanner
          headline="Welcome to Sheybi"
          description="Discover new markets, track your predictions, and climb the leaderboard."
          actions={[
            {
              label: "Explore Markets",
              onClick: () => console.log("Navigate to markets"),
              primary: true,
            },
          ]}
        />

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
            markets={MOCK_MARKETS}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
