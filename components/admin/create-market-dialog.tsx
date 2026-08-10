"use client"

import * as React from "react"
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"

/**
 * Explanatory Interface: MarketOptionInput
 * Represents an individual outcome within a market (e.g., "Yes", "No", or candidate names).
 */
export interface MarketOptionInput {
  id: string
  title: string
  initialProbability: number // Initial probability percentage (e.g., 60 for 60%)
  imageUrl?: string // Optional contestant / option image URL (self-hosted link)
}

/**
 * Explanatory Interface: CreateMarketDialogProps
 * Configuration props passed to control modal visibility and initial pre-filled values.
 */
export interface CreateMarketDialogProps {
  /** Controls whether the modal dialog is open */
  isOpen: boolean
  /** Callback fired when the user closes the modal */
  onClose: () => void
  /** Optional pre-filled suggestion data if accepted from the suggestions queue */
  initialData?: {
    suggestionId?: string
    title?: string
    description?: string
    category?: string
  }
  /** Available categories for assigning to the market */
  categories: { id: string; label: string }[]
  /** Callback fired when the admin submits the new market form */
  onSubmitMarket: (marketData: any) => void
}

/**
 * Explanatory Component: CreateMarketDialog
 * Modal dialog for platform administrators to configure and launch new prediction markets.
 * Features binary, 1v1 matchup, & multi-option modes, probability checksum validation (must sum to 100%),
 * configurable seed liquidity (₦), contestant image URLs, and pre-fill support from community suggestions.
 */
