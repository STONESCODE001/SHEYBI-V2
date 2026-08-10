"use client"

import * as React from "react"
import { Plus, Search, Trophy, Edit, AlertCircle, CheckCircle2, Users, Star } from "lucide-react"

/**
 * Explanatory Interface: AdminMarketItem
 * Represents a market record displayed in the Admin Markets Management table.
 */
export interface AdminMarketItem {
  id: string
  title: string
  category: string
  status: "Draft" | "Scheduled" | "Open" | "Paused" | "Closed" | "Resolved" | "Cancelled"
  closeDate: string
  totalVolume: number
  format: "binary" | "1v1" | "multi"
  isFeatured?: boolean
  options: { id: string; title: string; probability?: number; isPaused?: boolean }[]
}

/**
 * Explanatory Interface: AdminMarketsTabProps
 * Props for rendering the Markets tab workspace and triggering dialogs.
 */
export interface AdminMarketsTabProps {
  markets: AdminMarketItem[]
  onOpenCreateDialog: () => void
  onOpenResolveDialog: (market: AdminMarketItem) => void
  onOpenPauseDialog?: (market: AdminMarketItem) => void
  onOpenOptionsDialog?: (market: AdminMarketItem) => void
  onToggleFeatured?: (market: AdminMarketItem) => void
}

/**
 * Explanatory Component: AdminMarketsTab
 * Renders the primary Admin Market Management table.
 * Allows administrators to search markets, view status lifecycle badges,
 * trigger the "+ Create Market" dialog, and open the "Resolve Market" modal for closed markets.
 */
export function AdminMarketsTab({
  markets,
  onOpenCreateDialog,
  onOpenResolveDialog,
  onOpenPauseDialog,
  onOpenOptionsDialog,
  onToggleFeatured,
}: AdminMarketsTabProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>("ALL")

  /** Formats currency into Nigerian Naira (₦) */
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Filter markets by search title and selected status filter
  const filteredMarkets = markets.filter((market) => {
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatusFilter === "ALL" || market.status === selectedStatusFilter
    return matchesSearch && matchesStatus
  })

  /** Helper to return styling for market status badges */
  const getStatusBadge = (status: AdminMarketItem["status"]) => {
    switch (status) {
      case "Open":
        return "bg-success/10 text-success border-success/20"
      case "Closed":
        return "bg-warning/10 text-warning border-warning/20"
      case "Resolved":
        return "bg-primary/10 text-primary border-primary/20"
      case "Draft":
        return "bg-secondary-container text-text-secondary border-border"
      case "Cancelled":
        return "bg-danger/10 text-danger border-danger/20"
      default:
        return "bg-surface-container text-text-muted border-border"
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar: Search, Status Filter, "+ Create Market" Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-surface-secondary pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed (Needs Resolution)</option>
            <option value="Resolved">Resolved</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        {/* Primary Action Button: "+ Create Market" */}
        <button
          onClick={onOpenCreateDialog}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary text-on-primary px-4 py-2.5 text-sm font-bold hover:bg-primary-hover shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Create Market
        </button>
      </div>

      {/* Markets Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead className="border-b border-border bg-bg-surface-secondary text-xs uppercase text-text-muted font-bold">
              <tr>
                <th className="px-4 py-3 font-semibold">Market Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Format</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Volume</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted font-medium">
                    No markets found matching filters.
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((market) => (
                  <tr key={market.id} className="hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="font-bold text-text-primary">{market.title}</div>
                      <div className="text-xs text-text-muted font-medium">Closes: {market.closeDate}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-semibold capitalize">{market.category}</td>
                    <td className="px-4 py-3 text-xs uppercase font-bold text-text-muted">
                      {market.format}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(market.status)}`}>
                        {market.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-text-primary">{formatNaira(market.totalVolume)}</td>
                    <td className="px-4 py-3 text-right">
                      {market.status === "Resolved" || market.status === "Cancelled" ? (
                        <span className="text-xs text-text-muted font-semibold italic">{market.status}</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {onToggleFeatured && (
                            <button
                              type="button"
                              onClick={() => onToggleFeatured(market)}
                              title={market.isFeatured ? "Unstar Featured" : "Star as Featured / Trending"}
                              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all ${
                                market.isFeatured
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                                  : "bg-surface-container text-text-muted border-border hover:text-text-primary"
                              }`}
                            >
                              <Star className={`h-3.5 w-3.5 ${market.isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                          )}
                          {market.format === "multi" && onOpenOptionsDialog && (
                            <button
                              type="button"
                              onClick={() => onOpenOptionsDialog(market)}
                              className="inline-flex items-center gap-1 rounded-xl bg-surface-container text-text-primary border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-bg-hover transition-all shadow-xs"
                            >
                              <Users className="h-3.5 w-3.5 text-primary" /> Options
                            </button>
                          )}
                          {(market.status === "Open" || market.status === "Paused") && (
                            <button
                              type="button"
                              onClick={() => onOpenPauseDialog?.(market)}
                              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all ${
                                market.status === "Paused"
                                  ? "bg-success/10 text-success border-success/30 hover:bg-success/20"
                                  : "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20"
                              }`}
                            >
                              {market.status === "Paused" ? "Unpause" : "Pause"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenResolveDialog(market)}
                            className="inline-flex items-center gap-1 rounded-xl bg-primary/10 text-primary border border-primary/30 px-3 py-1.5 text-xs font-bold hover:bg-primary/20 transition-all shadow-xs"
                          >
                            <Trophy className="h-3.5 w-3.5" /> Resolve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
