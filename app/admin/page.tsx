"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader } from "@/components/parent"
import { Store, Lightbulb, Wallet, Tags, ScrollText } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"

// Import Admin Data Hooks
import {
  useAdminMarkets,
  useAdminWithdrawals,
  useAdminSuggestions,
  useAdminAuditLogs,
  useAdminCategories,
  useAdminLedger,
} from "@/lib/hooks/use-admin-data"

// Import Server Actions
import {
  createMarketAction,
  resolveMarketAction,
  pauseMarketAction,
  unpauseMarketAction,
} from "@/lib/actions/market-actions"
import { rejectWithdrawalAction } from "@/lib/actions/wallet-actions"
import {
  updateSuggestionStatusAction,
  approveWithdrawalAction,
  createCategoryAction,
} from "@/lib/actions/admin-actions"

// Import Admin Sub-components
import { AdminSummaryCards } from "@/components/admin/admin-summary-cards"
import { AdminMarketsTab, type AdminMarketItem } from "@/components/admin/admin-markets-tab"
import { AdminSuggestionsTab, type MarketSuggestionItem } from "@/components/admin/admin-suggestions-tab"
import { AdminWithdrawalsTab, type WithdrawalItem } from "@/components/admin/admin-withdrawals-tab"
import { AdminCategoriesTab, type CategoryItem } from "@/components/admin/admin-categories-tab"
import { AdminAuditLogsTab, type AuditLogRecord } from "@/components/admin/admin-audit-logs-tab"

// Import Admin Dialogs
import { CreateMarketDialog } from "@/components/admin/create-market-dialog"
import { ResolveMarketDialog } from "@/components/dialog/features/market/resolve-market-dialog"
import { PauseMarketDialog } from "@/components/dialog/features/market/pause-market-dialog"
import { WithdrawalActionDialog } from "@/components/admin/withdrawal-action-dialog"
import { FinancialWipeDialog } from "@/components/dialog/features/admin/financial-wipe-dialog"

/**
 * AdminDashboardPage Component
 * Main entry point for platform operators (`/admin`).
 * Reads live data from InstantDB via reactive hooks and executes real Server Actions.
 */