export function CreateMarketDialog({
  isOpen,
  onClose,
  initialData,
  categories,
  onSubmitMarket,
}: CreateMarketDialogProps) {
  // Form State Variables with clear meanings:
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [resolutionSource, setResolutionSource] = React.useState("")
  const [closeDate, setCloseDate] = React.useState("")
  const [liquidity, setLiquidity] = React.useState<number>(50000)
  const [format, setFormat] = React.useState<"binary" | "1v1" | "multi">("binary")
  const [isFeatured, setIsFeatured] = React.useState<boolean>(false)
  const [options, setOptions] = React.useState<MarketOptionInput[]>([
    { id: "1", title: "Yes", initialProbability: 50 },
    { id: "2", title: "No", initialProbability: 50 },
  ])

  // Sync pre-filled data when opening from a market suggestion
  React.useEffect(() => {
    if (initialData) {
      if (initialData.title) setTitle(initialData.title)
      if (initialData.description) setDescription(initialData.description)
      if (initialData.category) setCategory(initialData.category)
    }
  }, [initialData])

  if (!isOpen) return null

  // Calculate the sum of probabilities to enforce the 100% invariant rule
  const totalProbability = options.reduce((sum, opt) => sum + (Number(opt.initialProbability) || 0), 0)
  const isProbabilityValid = Math.abs(totalProbability - 100) < 0.01

  /**
   * Switches format between Binary (Yes/No), 1v1 Matchup, and Multi-Option
   */
  const handleFormatChange = (newFormat: "binary" | "1v1" | "multi") => {
    setFormat(newFormat)
    if (newFormat === "binary") {
      setOptions([
        { id: "1", title: "Yes", initialProbability: 50 },
        { id: "2", title: "No", initialProbability: 50 },
      ])
    } else if (newFormat === "1v1") {
      setOptions([
        { id: "1", title: "Player 1", initialProbability: 50 },
        { id: "2", title: "Player 2", initialProbability: 50 },
      ])
    } else {
      setOptions([
        { id: "1", title: "Seyi", initialProbability: 33 },
        { id: "2", title: "Venita", initialProbability: 33 },
        { id: "3", title: "Adekunle", initialProbability: 34 },
      ])
    }
  }

  /**
   * Adds a new option line item for multi-option markets
   */
  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: Date.now().toString(), title: `Option ${prev.length + 1}`, initialProbability: 0 },
    ])
  }

  /**
   * Removes an option line item
   */
  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      toast.error("A market must contain at least 2 options!")
      return
    }
    setOptions((prev) => prev.filter((opt) => opt.id !== id))
  }

  /**
   * Updates an option's title, probability, or imageUrl
   */
  const handleOptionChange = (
    id: string,
    field: "title" | "initialProbability" | "imageUrl",
    value: string | number
  ) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    )
  }

  /**
   * Form submission handler for saving as Draft or Publishing
   */
  const handleSubmit = (isDraft: boolean) => {
    // Validation Checks:
    if (!title.trim()) {
      toast.error("Please enter a market title!")
      return
    }
    if (!category) {
      toast.error("Please select a category!")
      return
    }
    if (!closeDate) {
      toast.error("Please select a closing date and time!")
      return
    }
    if (!isProbabilityValid) {
      toast.error(`Total initial probability must equal 100%. Current total: ${totalProbability}%`)
      return
    }

    const payload = {
      title,
      description: description || title,
      category,
      resolutionSource,
      closeDate,
      liquidity: Number(liquidity) || 50000,
      format,
      isFeatured,
      options,
      status: isDraft ? "Draft" : "Open",
      suggestionId: initialData?.suggestionId,
    }

    onSubmitMarket(payload)
    toast.success(isDraft ? "Market saved as Draft!" : "Market published live for trading!")
    onClose()
  }

  return (
    <div className="dark fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-bg-surface text-text-primary shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg-surface-secondary p-5 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-text-primary">
              {initialData?.suggestionId ? "Create Market from Suggestion" : "Create New Prediction Market"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Market Title */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Market Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Will Team A win the BBNaija Task on Friday?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Description & Context
            </label>
            <textarea
              rows={3}
              placeholder="Provide background info and rules for how users should evaluate this prediction..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-medium"
            />
          </div>

          {/* Grid: Category & Close Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none font-medium"
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                Trading Close Date & Time *
              </label>
              <input
                type="datetime-local"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Resolution Source & Initial Seed Liquidity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                Resolution Source (Source of Truth)
              </label>
              <input
                type="text"
                placeholder="e.g. Official Twitter/X Broadcast or DSTV show"
                value={resolutionSource}
                onChange={(e) => setResolutionSource(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                Initial Seed Liquidity (₦)
              </label>
              <input
                type="number"
                step="5000"
                min="10000"
                placeholder="50000"
                value={liquidity}
                onChange={(e) => setLiquidity(parseInt(e.target.value) || 50000)}
                className="w-full rounded-xl border border-border bg-bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Market Format Selector */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Market Format
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleFormatChange("binary")}
                className={`rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  format === "binary"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border bg-bg-surface-secondary text-text-secondary hover:border-primary/40"
                }`}
              >
                Binary (Yes / No)
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange("1v1")}
                className={`rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  format === "1v1"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border bg-bg-surface-secondary text-text-secondary hover:border-primary/40"
                }`}
              >
                1v1 Matchup
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange("multi")}
                className={`rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  format === "multi"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border bg-bg-surface-secondary text-text-secondary hover:border-primary/40"
                }`}
              >
                Multi-Option List
              </button>
            </div>
          </div>

          {/* Featured / Trending Toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-surface-secondary p-3.5">
            <input
              type="checkbox"
              id="isFeaturedToggle"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-bg-surface"
            />
            <label htmlFor="isFeaturedToggle" className="text-xs font-bold text-text-primary cursor-pointer select-none">
              Star as Featured / Trending Market (Highlight on Homepage & Category Tabs)
            </label>
          </div>

          {/* Outcome Options Editor, Initial Probabilities & Image URLs */}
          <div className="rounded-2xl border border-border bg-bg-surface-secondary p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                {format === "1v1" ? "1v1 Contestants & Avatar Links" : "Outcomes & Initial Probabilities (%)"}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {isProbabilityValid ? (
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-4 w-4" /> Total: 100%
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-danger">
                    <AlertCircle className="h-4 w-4" /> Total: {totalProbability}% (Must equal 100%)
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex flex-col gap-2 rounded-xl border border-border bg-bg-base p-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={format === "1v1" ? `Contestant ${idx + 1} Name` : "Outcome Title"}
                      value={opt.title}
                      onChange={(e) => handleOptionChange(opt.id, "title", e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-medium"
                    />
                    <div className="flex items-center gap-1 w-28">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={opt.initialProbability}
                        onChange={(e) => handleOptionChange(opt.id, "initialProbability", parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-border bg-bg-surface-secondary px-3 py-2 text-sm text-text-primary text-right focus:border-primary focus:outline-none font-medium"
                      />
                      <span className="text-xs font-bold text-text-muted">%</span>
                    </div>
                    {format === "multi" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="rounded-lg p-2 text-danger hover:bg-danger-soft/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {/* Image URL input for ALL options in ALL market formats */}
                  <input
                    type="url"
                    placeholder="Optional Option Image URL (e.g. https://images.unsplash.com/...)"
                    value={opt.imageUrl || ""}
                    onChange={(e) => handleOptionChange(opt.id, "imageUrl", e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg-surface-secondary px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-medium"
                  />
                </div>
              ))}
            </div>

            {format === "multi" && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Outcome Option
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border p-5 bg-bg-surface-secondary rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-text-secondary hover:bg-bg-hover"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="rounded-xl border border-primary text-primary px-4 py-2.5 text-sm font-bold hover:bg-primary/10 transition-all"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-bold hover:bg-primary-hover shadow-xs transition-all"
            >
              Publish Live
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
