"use client"

import * as React from "react"
import { PublicLayout } from "@/components/layouts"
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
import { MarketCardSkeleton } from "@/components/ui/skeletons"

export function MarketDetailClient({ marketId }: { marketId: string }) {
  // Server-side / query-level isolated lookup targeting specific market ID or slug
  const { isLoading, error, data } = db.useQuery(
    marketId
      ? {
          markets: {
            $: {
              where: {
                or: [{ id: marketId }, { slug: marketId }],
              },
            },
            options: {},
            category: {},
            activity: {},
          },
        }
      : null
  )

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto py-8">
          <MarketCardSkeleton className="min-h-[400px]" />
        </div>
      </PublicLayout>
    )
  }

  const market = (data as any)?.markets?.[0]

  if (error) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-[var(--text-muted)] gap-3 text-center px-4">
          <p className="text-lg font-bold text-[var(--text-primary)]">Unable to load market</p>
          <p className="text-sm max-w-md">{error.message || "A network or server error occurred while loading this market."}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-[var(--bg-surface-secondary)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </PublicLayout>
    )
  }

  if (!market) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-[var(--text-muted)] gap-2 text-center px-4">
          <p className="text-lg font-bold text-[var(--text-primary)]">Market Not Found</p>
          <p className="text-sm">The prediction market you are looking for does not exist or has been removed.</p>
        </div>
      </PublicLayout>
    )
  }

  const variant = market.displayVariant as "binary" | "1v1" | "standard"

  return (
    <PublicLayout>
      {variant === "standard" ? (
        <MultiOptionMarketView market={adaptToMultiOptionMarketData(market)} />
      ) : variant === "1v1" ? (
        <VersusMarketView market={adaptToVersusMarketData(market)} />
      ) : (
        <BinaryMarketView market={adaptToBinaryMarketData(market)} />
      )}
    </PublicLayout>
  )
}
