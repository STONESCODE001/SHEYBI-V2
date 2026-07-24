"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { Share2, Copy, Check } from "lucide-react"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  payload: {
    marketTitle: string
    linkUrl?: string
  }
  status: DialogStatus
}

export function ShareDialog({ isOpen, onClose, payload, status }: ShareDialogProps) {
  const [copied, setCopied] = React.useState(false)
  const [shareSupported, setShareSupported] = React.useState(false)
  const fallbackUrl = payload.linkUrl || (typeof window !== "undefined" ? window.location.href : "https://sheybi.com/markets/1")

  React.useEffect(() => {
    if (typeof navigator !== "undefined" && !!(navigator as any).share) {
      setShareSupported(true)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fallbackUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const handleSystemShare = async () => {
    try {
      await (navigator as any).share({
        title: "Sheybi Prediction Market",
        text: payload.marketTitle,
        url: fallbackUrl,
      })
      onClose()
    } catch (err) {
      console.log("Web Share cancelled or failed", err)
    }
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Share Market"
      description="Share this prediction market with others."
    >
      <DialogHeader className="p-0">
        <DialogTitle className="text-xl">Share Market</DialogTitle>
        <DialogDescription>Let others prediction-trade on this market topic.</DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-4">
        {/* Title display */}
        <div className="p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] text-sm text-[var(--text-secondary)] font-medium">
          {payload.marketTitle}
        </div>

        {/* Copy link input */}
        <div className="flex gap-2 items-center">
          <Input
            readOnly
            value={fallbackUrl}
            className="flex-1 h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] font-mono text-xs text-[var(--text-muted)] focus-visible:ring-0"
          />
          <Button
            onClick={handleCopy}
            className="h-11 rounded-xl bg-primary hover:bg-primary-hover text-white px-4 shrink-0"
          >
            {copied ? <Check className="size-5 text-[var(--state-success)]" /> : <Copy className="size-5" />}
          </Button>
        </div>

        {shareSupported && (
          <Button
            onClick={handleSystemShare}
            className="w-full h-11 rounded-xl border border-primary text-primary hover:bg-primary/5 bg-transparent font-medium mt-2 gap-2 flex items-center justify-center"
          >
            <Share2 className="size-4" />
            <span>Share via Device Menu</span>
          </Button>
        )}
      </div>

      <DialogFooter className="mt-4 p-0">
        <Button onClick={onClose} className="w-full text-[var(--text-secondary)] border-[var(--border-default)]" variant="outline">
          Close
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default ShareDialog
