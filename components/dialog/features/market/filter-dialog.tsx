"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FilterDialogProps {
  isOpen: boolean
  onClose: (filters?: any) => void
  payload?: {
    currentFilters?: {
      category?: string
      status?: string
      sortBy?: string
    }
  }
  status: DialogStatus
}

export function FilterDialog({ isOpen, onClose, payload, status }: FilterDialogProps) {
  const [category, setCategory] = React.useState(payload?.currentFilters?.category || "all")
  const [marketStatus, setMarketStatus] = React.useState(payload?.currentFilters?.status || "active")
  const [sortBy, setSortBy] = React.useState(payload?.currentFilters?.sortBy || "trending")

  const handleApply = () => {
    onClose({
      category,
      status: marketStatus,
      sortBy
    })
  }

  const handleReset = () => {
    setCategory("all")
    setMarketStatus("active")
    setSortBy("trending")
  }

  const categories = [
    { value: "all", label: "All" },
    { value: "politics", label: "Politics" },
    { value: "sports", label: "Sports" },
    { value: "entertainment", label: "Entertainment" }
  ]

  const statuses = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "resolved", label: "Resolved" },
    { value: "suspended", label: "Suspended" }
  ]

  const sortOptions = [
    { value: "trending", label: "Trending" },
    { value: "newest", label: "Newest" },
    { value: "volume", label: "Highest Volume" },
    { value: "liquidity", label: "Highest Liquidity" }
  ]

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={() => onClose()}
      status={status}
      size="sm"
      title="Filter Markets"
      description="Refine predictions feed based on your criteria."
    >
      <DialogHeader className="p-0">
        <DialogTitle className="text-xl">Filter Markets</DialogTitle>
        <DialogDescription>Select feed criteria to sort and filter the prediction markets feed.</DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-5">
        {/* Category section */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[var(--text-secondary)]">Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 outline-none",
                  category === c.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status section */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[var(--text-secondary)]">Market Status</Label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => setMarketStatus(s.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 outline-none",
                  marketStatus === s.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort option section */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[var(--text-secondary)]">Sort By</Label>
          <div className="grid grid-cols-2 gap-2">
            {sortOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setSortBy(o.value)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 text-center outline-none",
                  sortBy === o.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6 p-0 gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full sm:w-1/2 text-[var(--text-secondary)] border-[var(--border-default)]"
        >
          Reset Filters
        </Button>
        <Button
          onClick={handleApply}
          className="w-full sm:w-1/2 bg-primary text-white hover:bg-primary-hover"
        >
          Apply Filters
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default FilterDialog
