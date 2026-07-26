"use client"

import * as React from "react"
import { AuthenticatedLayout } from "@/components/layouts"
import { CategoryTabs, MarketFeed } from "@/components/parent"
const MOCK_MARKETS: any[] = [
  {
    id: "1",
    title: "Placeholder Market",
    category: "Entertainment",
    status: "active",
    yesProbability: 45,
    noProbability: 55,
    volume: "₦1.2M",
    traders: "1.2k",
    outcomes: [
      { id: "yes", label: "Yes", currentPrice: 0.45, color: "var(--success)" },
      { id: "no", label: "No", currentPrice: 0.55, color: "var(--danger)" },
    ],
  },
  {
    id: "2",
    title: "Another Market",
    category: "Sports",
    status: "active",
    yesProbability: 75,
    noProbability: 25,
    volume: "₦850K",
    traders: "840",
    outcomes: [
      { id: "yes", label: "Yes", currentPrice: 0.75, color: "var(--success)" },
      { id: "no", label: "No", currentPrice: 0.25, color: "var(--danger)" },
    ],
  },
]

export default function MarketsPage() {
  const [activeTab, setActiveTab] = React.useState("all")

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-6">
        <CategoryTabs
          categories={[
            { value: "all", label: "All Markets" },
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
    </AuthenticatedLayout>
  )
}
