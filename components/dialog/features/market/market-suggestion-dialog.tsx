"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"

interface MarketSuggestionDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

export function MarketSuggestionDialog({
  isOpen,
  onClose,
  status,
}: MarketSuggestionDialogProps) {
  const dialog = useDialog()
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsSubmitting(false)
    onClose()

    setTitle("")
    setDescription("")

    await dialog.success({
      title: "Market Suggestion Submitted!",
      description: "Thank you! Your market suggestion has been sent to our admin team for review.",
    })
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Suggest a Market"
      description="Have an idea for a prediction market? Submit it for admin review."
    >
      <DialogHeader className="p-0 mb-4">
        <DialogTitle className="text-xl font-bold">Suggest a Market</DialogTitle>
        <DialogDescription>
          Have an idea for a prediction market? Submit it for admin review.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title / Question */}
        <div className="space-y-1.5">
          <Label htmlFor="suggestion-title" className="text-sm font-semibold text-[var(--text-primary)]">
            Market Question / Title *
          </Label>
          <Input
            id="suggestion-title"
            placeholder="e.g. Who will win BBNaija Season 10?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="h-10 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] focus-visible:ring-primary"
          />
        </div>

        {/* Description / Details */}
        <div className="space-y-1.5">
          <Label htmlFor="suggestion-desc" className="text-sm font-semibold text-[var(--text-primary)]">
            Description / Details
          </Label>
          <Textarea
            id="suggestion-desc"
            placeholder="Provide any context, rules, or details about your suggestion..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] text-sm focus-visible:ring-primary resize-none"
          />
        </div>

        <DialogFooter className="mt-2 p-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-1/3 rounded-xl border-[var(--border-default)] text-[var(--text-secondary)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="w-full sm:w-2/3 bg-primary text-white hover:bg-primary-hover rounded-xl font-bold"
          >
            {isSubmitting ? "Submitting..." : "Submit Suggestion"}
          </Button>
        </DialogFooter>
      </form>
    </ResponsiveWrapper>
  )
}

export default MarketSuggestionDialog
