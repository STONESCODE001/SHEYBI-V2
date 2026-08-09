"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { SearchResultCard, SearchResultCardSkeleton } from "@/components/parent/search-result-card"
import { DialogHeader, DialogTitle, DialogDescription, DialogEmptyState, DialogErrorState } from "../../primitives"
import { DialogStatus } from "../../types"
import { useRouter } from "next/navigation"
import { db } from "@/lib/instant"
import { normalizeProbability } from "@/lib/market-adapter"

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

const QUICK_SEARCH_TAGS = ["#BBNaija", "#Eviction", "#HeadOfHouse", "#Winner"]

export function SearchDialog({ isOpen, onClose, status, setStatus }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  // Reset search query when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setQuery("")
    }
  }, [isOpen])

  // Live InstantDB query for markets with category and options
  const { isLoading, error, data } = db.useQuery({
    markets: {
      category: {},
      options: {},
    },
  })

  const rawMarkets = (data as any)?.markets as any[] || []

  // Filter & Sort markets based on search query
  const matchingMarkets = React.useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return []

    const q = trimmed.toLowerCase()
    const cleanQ = q.replace(/[^a-z0-9]/g, "")

    return rawMarkets.filter((market) => {
      const title = (market.title || "").toLowerCase()
      const desc = (market.description || "").toLowerCase()
      const categoryName = (market.category?.name || "").toLowerCase()
      const options = market.options || []

      // 1. Direct substring matching across title, description, and category
      if (title.includes(q) || desc.includes(q) || categoryName.includes(q)) {
        return true
      }

      // 2. Substring matching across option names
      if (options.some((opt: any) => (opt.name || "").toLowerCase().includes(q))) {
        return true
      }

      // 3. Normalized alphanumeric fallback matching (e.g. "#BBNaija" vs "BBNaija", "HeadOfHouse" vs "Head of House")
      if (cleanQ) {
        const cleanTitle = title.replace(/[^a-z0-9]/g, "")
        const cleanDesc = desc.replace(/[^a-z0-9]/g, "")
        const cleanCategory = categoryName.replace(/[^a-z0-9]/g, "")

        if (cleanTitle.includes(cleanQ) || cleanDesc.includes(cleanQ) || cleanCategory.includes(cleanQ)) {
          return true
        }

        if (options.some((opt: any) => (opt.name || "").toLowerCase().replace(/[^a-z0-9]/g, "").includes(cleanQ))) {
          return true
        }
      }

      return false
    })
  }, [rawMarkets, query])

  // Sort matched markets: 'open' state first, followed by closed / resolved / others
  const sortedResults = React.useMemo(() => {
    const openMarkets = matchingMarkets.filter((m) => m.state === "open")
    const otherMarkets = matchingMarkets.filter((m) => m.state !== "open")
    return [...openMarkets, ...otherMarkets]
  }, [matchingMarkets])

  const handleSelect = (marketId: string) => {
    onClose()
    router.push(`/markets/${marketId}`)
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="md"
      type="fullscreen"
      title="Search Markets"
      description="Type to find markets to predict."
    >
      <DialogHeader className="p-0 pb-2">
        <DialogTitle className="text-xl">Search Markets</DialogTitle>
        <DialogDescription>Search for trending, active, or resolved entertainment and sports prediction markets.</DialogDescription>
      </DialogHeader>

      <div className="relative mt-2">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <Input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search matches, events, categories..."
          className="pl-10 h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] focus-visible:ring-[var(--border-active)]"
        />
      </div>

      <div className="mt-4 flex-1 overflow-y-auto max-h-[50vh] pr-1">
        {isLoading && (
          <div className="flex flex-col gap-2 py-1">
            <SearchResultCardSkeleton />
            <SearchResultCardSkeleton />
            <SearchResultCardSkeleton />
          </div>
        )}

        {error && (
          <DialogErrorState
            title="Search Error"
            message={error.message || "Failed to fetch search results. Please try again."}
            className="mt-4"
          />
        )}

        {!isLoading && !error && query.trim() && sortedResults.length === 0 && (
          <DialogEmptyState
            title="No markets found"
            description={`No markets found matching '${query}'.`}
            className="mt-4"
          />
        )}

        {!isLoading && !error && !query.trim() && (
          <div className="py-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                Quick Search
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-yellow)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-center py-6 text-sm text-[var(--text-muted)] border-t border-[var(--border-default)]/30 pt-4">
              Start typing or tap a tag to search markets...
            </div>
          </div>
        )}

        {!isLoading && !error && query.trim() && sortedResults.length > 0 && (
          <div className="flex flex-col gap-2" role="list">
            {sortedResults.map((market) => {
              const options = market.options || []
              const yesOption = options.find((o: any) => o.name?.toUpperCase() === "YES") || options[0]
              const yesProb = yesOption ? Math.round(normalizeProbability(yesOption.probability, 50)) : undefined

              return (
                <SearchResultCard
                  key={market.id}
                  title={market.title}
                  imageUrl={market.imageUrl}
                  category={market.category?.name || "General"}
                  status={(market.state || "open").toUpperCase()}
                  yesProbability={yesProb}
                  closingDate={market.closingTime ? new Date(market.closingTime) : undefined}
                  onClick={() => handleSelect(market.id || market.slug)}
                />
              )
            })}
          </div>
        )}
      </div>
    </ResponsiveWrapper>
  )
}
export default SearchDialog

