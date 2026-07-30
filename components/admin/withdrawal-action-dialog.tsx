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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-[#1E2A3F] bg-[#0F1727] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2A3F] p-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#FFC107]" />
            <h2 className="text-lg font-bold text-white">Review Withdrawal Request</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#141E30] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Amount Badge */}
          <div className="rounded-xl border border-[#1E2A3F] bg-[#0B0E14] p-4 text-center">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Withdrawal Amount</span>
            <div className="text-3xl font-extrabold text-[#FFC107] mt-1">
              {formatNaira(withdrawal.amount)}
            </div>
          </div>

          {/* User & Bank Account Details */}
          <div className="rounded-xl border border-[#1E2A3F] bg-[#0B0E14] p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-white">
              <User className="h-4 w-4 text-[#FFC107] shrink-0" />
              <div>
                <span className="font-semibold">{withdrawal.userName}</span>
                <span className="text-xs text-gray-400 ml-2">({withdrawal.userEmail})</span>
              </div>
            </div>

            <div className="border-t border-[#1E2A3F] pt-2.5 flex items-start gap-2 text-sm text-white">
              <Building2 className="h-4 w-4 text-[#FFC107] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-semibold">{withdrawal.bankName}</div>
                <div className="text-xs font-mono text-gray-300">
                  Account: <strong className="text-white">{withdrawal.accountNumber}</strong> ({withdrawal.accountName})
                </div>
              </div>
            </div>
          </div>

          {/* Action Selector: Approve vs Reject */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveMode("approve")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                activeMode === "approve"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-[#1E2A3F] bg-[#0B0E14] text-gray-400 hover:border-emerald-500/40"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" /> Approve Payout
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("reject")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                activeMode === "reject"
                  ? "border-rose-500 bg-rose-500/10 text-rose-400"
                  : "border-[#1E2A3F] bg-[#0B0E14] text-gray-400 hover:border-rose-500/40"
              }`}
            >
              <XCircle className="h-4 w-4" /> Reject Request
            </button>
          </div>

          {/* Rejection Reason Input */}
          {activeMode === "reject" && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Rejection Reason (Sent to User) *
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Account name mismatch with verified KYC profile..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-[#1E2A3F] bg-[#0B0E14] px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1E2A3F] p-5 bg-[#0F1727] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#1E2A3F] px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-[#141E30]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all ${
              activeMode === "approve"
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-rose-500 text-white hover:bg-rose-600"
            }`}
          >
            {activeMode === "approve" ? "Approve Payout" : "Reject & Refund User"}
          </button>
        </div>
      </div>
    </div>
  )
}
