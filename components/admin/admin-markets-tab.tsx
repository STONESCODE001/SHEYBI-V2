"use client"

import * as React from "react"
import { Plus, Search, Trophy, Edit, AlertCircle, CheckCircle2 } from "lucide-react"

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
  format: "binary" | "multi"
  options: { id: string; title: string }[]
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#1E2A3F] bg-[#0F1727] pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-400 focus:border-[#FFC107] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="rounded-xl border border-[#1E2A3F] bg-[#0F1727] px-3 py-2 text-sm text-white focus:border-[#FFC107] focus:outline-none"
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
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[#FFC107] text-[#0B0E14] px-4 py-2.5 text-sm font-bold hover:bg-[#E5AD00] shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Create Market
        </button>
      </div>

      {/* Markets Table */}
      <div className="overflow-hidden rounded-xl border border-[#1E2A3F] bg-[#0F1727] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="border-b border-[#1E2A3F] bg-[#141E30] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Market Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Format</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Volume</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2A3F]">
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No markets found matching filters.
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((market) => (
                  <tr key={market.id} className="hover:bg-[#141E30]/60 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="font-semibold text-white">{market.title}</div>
                      <div className="text-xs text-gray-400">Closes: {market.closeDate}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 capitalize">{market.category}</td>
                    <td className="px-4 py-3 text-xs uppercase font-medium text-gray-400">
                      {market.format}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(market.status)}`}>
                        {market.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{formatNaira(market.totalVolume)}</td>
                    <td className="px-4 py-3 text-right">
                      {market.status === "Closed" ? (
                        <button
                          onClick={() => onOpenResolveDialog(market)}
                          className="inline-flex items-center gap-1 rounded-lg bg-warning/10 text-warning border border-warning/30 px-3 py-1.5 text-xs font-semibold hover:bg-warning/20 transition-all"
                        >
                          <Trophy className="h-3.5 w-3.5" /> Resolve
                        </button>
                      ) : market.status === "Open" || market.status === "Paused" ? (
                        <button
                          onClick={() => onOpenPauseDialog?.(market)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                            market.status === "Paused"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20"
                          }`}
                        >
                          {market.status === "Paused" ? "Unpause" : "Pause"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
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
