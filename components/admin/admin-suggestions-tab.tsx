"use client"

import * as React from "react"
import { Lightbulb, CheckCircle2, XCircle, User, Calendar } from "lucide-react"

/**
 * Explanatory Interface: MarketSuggestionItem
 * Represents a community market idea submitted by a user.
 */
export interface MarketSuggestionItem {
  id: string
  title: string
  description: string
  category: string
  submittedBy: string
  submittedDate: string
  status: "Pending" | "Accepted" | "Rejected"
}

/**
 * Explanatory Interface: AdminSuggestionsTabProps
 * Props for rendering the Market Suggestions queue.
 */
export interface AdminSuggestionsTabProps {
  suggestions: MarketSuggestionItem[]
  onAcceptSuggestion: (suggestion: MarketSuggestionItem) => void
  onRejectSuggestion: (suggestionId: string) => void
}

/**
 * Explanatory Component: AdminSuggestionsTab
 * Displays community-submitted prediction market ideas.
 * Platform operators can click "Accept" to pre-fill the Create Market Dialog
 * or "Reject" to decline unsuitable suggestions.
 */
export function AdminSuggestionsTab({
  suggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
}: AdminSuggestionsTabProps) {
  const pendingSuggestions = suggestions.filter((s) => s.status === "Pending")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">
          Pending User Market Suggestions ({pendingSuggestions.length})
        </h3>
        <span className="text-xs text-gray-400">
          Accepting a suggestion opens the Create Market Dialog pre-filled.
        </span>
      </div>

      {pendingSuggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#1E2A3F] bg-[#0F1727] p-8 text-center">
          <Lightbulb className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-300">No pending market suggestions</p>
          <p className="text-xs text-gray-400">Community suggestions submitted by users will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pendingSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex flex-col justify-between rounded-xl border border-[#1E2A3F] bg-[#0F1727] p-5 shadow-sm space-y-4 transition-all hover:border-[#FFC107]/40"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex rounded-full bg-[#FFC107]/10 px-2.5 py-0.5 text-xs font-semibold text-[#FFC107] capitalize">
                    {suggestion.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{suggestion.submittedDate}</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-white mb-1">{suggestion.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                  {suggestion.description}
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                  <User className="h-3.5 w-3.5 text-[#FFC107]" />
                  <span>Submitted by: <strong className="text-white">{suggestion.submittedBy}</strong></span>
                </div>
              </div>

              {/* Action Buttons: Accept vs Reject */}
              <div className="flex items-center gap-2 border-t border-[#1E2A3F] pt-3">
                <button
                  type="button"
                  onClick={() => onAcceptSuggestion(suggestion)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-success/10 text-success border border-success/30 px-3 py-2 text-xs font-semibold hover:bg-success/20 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" /> Accept & Create Market
                </button>

                <button
                  type="button"
                  onClick={() => onRejectSuggestion(suggestion.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-danger/10 text-danger border border-danger/30 px-3 py-2 text-xs font-semibold hover:bg-danger/20 transition-all"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
