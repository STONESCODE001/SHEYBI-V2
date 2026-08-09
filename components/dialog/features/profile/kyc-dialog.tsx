"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"
import { Loader2, ShieldCheck, Upload, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { submitKycAction } from "@/lib/actions/kyc-actions"
import { useKyc } from "@/lib/hooks/use-kyc"
import { uploadInstantFile } from "@/lib/storage"
import { useUser } from "@clerk/nextjs"

interface KYCDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

type KycMode = "nin" | "document"

export function KYCDialog({ isOpen, onClose, status, setStatus }: KYCDialogProps) {
  const dialog = useDialog()
  const { user } = useUser()
  const { kycRecord, kycStatus, isLoading: kycLoading } = useKyc()

  const [mode, setMode] = React.useState<KycMode>("nin")
  const [nin, setNin] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setNin("")
      setFile(null)
      setPreviewUrl(null)
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!selected.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP).")
      return
    }

    setError(null)
    setFile(selected)
    const localUrl = URL.createObjectURL(selected)
    setPreviewUrl(localUrl)
  }

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    try {
      let documentImageUrl: string | undefined

      if (mode === "document") {
        if (!file) {
          setError("Please select a document image to upload.")
          setIsSubmitting(false)
          return
        }

        const path = `kyc/${user?.id || "user"}/${Date.now()}_${file.name}`
        try {
          const uploadRes = await uploadInstantFile(path, file)
          documentImageUrl = uploadRes.url
        } catch (err) {
          console.warn("Storage upload failed, reading file as data URL fallback:", err)
        }

        if (!documentImageUrl) {
          // Convert file to base64 Data URL so submission never sends empty string
          documentImageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        }
      } else {
        if (nin.length !== 11 || !/^\d{11}$/.test(nin)) {
          setError("Please enter a valid 11-digit NIN.")
          setIsSubmitting(false)
          return
        }
      }

      const res = await submitKycAction({
        nin: mode === "nin" ? nin : undefined,
        documentImageUrl,
        legalName: user?.fullName || user?.firstName || undefined,
      })

      if (!res.success) {
        setError(res.error || "KYC submission failed.")
        setIsSubmitting(false)
        return
      }

      onClose()
      await dialog.success({
        title: "Identity Submitted",
        description: "Your identification has been submitted for review. Withdrawals will be enabled once approved.",
      })
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during submission.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isNinValid = nin.length === 11 && /^\d{11}$/.test(nin)
  const isDocValid = !!file
  const canSubmit = !isSubmitting && (mode === "nin" ? isNinValid : isDocValid)

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Identity Verification (KYC)"
      description="Submit your NIN or ID document to verify your account."
    >
      <DialogHeader className="p-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-[var(--accent-yellow)]" />
          <DialogTitle className="text-xl">Identity Verification</DialogTitle>
        </div>
        <DialogDescription>
          Verify your identity to unlock withdrawal capabilities on Sheybi.
        </DialogDescription>
      </DialogHeader>

      {/* If user already has an active status */}
      {kycStatus === "approved" ? (
        <div className="mt-4 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-3">
          <CheckCircle2 className="size-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Verification Active</h3>
          <p className="text-xs text-slate-300">
            Your identity has been verified. You have full access to deposit, trade, and withdraw funds.
          </p>
          <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            Close
          </Button>
        </div>
      ) : kycStatus === "pending" ? (
        <div className="mt-4 p-5 rounded-2xl border border-slate-500/30 bg-slate-500/10 text-center space-y-3">
          <Clock className="size-10 text-slate-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">Under Review</h3>
          <p className="text-xs text-slate-300">
            Your identification submission is currently being reviewed by our compliance team. You will be notified once approved.
          </p>
          <Button onClick={onClose} variant="outline" className="w-full rounded-xl">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {kycStatus === "rejected" && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5">
              <AlertCircle className="size-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200">
                <strong className="font-bold text-white block">Previous Submission Rejected:</strong>
                {kycRecord?.rejectionReason || "Identity document could not be verified."} Please resubmit valid details.
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)]">
            <button
              type="button"
              onClick={() => setMode("nin")}
              className={cn(
                "py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all",
                mode === "nin"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-default)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              <FileText className="size-4" /> NIN Number
            </button>
            <button
              type="button"
              onClick={() => setMode("document")}
              className={cn(
                "py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all",
                mode === "document"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-default)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              <Upload className="size-4" /> Document Upload
            </button>
          </div>

          {/* NIN Mode Input */}
          {mode === "nin" && (
            <div className="space-y-2">
              <Label htmlFor="kyc-nin" className="text-xs font-medium text-[var(--text-secondary)]">
                National Identification Number (NIN)
              </Label>
              <Input
                id="kyc-nin"
                type="text"
                inputMode="numeric"
                maxLength={11}
                placeholder="Enter 11-digit NIN"
                value={nin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 11)
                  setNin(val)
                }}
                className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] font-mono text-base tracking-widest focus-visible:ring-[var(--border-active)]"
              />
              <p className="text-[11px] text-[var(--text-muted)]">
                {nin.length}/11 digits entered. Your NIN will be securely verified.
              </p>
            </div>
          )}

          {/* Document Image Mode Input */}
          {mode === "document" && (
            <div className="space-y-3">
              <Label htmlFor="kyc-doc-file" className="text-xs font-medium text-[var(--text-secondary)] block">
                ID Document Image (Voter's Card, National ID, Driver's License, Passport)
              </Label>

              <div className="relative">
                <input
                  id="kyc-doc-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="kyc-doc-file"
                  className={cn(
                    "flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-secondary)] cursor-pointer hover:border-primary/50 transition-colors text-center",
                    file && "border-primary bg-primary/5"
                  )}
                >
                  <Upload className="size-6 text-[var(--text-muted)] mb-2" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {file ? file.name : "Click to select document photo"}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] mt-1">
                    Supports JPG, PNG, WEBP (Max 5MB)
                  </span>
                </label>
              </div>

              {previewUrl && (
                <div className="relative w-full h-36 rounded-xl border border-[var(--border-default)] overflow-hidden bg-black/40">
                  {/* eslint-disable-next-html-element-suppression */}
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {error && <p className="text-xs font-semibold text-danger">{error}</p>}

          <DialogFooter className="p-0 mt-2">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-11 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Submitting Verification...
                </span>
              ) : (
                "Submit Identity Verification"
              )}
            </Button>
          </DialogFooter>
        </form>
      )}
    </ResponsiveWrapper>
  )
}

export default KYCDialog
