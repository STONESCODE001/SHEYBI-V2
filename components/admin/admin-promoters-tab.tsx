"use client"

import React, { useState } from "react"
import { Megaphone, Copy, Check, Plus, PauseCircle, PlayCircle, Trash2, Users, DollarSign, ExternalLink } from "lucide-react"
import { togglePromoterStatusAction, deletePromoterAction } from "@/lib/actions/promoter-actions"
import { toast } from "sonner"

export interface PromoterItem {
  id: string
  name: string
  slug: string
  status: "active" | "paused"
  notes?: string
  totalSignups: number
  totalDepositedVolume: number
  createdAt: number
}

export interface AdminPromotersTabProps {
  promoters: PromoterItem[]
  onOpenCreateDialog: () => void
  onRefresh?: () => void
}

/**
 * AdminPromotersTab Component
 * Platform operator dashboard for creating and managing influencer referral links (/f/[slug]),
 * monitoring signups, and reviewing conversion performance.
 */
export function AdminPromotersTab({
  promoters,
  onOpenCreateDialog,
  onRefresh,
}: AdminPromotersTabProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sheybi.app"
    const fullUrl = `${origin}/f/${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedSlug(slug)
    toast.success(`Copied ${fullUrl} to clipboard!`)
    setTimeout(() => setCopiedSlug(null), 2500)
  }

  const handleToggleStatus = async (promoter: PromoterItem) => {
    const nextStatus = promoter.status === "active" ? "paused" : "active"
    try {
      setLoadingActionId(promoter.id)
      const res = await togglePromoterStatusAction(promoter.id, nextStatus)
      if (!res.success) {
        toast.error(res.error || "Failed to update status")
        return
      }
      toast.success(`Promoter "${promoter.name}" is now ${nextStatus}`)
      onRefresh?.()
    } catch (err: any) {
      toast.error(err.message || "Failed to update promoter status")
    } finally {
      setLoadingActionId(null)
    }
  }

  const handleDelete = async (promoter: PromoterItem) => {
    if (!confirm(`Are you sure you want to delete promoter "${promoter.name}"?`)) return
    try {
      setLoadingActionId(promoter.id)
      const res = await deletePromoterAction(promoter.id)
      if (!res.success) {
        toast.error(res.error || "Failed to delete promoter")
        return
      }
      toast.success(`Deleted promoter "${promoter.name}"`)
      onRefresh?.()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete promoter")
    } finally {
      setLoadingActionId(null)
    }
  }

  const filteredPromoters = promoters.filter((p) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      p.name.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query) ||
      (p.notes && p.notes.toLowerCase().includes(query))
    )
  })

  const totalActive = promoters.filter((p) => p.status === "active").length
  const totalSignups = promoters.reduce((acc, p) => acc + (p.totalSignups || 0), 0)
  const totalVolume = promoters.reduce((acc, p) => acc + (p.totalDepositedVolume || 0), 0)

  return (
    <div className="space-y-6">
      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Active Promoters */}
        <div className="rounded-2xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-text-muted">Active Promoters</span>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-text-primary">
            {totalActive} <span className="text-xs font-semibold text-text-muted">/ {promoters.length} total</span>
          </div>
        </div>

        {/* Card 2: Total Referral Signups */}
        <div className="rounded-2xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-text-muted">Referred Sign-ups</span>
            <div className="rounded-xl bg-success/10 p-2 text-success">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-text-primary">{totalSignups}</div>
        </div>

        {/* Card 3: Total Referred Deposit Volume */}
        <div className="rounded-2xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-text-muted">Referred Deposit Volume</span>
            <div className="rounded-xl bg-warning/10 p-2 text-warning">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-text-primary">{formatNaira(totalVolume)}</div>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or slug..."
            className="px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary w-64"
          />
        </div>

        <button
          onClick={onOpenCreateDialog}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary-hover shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Add Promoter Link
        </button>
      </div>

      {/* Promoters Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead className="border-b border-border bg-bg-surface-secondary text-xs uppercase text-text-muted font-bold">
              <tr>
                <th className="px-4 py-3 font-semibold">Promoter</th>
                <th className="px-4 py-3 font-semibold">Short Link</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Sign-ups</th>
                <th className="px-4 py-3 font-semibold">Referred Deposits</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPromoters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted font-medium">
                    No promoter links found. Click "+ Add Promoter Link" to create one.
                  </td>
                </tr>
              ) : (
                filteredPromoters.map((item) => {
                  const isCopied = copiedSlug === item.slug
                  const isLoading = loadingActionId === item.id
                  const isPaused = item.status === "paused"

                  return (
                    <tr key={item.id} className="hover:bg-bg-hover transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="font-bold text-text-primary flex items-center gap-1.5">
                          {item.name}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-text-muted font-normal max-w-xs truncate">
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-bg-base border border-border rounded-lg text-xs font-mono font-bold text-primary">
                            sheybi.app/f/{item.slug}
                          </code>
                          <button
                            onClick={() => handleCopyLink(item.slug)}
                            title="Copy full referral link"
                            className="p-1.5 rounded-lg border border-border bg-bg-surface hover:bg-bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            isPaused
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-success/10 text-success border-success/20"
                          }`}
                        >
                          {isPaused ? "Paused" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-text-primary">
                        {item.totalSignups || 0}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-text-primary">
                        {formatNaira(item.totalDepositedVolume || 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={isLoading}
                            title={isPaused ? "Unpause Promoter" : "Pause Promoter"}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-50 ${
                              isPaused
                                ? "border-success/30 text-success hover:bg-success/10"
                                : "border-warning/30 text-warning hover:bg-warning/10"
                            }`}
                          >
                            {isPaused ? (
                              <PlayCircle className="w-4 h-4" />
                            ) : (
                              <PauseCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={isLoading}
                            title="Delete Promoter"
                            className="p-1.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
