"use client"

import * as React from "react"
import { PublicLayout } from "@/components/layouts"
import { HeroBanner, SectionHeader, MarketFeed } from "@/components/parent"
import { MOCK_8_MARKETS } from "@/lib/mock-markets"

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
            markets={MOCK_8_MARKETS}
          />
        </section>
      </div>
    </PublicLayout>
  )
}