export default function AdminDashboardPage() {
  const { userId } = useAuth()

  // Active Workspace Tab Selection State:
  const [activeTab, setActiveTab] = React.useState<
    "markets" | "suggestions" | "withdrawals" | "categories" | "audit"
  >("markets")

  // Modal Dialog Visibility & Active Item States:
  const [isCreateMarketOpen, setIsCreateMarketOpen] = React.useState(false)
  const [createMarketPreFill, setCreateMarketPreFill] = React.useState<any>(null)

  const [isResolveMarketOpen, setIsResolveMarketOpen] = React.useState(false)
  const [selectedResolveMarket, setSelectedResolveMarket] = React.useState<AdminMarketItem | null>(null)

  const [isPauseMarketOpen, setIsPauseMarketOpen] = React.useState(false)
  const [selectedPauseMarket, setSelectedPauseMarket] = React.useState<AdminMarketItem | null>(null)

  const [isWithdrawalActionOpen, setIsWithdrawalActionOpen] = React.useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = React.useState<WithdrawalItem | null>(null)

  const [isFinancialWipeOpen, setIsFinancialWipeOpen] = React.useState(false)

  // --------------------------------------------------------------------------
  // Reactive InstantDB Queries
  // --------------------------------------------------------------------------
  const { markets: dbMarkets, isLoading: marketsLoading } = useAdminMarkets()
  const { withdrawals: dbWithdrawals } = useAdminWithdrawals()
  const { suggestions: dbSuggestions } = useAdminSuggestions()
  const { logs: dbLogs } = useAdminAuditLogs()
  const { categories: dbCategories } = useAdminCategories()
  const { ledgerEntries } = useAdminLedger()

  // --------------------------------------------------------------------------
  // Data Transformations for Tab Components
  // --------------------------------------------------------------------------
  const markets: AdminMarketItem[] = React.useMemo(() => {
    return dbMarkets.map((m: any) => {
      const matchedCat = dbCategories.find(
        (c: any) => c.slug === m.category?.slug || c.id === m.category?.id || c.name === m.category?.name
      )
      const catDisplay = matchedCat ? matchedCat.name : (m.category?.name || m.category?.slug || 'General')

      return {
        id: m.id,
        title: m.title,
        category: catDisplay,
        status: (m.state.charAt(0).toUpperCase() + m.state.slice(1)) as any,
        closeDate: new Date(m.closingTime).toLocaleString(),
        totalVolume: m.tradingVolume ?? 0,
        format: m.marketType === 'multi_option' ? 'multi' : 'binary',
        options: (m.options ?? []).map((o: any) => ({ id: o.id, title: o.name })),
      }
    })
  }, [dbMarkets, dbCategories])

  const suggestions: MarketSuggestionItem[] = React.useMemo(() => {
    return dbSuggestions.map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.categorySlug ?? '',
      submittedBy: s.submitterName || s.submittedBy,
      submittedDate: new Date(s.createdAt).toLocaleDateString(),
      status: (s.status.charAt(0).toUpperCase() + s.status.slice(1)) as any,
    }))
  }, [dbSuggestions])

  const withdrawals: WithdrawalItem[] = React.useMemo(() => {
    return dbWithdrawals.map((w: any) => ({
      id: w.id,
      userName: w.accountName,
      userEmail: '',
      bankName: w.bankName,
      accountNumber: w.accountNumber,
      accountName: w.accountName,
      amount: w.grossAmount,
      requestDate: new Date(w.createdAt).toLocaleString(),
      status: (w.status.charAt(0).toUpperCase() + w.status.slice(1)) as any,
    }))
  }, [dbWithdrawals])

  const categories: CategoryItem[] = React.useMemo(() => {
    return dbCategories.map((c: any) => {
      const count = dbMarkets.filter(
        (m: any) =>
          m.category?.slug === c.slug ||
          m.category?.id === c.id ||
          m.category?.name === c.name
      ).length
      return {
        id: c.slug,
        label: c.name,
        marketCount: count,
      }
    })
  }, [dbCategories, dbMarkets])

  const auditLogs: AuditLogRecord[] = React.useMemo(() => {
    return dbLogs.map((log: any) => ({
      id: log.id,
      action: log.actionType,
      performedBy: log.adminUserId,
      targetId: log.targetEntityId,
      details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
      timestamp: new Date(log.createdAt).toLocaleString(),
    }))
  }, [dbLogs])

  // KPI summary metrics derived from live DB state
  const totalVolumeAllMarkets = React.useMemo(() => {
    return dbMarkets.reduce((sum: number, m: any) => sum + (m.tradingVolume || 0), 0)
  }, [dbMarkets])

  const pendingWithdrawalsCount = React.useMemo(() => {
    return dbWithdrawals.filter((w: any) => w.status?.toLowerCase() === 'pending').length
  }, [dbWithdrawals])

  const pendingWithdrawalsAmount = React.useMemo(() => {
    return dbWithdrawals
      .filter((w: any) => w.status?.toLowerCase() === 'pending')
      .reduce((sum: number, w: any) => sum + (w.grossAmount || 0), 0)
  }, [dbWithdrawals])

  const pendingSuggestionsCount = React.useMemo(() => {
    return dbSuggestions.filter((s: any) => s.status?.toLowerCase() === 'pending').length
  }, [dbSuggestions])

  const totalSeedLiquidity = React.useMemo(() => {
    return dbMarkets.reduce((sum: number, m: any) => sum + (m.liquidity || 50000), 0)
  }, [dbMarkets])

  const platformRevenue = React.useMemo(() => {
    // 1. Sum feeAmount / fee from all withdrawal requests
    const withdrawalFees = dbWithdrawals.reduce(
      (sum: number, w: any) => sum + (w.feeAmount || w.fee || 0),
      0
    )
    // 2. Sum WITHDRAWAL_FEE, TRADE_FEE, or PLATFORM_FEE from ledger entries
    const ledgerFees = (ledgerEntries || [])
      .filter(
        (e: any) =>
          e.eventType === "WITHDRAWAL_FEE" ||
          e.eventType === "TRADE_FEE" ||
          e.eventType === "PLATFORM_FEE"
      )
      .reduce((sum: number, e: any) => sum + Math.abs(e.amount || 0), 0)

    return Math.max(withdrawalFees, ledgerFees)
  }, [dbWithdrawals, ledgerEntries])

  // --------------------------------------------------------------------------
  // Action Handlers
  // --------------------------------------------------------------------------

  /** Triggered when admin submits the Create Market dialog */
  const handleCreateMarketSubmit = async (marketData: any) => {
    try {
      const closeTimeMs = new Date(marketData.closeDate).getTime() || Date.now() + 86400000
      const displayVariant = marketData.format === '1v1' ? '1v1' : marketData.format === 'multi' ? 'standard' : 'binary'
      const marketType = (marketData.format === 'multi' || marketData.format === '1v1') ? 'multi_option' : 'binary'
      const targetState = marketData.status === 'Draft' ? 'draft' : 'open'

      const result = await createMarketAction({
        title: marketData.title,
        description: marketData.description || marketData.title,
        categorySlug: marketData.category,
        marketType,
        displayVariant,
        openingTime: Date.now(),
        closingTime: closeTimeMs,
        liquidity: Number(marketData.liquidity) || 50000,
        optionNames: (marketData.options || []).map((o: any) => o.title),
        optionImageUrls: (marketData.options || []).map((o: any) => o.imageUrl || undefined),
        createdBy: userId || 'admin',
        state: targetState,
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to create market.')
        return
      }

      if (marketData.suggestionId) {
        await updateSuggestionStatusAction({
          suggestionId: marketData.suggestionId,
          status: 'approved',
          convertedMarketId: result.data?.marketId,
        })
      }

      toast.success('Market published live!')
      setIsCreateMarketOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Error creating market')
    }
  }

  /** Triggered when admin confirms market resolution with ALL CAPS safeguard */
  const handleResolveMarket = async (winningOptionId: string, confirmedTitleAllCaps: string) => {
    if (!selectedResolveMarket) return
    const result = await resolveMarketAction({
      marketId: selectedResolveMarket.id,
      winningOptionId,
      confirmedTitleAllCaps,
      adminUserId: userId || 'admin',
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    toast.success('Market resolved and payouts distributed!')
  }

  /** Triggered when admin confirms pause or unpause */
  const handleConfirmPauseStateChange = async () => {
    if (!selectedPauseMarket) return
    const isCurrentlyPaused = selectedPauseMarket.status.toLowerCase() === 'paused'
    const result = isCurrentlyPaused
      ? await unpauseMarketAction(selectedPauseMarket.id)
      : await pauseMarketAction(selectedPauseMarket.id)

    if (!result.success) {
      throw new Error(result.error)
    }

    toast.success(`Market ${isCurrentlyPaused ? 'unpaused' : 'paused'} successfully!`)
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
  }

  /** Triggered when admin rejects a market suggestion */
  const handleRejectSuggestion = async (suggestionId: string) => {
    try {
      const result = await updateSuggestionStatusAction({
        suggestionId,
        status: 'rejected',
        rejectionReason: 'Admin rejected suggestion',
      })
      if (!result.success) {
        toast.error(result.error || 'Failed to reject suggestion.')
        return
      }
      toast.success('Market suggestion rejected.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject suggestion.')
    }
  }

  /** Triggered when admin approves or rejects a withdrawal */
  const handleWithdrawalAction = async (
    withdrawalId: string,
    action: 'approve' | 'reject',
    reason?: string
  ) => {
    const target = dbWithdrawals.find((w: any) => w.id === withdrawalId)
    if (!target) return

    if (action === 'reject') {
      const result = await rejectWithdrawalAction(
        target.userId,
        target.grossAmount,
        target.id,
        userId || 'admin'
      )
      if (!result.success) {
        toast.error(result.error || 'Failed to reject withdrawal.')
        return
      }

      toast.success('Withdrawal request rejected and funds refunded to user available balance.')
    } else {
      const result = await approveWithdrawalAction({ withdrawalId })
      if (!result.success) {
        toast.error(result.error || 'Failed to approve withdrawal.')
        return
      }

      toast.success('Withdrawal request approved.')
    }
  }

  /** Triggered when admin adds a new category */
  const handleAddCategory = async (label: string) => {
    try {
      const result = await createCategoryAction(label)
      if (!result.success) {
        toast.error(result.error || 'Failed to add category.')
        return
      }
      toast.success(`Category "${label}" added successfully!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add category.')
    }
  }

  return (
    <AdminLayout>
      <div className="dark flex flex-col gap-6 text-text-primary">
        {/* Section Header with Wipe Button */}
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Admin Control Center"
            description="Manage prediction markets, review withdrawal requests, process user suggestions, and audit platform activity."
            className="mb-0"
          />
          <button
            onClick={() => setIsFinancialWipeOpen(true)}
            className="px-3 py-1.5 text-xs font-medium bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/30 rounded-lg hover:bg-[var(--danger)]/10 transition-colors"
          >
            Wipe Demo State
          </button>
        </div>

        {/* Top KPI Summary Cards */}
        <AdminSummaryCards
          totalPlatformBalance={totalVolumeAllMarkets}
          activeMarketsCount={markets.filter((m) => m.status === "Open").length}
          pendingWithdrawalsCount={pendingWithdrawalsCount}
          pendingWithdrawalsAmount={pendingWithdrawalsAmount}
          pendingSuggestionsCount={pendingSuggestionsCount}
          platformRevenue={platformRevenue}
          totalSeedLiquidity={totalSeedLiquidity}
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
            <Lightbulb className="h-4 w-4" /> Suggestions ({pendingSuggestionsCount})
          </button>

          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "withdrawals"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Wallet className="h-4 w-4" /> Withdrawals ({pendingWithdrawalsCount})
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
              onOpenPauseDialog={(market) => {
                setSelectedPauseMarket(market)
                setIsPauseMarketOpen(true)
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
        marketTitle={selectedResolveMarket?.title ?? ""}
        options={(selectedResolveMarket?.options ?? []).map((o) => ({ id: o.id, name: o.title }))}
        onConfirmResolve={handleResolveMarket}
      />

      <PauseMarketDialog
        isOpen={isPauseMarketOpen}
        onClose={() => setIsPauseMarketOpen(false)}
        marketTitle={selectedPauseMarket?.title ?? ""}
        currentState={selectedPauseMarket?.status?.toLowerCase() ?? "open"}
        onConfirmPauseStateChange={handleConfirmPauseStateChange}
      />

      <WithdrawalActionDialog
        isOpen={isWithdrawalActionOpen}
        onClose={() => setIsWithdrawalActionOpen(false)}
        withdrawal={selectedWithdrawal}
        onAction={handleWithdrawalAction}
      />

      <FinancialWipeDialog
        isOpen={isFinancialWipeOpen}
        onClose={() => setIsFinancialWipeOpen(false)}
        status="idle"
        setStatus={() => {}}
      />
    </AdminLayout>
  )
}
