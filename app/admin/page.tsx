"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader } from "@/components/parent"
import { Store, Lightbulb, Wallet, Tags, ScrollText } from "lucide-react"

// Import Admin Sub-components
import { AdminSummaryCards } from "@/components/admin/admin-summary-cards"
import { AdminMarketsTab, type AdminMarketItem } from "@/components/admin/admin-markets-tab"
import { AdminSuggestionsTab, type MarketSuggestionItem } from "@/components/admin/admin-suggestions-tab"
import { AdminWithdrawalsTab, type WithdrawalItem } from "@/components/admin/admin-withdrawals-tab"
import { AdminCategoriesTab, type CategoryItem } from "@/components/admin/admin-categories-tab"
import { AdminAuditLogsTab, type AuditLogRecord } from "@/components/admin/admin-audit-logs-tab"

// Import Admin Dialogs
import { CreateMarketDialog } from "@/components/admin/create-market-dialog"
import { ResolveMarketDialog } from "@/components/admin/resolve-market-dialog"
import { WithdrawalActionDialog } from "@/components/admin/withdrawal-action-dialog"

/**
 * Explanatory Page Component: AdminDashboardPage
 * Main entry point for platform operators (`/admin`).
 * Combines Platform Financial Summary cards with a unified 5-tab workspace:
 * 1. Markets Management (Create, Edit, Resolve)
 * 2. Market Suggestions Queue (Accept & Pre-fill Create Market)
 * 3. Withdrawal Requests Review (Approve/Reject payouts)
 * 4. Category Taxonomy Manager (Add categories)
 * 5. Immutable Audit Logs (Track who did what and when)
 */
