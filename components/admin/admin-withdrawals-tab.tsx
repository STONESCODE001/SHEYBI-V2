"use client"

import * as React from "react"
import { Wallet, ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react"

/**
 * Explanatory Interface: WithdrawalItem
 * Represents a user withdrawal request item.
 */
export interface WithdrawalItem {
  id: string
  userName: string
  userEmail: string
  bankName: string
  accountNumber: string
  accountName: string
  amount: number
  requestDate: string
  status: "Pending" | "Approved" | "Rejected"
}

/**
 * Explanatory Interface: AdminWithdrawalsTabProps
 * Props for rendering the Withdrawals tab workspace.
 */
export interface AdminWithdrawalsTabProps {
  withdrawals: WithdrawalItem[]
  onOpenActionDialog: (withdrawal: WithdrawalItem) => void
}

/**
 * Explanatory Component: AdminWithdrawalsTab
 * Table view displaying all user withdrawal requests.
 * Enables platform operators to review bank account credentials and process payouts.
 */
export function AdminWithdrawalsTab({
  withdrawals,
  onOpenActionDialog,
}: AdminWithdrawalsTabProps) {
  /** Formats currency to Nigerian Naira (₦) */
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const getStatusBadge = (status: WithdrawalItem["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-success/10 text-success border-success/20"
      case "Rejected":
        return "bg-danger/10 text-danger border-danger/20"
      case "Pending":
        return "bg-warning/10 text-warning border-warning/20"
      default:
        return "bg-surface-container text-text-muted border-border"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">
          User Withdrawal Requests ({withdrawals.filter((w) => w.status === "Pending").length} Pending)
        </h3>
        <span className="text-xs text-gray-400">
          Manual payout approvals during MVP phase.
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1E2A3F] bg-[#0F1727] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="border-b border-[#1E2A3F] bg-[#141E30] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Bank Details</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Request Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2A3F]">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((item) => (
                  <tr key={item.id} className="hover:bg-[#141E30]/60 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="font-semibold text-white">{item.userName}</div>
                      <div className="text-xs text-gray-400">{item.userEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-xs text-white">{item.bankName}</div>
                      <div className="text-xs font-mono text-gray-300">{item.accountNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {formatNaira(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{item.requestDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(item.status)}`}>
                        {item.status === "Pending" && <Clock className="h-3 w-3" />}
                        {item.status === "Approved" && <CheckCircle2 className="h-3 w-3" />}
                        {item.status === "Rejected" && <XCircle className="h-3 w-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === "Pending" ? (
                        <button
                          onClick={() => onOpenActionDialog(item)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#FFC107] text-[#0B0E14] px-3 py-1.5 text-xs font-bold hover:bg-[#E5AD00] shadow-xs transition-all"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Review Request
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
