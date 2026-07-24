"use client"

import * as React from "react"
import { PublicLayout } from "@/components/layouts"
import { HeroBanner, SectionHeader, MarketFeed } from "@/components/parent"
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

export default function LandingPage() {
  return (
    <PublicLayout>
      <div className="flex flex-col gap-8 md:gap-12">
        <HeroBanner
          headline="Predict the Culture"
          description="Join the ultimate prediction market for entertainment, reality TV, and pop culture."
          actions={[
            {
              label: "Get Started",
              onClick: () => console.log("Navigate to Sign Up"),
              primary: true,
            },
            {
              label: "Explore Markets",
              onClick: () => console.log("Navigate to Markets"),
            },
          ]}
          imageUrl="/"
        />

        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Trending Markets"
            description="The most active markets right now."
            actionLabel="View All"
            onAction={() => console.log("Navigate to Markets")}
          />
          <MarketFeed
            markets={MOCK_MARKETS}
          />
        </section>
      </div>
    </PublicLayout>
  )
}
