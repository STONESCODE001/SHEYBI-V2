"use client"

import React, { useState } from "react"
import { ResponsiveDialog } from "@/components/dialog/responsive-wrapper"
import { createPromoterAction } from "@/lib/actions/promoter-actions"
import { Megaphone, Link as LinkIcon, Sparkles } from "lucide-react"
import { toast } from "sonner"

export interface CreatePromoterDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

/**
 * CreatePromoterDialog Component
 * Modal form allowing administrators to create a new influencer/promoter referral link.
 */
export function CreatePromoterDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreatePromoterDialogProps) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [notes, setNotes] = useState("")
  const [isCustomSlug, setIsCustomSlug] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-generate slug from name unless manually customized
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!isCustomSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
      setSlug(generated)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlug(true)
    const val = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
    setSlug(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Please enter the promoter's name.")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await createPromoterAction({
        name: name.trim(),
        slug: slug.trim() || undefined,
        notes: notes.trim() || undefined,
      })

      if (!res.success) {
        setError(res.error || "Failed to create promoter.")
        return
      }

      toast.success(`Promoter "${name}" created! Link: sheybi.app/f/${res.slug}`)
      setName("")
      setSlug("")
      setNotes("")
      setIsCustomSlug(false)
      onClose()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeSlug = slug || "promoter"

  return (
    <ResponsiveDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Influencer / Promoter"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {/* Info Banner */}
        <div className="p-3 bg-surface-container border border-border rounded-xl flex items-start gap-2.5 text-xs text-text-secondary">
          <Megaphone className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <div>
            <p className="font-bold text-text-primary">Referral Link Generation</p>
            <p className="mt-0.5 text-text-muted">
              Creates a custom short link for your promoter. Landing hits to this path log automatically in Vercel analytics, and signups attach to their account.
            </p>
          </div>
        </div>

        {/* Live Link Preview Card */}
        <div className="p-3 bg-bg-surface-secondary border border-border rounded-xl space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <LinkIcon className="w-3 h-3 text-primary" /> Generated Link Preview
          </label>
          <div className="font-mono text-xs font-bold text-primary break-all flex items-center gap-1">
            <span>https://sheybi.app/f/</span>
            <span className="text-accent-yellow underline">{activeSlug}</span>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-xs font-bold text-text-primary mb-1">
            Promoter / Campaign Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Mr Faithman or BBNaija Updates"
            className="w-full px-3 py-2 bg-bg-base border border-border rounded-xl text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Custom Slug Field */}
        <div>
          <label className="block text-xs font-bold text-text-primary mb-1">
            Custom Link Slug <span className="text-text-muted text-[10px]">(Alphanumeric, dashes)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="e.g. mrfaithman"
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-xl text-sm font-mono font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Notes Field */}
        <div>
          <label className="block text-xs font-bold text-text-primary mb-1">
            Notes / Contact Details <span className="text-text-muted text-[10px]">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. @mrfaithman on X / 10% commission terms"
            className="w-full px-3 py-2 bg-bg-base border border-border rounded-xl text-xs font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-xl text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary border border-border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isSubmitting ? "Creating Link..." : "Create Promoter Link"}
          </button>
        </div>
      </form>
    </ResponsiveDialog>
  )
}
