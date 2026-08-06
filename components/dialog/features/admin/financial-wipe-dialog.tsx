"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"
import { AlertTriangle, Loader2 } from "lucide-react"
import { wipeFinancialStateAction } from "@/lib/actions/admin-actions"

interface FinancialWipeDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

export function FinancialWipeDialog({ isOpen, onClose, status, setStatus }: FinancialWipeDialogProps) {
  const dialog = useDialog()
  const [confirmText, setConfirmText] = React.useState("")
  const [isWiping, setIsWiping] = React.useState(false)

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setConfirmText("")
      setIsWiping(false)
    }
  }, [isOpen])

  const isValid = confirmText === "CONFIRM WIPE"

  const handleConfirm = async () => {
    if (!isValid) return

    setIsWiping(true)
    try {
      const result = await wipeFinancialStateAction()

      setIsWiping(false)
      onClose()

      if (result.success) {
        await dialog.success({
          title: "Financial State Wiped",
          description: "All demo funds, ledger entries, and positions have been reset."
        })
      } else {
        await dialog.error({
          title: "Wipe Failed",
          description: result.error || "An error occurred while wiping financial state."
        })
      }
    } catch (error) {
      setIsWiping(false)
      onClose()
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      await dialog.error({
        title: "Wipe Error",
        description: message
      })
    }
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Wipe Financial State"
      description="Clear all demo transactions, positions, and reset wallet balances."
    >
      <DialogHeader className="p-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--danger-soft)] text-[var(--danger)] rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-xl text-[var(--danger)]">Danger Zone</DialogTitle>
            <DialogDescription>This action is irreversible.</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-4">
        <div className="p-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-sm text-[var(--text-primary)]">
          <p className="mb-2 font-medium">You are about to:</p>
          <ul className="list-disc list-inside space-y-1 text-[var(--text-muted)] text-xs">
            <li>Delete ALL ledger entries (transaction history).</li>
            <li>Delete ALL user trading positions.</li>
            <li>Reset ALL user wallet balances to ₦0.00.</li>
            <li>Reset ALL lifetime metrics (deposits, withdrawals).</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-wipe" className="text-sm font-medium text-[var(--text-secondary)]">
            Type <span className="font-mono font-bold text-[var(--text-primary)]">CONFIRM WIPE</span> to proceed
          </Label>
          <Input
            id="confirm-wipe"
            type="text"
            placeholder="CONFIRM WIPE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] font-mono focus-visible:ring-[var(--danger)]"
          />
        </div>

        <DialogFooter className="mt-2 p-0 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isWiping}
            className="w-full sm:w-1/2 text-[var(--text-secondary)] border-[var(--border-default)] h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || isWiping}
            className="w-full sm:w-1/2 bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 h-11"
          >
            {isWiping ? (
              <><Loader2 className="size-4 animate-spin mr-2" /> Wiping...</>
            ) : (
              "Wipe State"
            )}
          </Button>
        </DialogFooter>
      </div>
    </ResponsiveWrapper>
  )
}

export default FinancialWipeDialog
