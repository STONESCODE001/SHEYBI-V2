"use client"

import * as React from "react"
import { X, CheckCircle2, XCircle, Building2, User, Wallet } from "lucide-react"
import { toast } from "sonner"

/**
 * Explanatory Interface: WithdrawalActionDialogProps
 * Props for controlling the withdrawal request approval/rejection modal.
 */
export interface WithdrawalActionDialogProps {
  /** Controls modal visibility */
  isOpen: boolean
  /** Callback fired when modal is closed */
  onClose: () => void
  /** Target withdrawal item */
  withdrawal: {
    id: string
    userName: string
    userEmail: string
    bankName: string
    accountNumber: string
    accountName: string
    amount: number
    requestDate: string
    status: "Pending" | "Approved" | "Rejected"
  } | null
  /** Callback fired when admin approves or rejects the withdrawal */
  onAction: (withdrawalId: string, action: "approve" | "reject", reason?: string) => void
}

/**
 * Explanatory Component: WithdrawalActionDialog
 * Modal dialog for reviewing user payout requests.
 * Allows administrators to verify bank details and either approve the transfer or reject it.
 */
export function WithdrawalActionDialog({
  isOpen,
  onClose,
  withdrawal,
  onAction,
}: WithdrawalActionDialogProps) {
  const [rejectReason, setRejectReason] = React.useState("")
  const [activeMode, setActiveMode] = React.useState<"approve" | "reject">("approve")

  if (!isOpen || !withdrawal) return null

  /** Formats currency to Nigerian Naira (₦) */
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const handleConfirm = () => {
    if (activeMode === "reject" && !rejectReason.trim()) {
      toast.error("Please enter a reason for rejecting the withdrawal request!")
      return
    }

    onAction(withdrawal.id, activeMode, rejectReason)
    toast.success(
      activeMode === "approve"
        ? `Withdrawal of ${formatNaira(withdrawal.amount)} approved!`
        : `Withdrawal request rejected. Funds returned to user.`
    )
    onClose()
  }

  return (
    <div className="dark fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-bg-surface text-text-primary shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg-surface-secondary p-5 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Review Withdrawal Request</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Amount Badge */}
          <div className="rounded-xl border border-border bg-bg-surface-secondary p-4 text-center">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Withdrawal Amount</span>
            <div className="text-3xl font-extrabold text-primary mt-1">
              {formatNaira(withdrawal.amount)}
            </div>
          </div>

          {/* User & Bank Account Details */}
          <div className="rounded-xl border border-border bg-bg-surface-secondary p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-text-primary">
              <User className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="font-bold">{withdrawal.userName}</span>
                <span className="text-xs text-text-muted font-medium ml-2">({withdrawal.userEmail})</span>
              </div>
            </div>

            <div className="border-t border-border pt-2.5 flex items-start gap-2 text-sm text-text-primary">
              <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">{withdrawal.bankName}</div>
                <div className="text-xs font-mono text-text-secondary">
                  Account: <strong className="text-text-primary">{withdrawal.accountNumber}</strong> ({withdrawal.accountName})
                </div>
              </div>
            </div>
          </div>

          {/* Action Selector: Approve vs Reject */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveMode("approve")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition-all ${
                activeMode === "approve"
                  ? "border-success bg-success/10 text-success shadow-xs"
                  : "border-border bg-bg-surface-secondary text-text-muted hover:border-success/40"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" /> Approve Payout
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("reject")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition-all ${
                activeMode === "reject"
                  ? "border-danger bg-danger/10 text-danger shadow-xs"
                  : "border-border bg-bg-surface-secondary text-text-muted hover:border-danger/40"
              }`}
            >
              <XCircle className="h-4 w-4" /> Reject Request
            </button>
          </div>

          {/* Rejection Reason Input */}
          {activeMode === "reject" && (
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                Rejection Reason (Sent to User) *
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Account name mismatch with verified KYC profile..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-surface-secondary px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-danger focus:outline-none font-medium"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-5 bg-bg-surface-secondary rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-text-secondary hover:bg-bg-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold shadow-xs transition-all ${
              activeMode === "approve"
                ? "bg-success text-white hover:bg-success/90"
                : "bg-danger text-white hover:bg-danger/90"
            }`}
          >
            {activeMode === "approve" ? "Approve Payout" : "Reject & Refund User"}
          </button>
        </div>
      </div>
    </div>
  )
}
