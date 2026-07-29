"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"
import { CreditCard, Landmark, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { useUser } from "@clerk/nextjs"
import { processDepositAction } from "@/lib/actions/wallet-actions"

interface DepositDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

type DepositStep = "input" | "review"

export function DepositDialog({ isOpen, onClose, status, setStatus }: DepositDialogProps) {
  const dialog = useDialog()
  const { user } = useUser()
  const [step, setStep] = React.useState<DepositStep>("input")
  const [amount, setAmount] = React.useState("")
  const [method, setMethod] = React.useState<"card" | "bank">("card")

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    setStep("review")
  }

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount)
    setStep("input") // reset step for next time
    onClose()

    if (!user?.id) {
      await dialog.error({
        title: "Authentication Required",
        description: "Please sign in to deposit funds."
      })
      return
    }

    const loader = dialog.loading({
      title: "Processing Deposit",
      description: "Finalizing ledger entries..."
    })

    const ref = `dep_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`
    const result = await processDepositAction(user.id, amountNum, ref)

    loader.close()

    if (!result.success) {
      await dialog.error({
        title: "Deposit Failed",
        description: result.error ?? "Failed to process deposit."
      })
      return
    }

    // Show success dialog
    await dialog.success({
      title: "Deposit Successful",
      description: `₦${amountNum.toLocaleString()} has been added to your wallet balance.`
    })
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Deposit Funds"
      description="Add money to your Sheybi wallet."
    >
      <DialogHeader className="p-0">
        <DialogTitle className="text-xl">Deposit Funds</DialogTitle>
        <DialogDescription>Select your payment channel and enter the amount you wish to add.</DialogDescription>
      </DialogHeader>

      {step === "input" ? (
        <form onSubmit={handleNext} className="mt-4 flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount" className="text-sm font-medium text-[var(--text-secondary)]">Amount (₦)</Label>
            <Input
              id="deposit-amount"
              type="number"
              min="100"
              placeholder="Min ₦100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] font-mono text-base focus-visible:ring-[var(--border-active)]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[var(--text-secondary)]">Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-200 outline-none",
                  method === "card"
                    ? "border-[var(--border-active)] bg-primary/5 text-primary"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <CreditCard className="size-5" />
                <span>Debit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod("bank")}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-200 outline-none",
                  method === "bank"
                    ? "border-[var(--border-active)] bg-primary/5 text-primary"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <Landmark className="size-5" />
                <span>Bank Transfer</span>
              </button>
            </div>
          </div>

          <DialogFooter className="mt-4 p-0">
            <Button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-primary text-white hover:bg-primary-hover h-11 rounded-xl"
            >
              Continue
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] flex flex-col gap-2.5">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Review Payment Details</h4>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Method</span>
              <span className="text-[var(--text-primary)] font-medium">
                {method === "card" ? "Debit Card (Paystack)" : "Bank Transfer"}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-[var(--border-default)] pt-2.5">
              <span className="text-[var(--text-muted)]">Amount</span>
              <span className="text-[var(--text-primary)] font-mono font-bold">
                ₦{parseFloat(amount).toLocaleString()}
              </span>
            </div>
          </div>

          <DialogFooter className="p-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("input")}
              className="w-full sm:w-1/2 text-[var(--text-secondary)] border-[var(--border-default)]"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              className="w-full sm:w-1/2 bg-success text-white hover:bg-success/90"
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </div>
      )}
    </ResponsiveWrapper>
  )
}
export default DepositDialog
