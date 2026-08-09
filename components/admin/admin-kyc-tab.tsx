"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X, ExternalLink, ShieldAlert, FileText, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { adminApproveKycAction, adminRejectKycAction } from "@/lib/actions/kyc-actions"

export interface KycRecordItem {
  id: string
  userId: string
  verificationStatus: "pending" | "approved" | "rejected"
  nin?: string
  documentImageUrl?: string
  legalName?: string;
  documentType?: string
  submittedAt: number
  reviewedAt?: number
  reviewedBy?: string
  rejectionReason?: string
}

interface AdminKycTabProps {
  records: KycRecordItem[]
}

export function AdminKycTab({ records }: AdminKycTabProps) {
  const [rejectingId, setRejectingId] = React.useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Sort records: Pending first, then by submittedAt descending
  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => {
      if (a.verificationStatus === "pending" && b.verificationStatus !== "pending") return -1
      if (a.verificationStatus !== "pending" && b.verificationStatus === "pending") return 1
      return (b.submittedAt || 0) - (a.submittedAt || 0)
    })
  }, [records])

  const handleApprove = async (recordId: string) => {
    try {
      setIsSubmitting(true)
      const res = await adminApproveKycAction(recordId)
      if (!res.success) {
        toast.error(res.error || "Failed to approve KYC.")
        return
      }
      toast.success("KYC approved successfully!")
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve KYC.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectSubmit = async (recordId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is mandatory.")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await adminRejectKycAction(recordId, rejectionReason)
      if (!res.success) {
        toast.error(res.error || "Failed to reject KYC.")
        return
      }
      toast.success("KYC request rejected.")
      setRejectingId(null)
      setRejectionReason("")
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject KYC.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const maskNin = (ninStr?: string) => {
    if (!ninStr || ninStr.length < 4) return "*******"
    return `*******${ninStr.slice(-4)}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-text-primary">Identity Verification Requests</h3>
          <p className="text-xs text-text-muted">Review submitted user NIN numbers and document uploads.</p>
        </div>
        <Badge variant="outline" className="bg-bg-surface-secondary text-text-muted border-border font-mono">
          Total: {records.length} | Pending: {records.filter(r => r.verificationStatus === "pending").length}
        </Badge>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-bg-surface-secondary text-text-muted font-semibold uppercase">
              <tr>
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Submission Date</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Submitted Value</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    No KYC submission records found.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record) => {
                  const isPending = record.verificationStatus === "pending"
                  const isApproved = record.verificationStatus === "approved"
                  const isRejected = record.verificationStatus === "rejected"

                  return (
                    <tr key={record.id} className="hover:bg-bg-surface-secondary/50 transition-colors">
                      {/* User Identity */}
                      <td className="p-3.5 font-medium text-text-primary">
                        <div className="font-bold">{record.legalName || record.userId}</div>
                        <div className="text-[10px] font-mono text-text-muted">{record.userId}</div>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-text-muted whitespace-nowrap">
                        {record.submittedAt ? new Date(record.submittedAt).toLocaleString() : "—"}
                      </td>

                      {/* Method */}
                      <td className="p-3.5">
                        {record.nin ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-sky-400">
                            <FileText className="size-3.5" /> NIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-purple-400">
                            <ImageIcon className="size-3.5" /> Image
                          </span>
                        )}
                      </td>

                      {/* Submitted Value */}
                      <td className="p-3.5">
                        {record.nin ? (
                          <span className="font-mono font-bold tracking-wider text-text-primary bg-bg-base px-2 py-1 rounded border border-border">
                            {maskNin(record.nin)}
                          </span>
                        ) : record.documentImageUrl ? (
                          <div className="flex items-center gap-2">
                            <div className="relative size-10 rounded border border-border overflow-hidden bg-black shrink-0">
                              {/* eslint-disable-next-html-element-suppression */}
                              <img
                                src={record.documentImageUrl}
                                alt="Document thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <a
                              href={record.documentImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              View Full <ExternalLink className="size-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={
                            isApproved
                              ? "bg-success/10 text-success border-success/30 font-bold"
                              : isPending
                              ? "bg-warning/10 text-warning border-warning/30 font-bold"
                              : "bg-danger/10 text-danger border-danger/30 font-bold"
                          }
                        >
                          {record.verificationStatus.toUpperCase()}
                        </Badge>
                        {isRejected && record.rejectionReason && (
                          <p className="text-[10px] text-danger mt-1 line-clamp-1">
                            Reason: {record.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        {isPending ? (
                          rejectingId === record.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                placeholder="Rejection reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="h-8 w-40 text-xs bg-bg-base border-border"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isSubmitting}
                                onClick={() => handleRejectSubmit(record.id)}
                                className="h-8 px-2 text-xs font-bold"
                              >
                                Submit Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setRejectingId(null)
                                  setRejectionReason("")
                                }}
                                className="h-8 px-2 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                disabled={isSubmitting}
                                onClick={() => handleApprove(record.id)}
                                className="h-8 bg-success hover:bg-success/90 text-white text-xs font-bold gap-1"
                              >
                                <Check className="size-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isSubmitting}
                                onClick={() => setRejectingId(record.id)}
                                className="h-8 border-danger text-danger hover:bg-danger/10 text-xs font-bold gap-1"
                              >
                                <X className="size-3.5" /> Reject
                              </Button>
                            </div>
                          )
                        ) : (
                          <span className="text-text-muted text-[11px]">Reviewed</span>
                        )}
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