export default function AdminDashboardPage() {
  // Active Workspace Tab Selection State:
  const [activeTab, setActiveTab] = React.useState<
    "markets" | "suggestions" | "withdrawals" | "categories" | "audit"
  >("markets")

  // Modal Dialog Visibility & Active Item States:
  const [isCreateMarketOpen, setIsCreateMarketOpen] = React.useState(false)
  const [createMarketPreFill, setCreateMarketPreFill] = React.useState<any>(null)

  const [isResolveMarketOpen, setIsResolveMarketOpen] = React.useState(false)
  const [selectedResolveMarket, setSelectedResolveMarket] = React.useState<AdminMarketItem | null>(null)

  const [isWithdrawalActionOpen, setIsWithdrawalActionOpen] = React.useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = React.useState<WithdrawalItem | null>(null)

  // --------------------------------------------------------------------------
  // Mock Data & State Stores (Represents instant DB connection)
  // --------------------------------------------------------------------------

  // Categories State
  const [categories, setCategories] = React.useState<CategoryItem[]>([
    { id: "bbnaija", label: "BBNaija", marketCount: 12 },
    { id: "sports", label: "Sports", marketCount: 4 },
    { id: "entertainment", label: "Entertainment", marketCount: 2 },
    { id: "politics", label: "Politics", marketCount: 0 },
    { id: "crypto", label: "Crypto", marketCount: 0 },
  ])

  // Markets State
  const [markets, setMarkets] = React.useState<AdminMarketItem[]>([
    {
      id: "m-1",
      title: "Who will win BBNaija Season 9 Head of House in Week 4?",
      category: "bbnaija",
      status: "Open",
      closeDate: "2026-08-01 18:00",
      totalVolume: 4250000,
      format: "multi",
      options: [
        { id: "opt-1", title: "Anita" },
        { id: "opt-2", title: "Ozee" },
        { id: "opt-3", title: "Wanni" },
      ],
    },
    {
      id: "m-2",
      title: "Will there be a surprise fake eviction on Sunday?",
      category: "bbnaija",
      status: "Closed",
      closeDate: "2026-07-26 20:00",
      totalVolume: 1890000,
      format: "binary",
      options: [
        { id: "opt-yes", title: "Yes" },
        { id: "opt-no", title: "No" },
      ],
    },
  ])

  // User Market Suggestions State
  const [suggestions, setSuggestions] = React.useState<MarketSuggestionItem[]>([
    {
      id: "sugg-101",
      title: "Will the Veto Power game be re-introduced next week?",
      description: "With tension high in the house, Biggie might bring back Veto Power twist.",
      category: "bbnaija",
      submittedBy: "Tunde_Naija",
      submittedDate: "2026-07-26",
      status: "Pending",
    },
    {
      id: "sugg-102",
      title: "Will Arsenal win their opening pre-season friendly by 2+ goals?",
      description: "Friendly match predictions for sports fans.",
      category: "sports",
      submittedBy: "Gunner_99",
      submittedDate: "2026-07-27",
      status: "Pending",
    },
  ])

  // Withdrawal Requests State
  const [withdrawals, setWithdrawals] = React.useState<WithdrawalItem[]>([
    {
      id: "w-1",
      userName: "Chidi Okonkwo",
      userEmail: "chidi@example.com",
      bankName: "Guaranty Trust Bank (GTB)",
      accountNumber: "0123456789",
      accountName: "Chidi Okonkwo",
      amount: 150000,
      requestDate: "2026-07-27 09:30",
      status: "Pending",
    },
    {
      id: "w-2",
      userName: "Aisha Bello",
      userEmail: "aisha@example.com",
      bankName: "Zenith Bank",
      accountNumber: "9876543210",
      accountName: "Aisha Bello",
      amount: 45000,
      requestDate: "2026-07-27 10:15",
      status: "Pending",
    },
  ])

  // Immutable Audit Logs State
  const [auditLogs, setAuditLogs] = React.useState<AuditLogRecord[]>([
    {
      id: "log-1",
      action: "MARKET_CREATED",
      performedBy: "admin@sheybi.com",
      targetId: "m-1",
      details: "Created market 'Who will win BBNaija Season 9 Head of House...'",
      timestamp: "2026-07-25 14:20:00",
    },
  ])

  // --------------------------------------------------------------------------
  // Helper Handlers for Logging Audit Events
  // --------------------------------------------------------------------------
  const recordAuditLog = (action: string, targetId: string, details: string) => {
    const newLog: AuditLogRecord = {
      id: `log-${Date.now()}`,
      action,
      performedBy: "admin@sheybi.com", // Authenticated admin user email
      targetId,
      details,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  // --------------------------------------------------------------------------
  // Action Handlers
  // --------------------------------------------------------------------------

  /** Triggered when admin submits the Create Market dialog */
  const handleCreateMarketSubmit = (marketData: any) => {
    const newMarket: AdminMarketItem = {
      id: `m-${Date.now()}`,
      title: marketData.title,
      category: marketData.category,
      status: marketData.status as any,
      closeDate: marketData.closeDate.replace("T", " "),
      totalVolume: 0,
      format: marketData.format,
      options: marketData.options,
    }

    setMarkets((prev) => [newMarket, ...prev])

    // If created from a suggestion, update suggestion status
    if (marketData.suggestionId) {
      setSuggestions((prev) =>
        prev.map((s) => (s.id === marketData.suggestionId ? { ...s, status: "Accepted" } : s))
      )
    }

    recordAuditLog(
      "MARKET_CREATED",
      newMarket.id,
      `Created market "${newMarket.title}" (${newMarket.format} format, status: ${newMarket.status})`
    )
  }

  /** Triggered when admin accepts a market suggestion */
  const handleAcceptSuggestion = (suggestion: MarketSuggestionItem) => {
    setCreateMarketPreFill({
      suggestionId: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
    })
    setIsCreateMarketOpen(true)
    recordAuditLog(
      "SUGGESTION_ACCEPTED",
      suggestion.id,
      `Accepted market suggestion "${suggestion.title}" and opened pre-filled creation form`
    )
  }

  /** Triggered when admin rejects a market suggestion */
  const handleRejectSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: "Rejected" } : s))
    )
    recordAuditLog("SUGGESTION_REJECTED", suggestionId, `Rejected market suggestion ID: ${suggestionId}`)
  }

  /** Triggered when admin resolves a closed market */
  const handleResolveMarket = (marketId: string, winningOptionId: string) => {
    setMarkets((prev) =>
      prev.map((m) => (m.id === marketId ? { ...m, status: "Resolved" } : m))
    )
    recordAuditLog(
      "MARKET_RESOLVED",
      marketId,
      `Resolved market ID ${marketId} declaring winning option ID ${winningOptionId}`
    )
  }

  /** Triggered when admin approves or rejects a withdrawal */
  const handleWithdrawalAction = (
    withdrawalId: string,
    action: "approve" | "reject",
    reason?: string
  ) => {
    const newStatus = action === "approve" ? "Approved" : "Rejected"
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: newStatus } : w))
    )

    recordAuditLog(
      action === "approve" ? "WITHDRAWAL_APPROVED" : "WITHDRAWAL_REJECTED",
      withdrawalId,
      action === "approve"
        ? `Approved payout for withdrawal ID ${withdrawalId}`
        : `Rejected withdrawal ID ${withdrawalId}. Reason: ${reason || "None provided"}`
    )
  }

  /** Triggered when admin adds a new category */
  const handleAddCategory = (label: string) => {
    const newCat: CategoryItem = {
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      marketCount: 0,
    }
    setCategories((prev) => [...prev, newCat])
    recordAuditLog("CATEGORY_ADDED", newCat.id, `Added new category taxonomy "${label}"`)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Section Header */}
        <SectionHeader
          title="Admin Control Center"
          description="Manage prediction markets, review withdrawal requests, process user suggestions, and audit platform activity."
        />

        {/* Top KPI Summary Cards */}
        <AdminSummaryCards
          totalPlatformBalance={14850000}
          activeMarketsCount={markets.filter((m) => m.status === "Open").length}
          pendingWithdrawalsCount={withdrawals.filter((w) => w.status === "Pending").length}
          pendingWithdrawalsAmount={withdrawals
            .filter((w) => w.status === "Pending")
            .reduce((sum, w) => sum + w.amount, 0)}
          pendingSuggestionsCount={suggestions.filter((s) => s.status === "Pending").length}
        />

        {/* Tabbed Workspace Navigation Bar */}
        <div className="flex border-b border-border overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("markets")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "markets"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Store className="h-4 w-4" /> Markets ({markets.length})
          </button>

          <button
            onClick={() => setActiveTab("suggestions")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "suggestions"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Lightbulb className="h-4 w-4" /> Suggestions ({suggestions.filter((s) => s.status === "Pending").length})
          </button>

          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "withdrawals"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Wallet className="h-4 w-4" /> Withdrawals ({withdrawals.filter((w) => w.status === "Pending").length})
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "categories"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Tags className="h-4 w-4" /> Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "audit"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <ScrollText className="h-4 w-4" /> Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Tab Workspace Content */}
        <div className="mt-2">
          {activeTab === "markets" && (
            <AdminMarketsTab
              markets={markets}
              onOpenCreateDialog={() => {
                setCreateMarketPreFill(null)
                setIsCreateMarketOpen(true)
              }}
              onOpenResolveDialog={(market) => {
                setSelectedResolveMarket(market)
                setIsResolveMarketOpen(true)
              }}
            />
          )}

          {activeTab === "suggestions" && (
            <AdminSuggestionsTab
              suggestions={suggestions}
              onAcceptSuggestion={handleAcceptSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
            />
          )}

          {activeTab === "withdrawals" && (
            <AdminWithdrawalsTab
              withdrawals={withdrawals}
              onOpenActionDialog={(item) => {
                setSelectedWithdrawal(item)
                setIsWithdrawalActionOpen(true)
              }}
            />
          )}

          {activeTab === "categories" && (
            <AdminCategoriesTab categories={categories} onAddCategory={handleAddCategory} />
          )}

          {activeTab === "audit" && <AdminAuditLogsTab logs={auditLogs} />}
        </div>
      </div>

      {/* Admin Dialog Modals */}
      <CreateMarketDialog
        isOpen={isCreateMarketOpen}
        onClose={() => setIsCreateMarketOpen(false)}
        initialData={createMarketPreFill}
        categories={categories}
        onSubmitMarket={handleCreateMarketSubmit}
      />

      <ResolveMarketDialog
        isOpen={isResolveMarketOpen}
        onClose={() => setIsResolveMarketOpen(false)}
        market={selectedResolveMarket}
        onResolveMarket={handleResolveMarket}
      />

      <WithdrawalActionDialog
        isOpen={isWithdrawalActionOpen}
        onClose={() => setIsWithdrawalActionOpen(false)}
        withdrawal={selectedWithdrawal}
        onAction={handleWithdrawalAction}
      />
    </AdminLayout>
  )
}
