"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { SearchResultCard } from "@/components/parent/search-result-card"
import { DialogHeader, DialogTitle, DialogDescription, DialogLoadingState, DialogEmptyState, DialogErrorState } from "../../primitives"
import { DialogStatus } from "../../types"
import { useRouter } from "next/navigation"

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

// Mock database to simulate search queries
const MOCK_DB = [
  {
    title: "Will the Central Bank lower interest rates in the next quarter?",
    category: "Politics",
    status: "active",
    yesProbability: 45,
    closingDate: new Date(Date.now() + 86400000 * 10),
  },
  {
    title: "Will BBNaija Season 11 launch before September?",
    category: "Entertainment",
    status: "active",
    yesProbability: 75,
    closingDate: new Date(Date.now() + 86400000 * 5),
  },
  {
    title: "Will Nigeria win the next AFCON tournament?",
    category: "Sports",
    status: "active",
    yesProbability: 60,
    closingDate: new Date(Date.now() + 86400000 * 45),
  },
]

export function SearchDialog({ isOpen, onClose, status, setStatus }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<typeof MOCK_DB>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!query) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Simulate API search debounce
    const timer = setTimeout(() => {
      try {
        // Simple search logic
        const filtered = MOCK_DB.filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filtered)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch search results. Please try again.")
        setLoading(false)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (title: string) => {
    onClose()
    // Simulate navigation to specific market page using a mock ID or title
    router.push(`/markets/1`)
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
        {loading && <DialogLoadingState message="Searching markets..." />}

        {error && (
          <DialogErrorState
            title="Search Error"
            message={error}
            className="mt-4"
          />
        )}

        {!loading && !error && query && results.length === 0 && (
          <DialogEmptyState
            title="No matches found"
            description={`We couldn't find any markets matching "${query}". Try different keywords.`}
            className="mt-4"
          />
        )}

        {!loading && !error && !query && (
          <div className="text-center py-8 text-sm text-[var(--text-muted)]">
            Start typing to search markets...
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="flex flex-col gap-2" role="list">
            {results.map((result, idx) => (
              <SearchResultCard
                key={idx}
                title={result.title}
                category={result.category}
                status={result.status}
                yesProbability={result.yesProbability}
                closingDate={result.closingDate}
                onClick={() => handleSelect(result.title)}
              />
            ))}
          </div>
        )}
      </div>
    </ResponsiveWrapper>
  )
}
export default SearchDialog
