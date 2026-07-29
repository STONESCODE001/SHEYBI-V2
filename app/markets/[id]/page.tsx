"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layouts"
import { db } from "@/lib/instant"
import {
  BinaryMarketView,
  VersusMarketView,
  MultiOptionMarketView,
} from "@/components/parent/market-details"
import {
  adaptToBinaryMarketData,
  adaptToVersusMarketData,
  adaptToMultiOptionMarketData,
} from "@/lib/market-adapter"

export default function MarketDetailPage() {
  const params = useParams()
  const marketId = params?.id as string

  // Live query — fetches markets with options & category in real-time
  const { isLoading, error, data } = db.useQuery({
    markets: {
      options: {},
      category: {},
    },
  })

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[400px] text-[var(--text-muted)]">
          Loading market...
        </div>
      </AuthenticatedLayout>
    )
  }

  const allMarkets = (data as any)?.markets || []
  const market = allMarkets.find((m: any) => m.id === marketId || m.slug === marketId)

  if (error || !market) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[400px] text-[var(--text-muted)]">
          Market not found.
        </div>
      </AuthenticatedLayout>
    )
  }

  // Determine display variant from database field
  const variant = market.displayVariant as "binary" | "1v1" | "standard"

  return (
    <AuthenticatedLayout>
      {variant === "standard" ? (
        <MultiOptionMarketView market={adaptToMultiOptionMarketData(market)} />
      ) : variant === "1v1" ? (
        <VersusMarketView market={adaptToVersusMarketData(market)} />
      ) : (
        <BinaryMarketView market={adaptToBinaryMarketData(market)} />
      )}
    </AuthenticatedLayout>
  )
}
