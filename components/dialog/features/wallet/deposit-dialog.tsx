"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"
import { Loader2 } from "lucide-react"

import { initializePaystackTransaction, verifyAndCreditDeposit } from "@/lib/actions/paystack-actions"

interface DepositDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

type DepositStep = "input" | "review" | "processing"

export function DepositDialog({ isOpen, onClose, status, setStatus }: DepositDialogProps) {
  const dialog = useDialog()
  const [step, setStep] = React.useState<DepositStep>("input")
  const [amount, setAmount] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setStep("input")
      setAmount("")
      setIsLoading(false)
    }
  }, [isOpen])

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!val || val < 100) return
    setStep("review")
  }

  /**
   * DEPOSIT FLOW:
   * 1. Call initializePaystackTransaction(amount) [server] → get access_code
   * 2. Trigger dynamic import('@paystack/inline-js') → new PaystackPop().checkout({ access_code })
   * 3. onSuccess({ reference }) → call verifyAndCreditDeposit(reference) [server]
   * 4. Server verifies with Paystack API → credits wallet if legitimate
   */
  const handleConfirm = async () => {
    const amountNum = parseFloat(amount)
    setStep("processing")
    setIsLoading(true)

    // ---- Step 1: Initialize transaction on server ----
    const initResult = await initializePaystackTransaction(amountNum)

    if (!initResult.success || !initResult.data) {
      setIsLoading(false)
      setStep("review")
      onClose()
      await dialog.error({
        title: "Payment Setup Failed",
        description: initResult.error ?? "Could not initialize payment. Please try again."
      })
      return
    }

    const { access_code, authorization_url } = initResult.data
    setIsLoading(false)

    // Close the deposit dialog before popup appears (avoids z-index stacking)
    onClose()

    // ---- Step 2: Trigger Paystack checkout popup via official SDK ----
    try {
      const { default: PaystackPop } = await import("@paystack/inline-js")
      const paystack = new PaystackPop()

      paystack.resumeTransaction(access_code)
    } catch (err: unknown) {
      const safeErrMsg = err instanceof Error ? err.message : "Failed to open payment popup."
      console.error("[DepositDialog] Paystack popup error:", safeErrMsg)

      // Fallback: If inline popup SDK fails, redirect directly to Paystack secure checkout URL
      if (authorization_url && typeof window !== "undefined") {
        window.open(authorization_url, "_blank")
        return
      }

      await dialog.error({
        title: "Payment Error",
        description: safeErrMsg
      })
    }
  }

  const amountNum = parseFloat(amount)
  const isValidAmount = !isNaN(amountNum) && amountNum >= 100

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
        <DialogDescription>Enter the amount to add. You&apos;ll pay securely via Paystack.</DialogDescription>
      </DialogHeader>

      {step === "input" && (
        <form onSubmit={handleNext} className="mt-4 flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount" className="text-sm font-medium text-[var(--text-secondary)]">Amount (₦)</Label>
            <Input
              id="deposit-amount"
              type="number"
              min="100"
              step="any"
              placeholder="Min ₦100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] font-mono text-base focus-visible:ring-[var(--border-active)]"
            />
            {amountNum > 0 && amountNum < 100 && (
              <p className="text-xs text-[var(--state-error)]">Minimum deposit is ₦100</p>
            )}
          </div>

          <DialogFooter className="mt-4 p-0">
            <Button
              type="submit"
              disabled={!isValidAmount}
              className="w-full bg-primary text-white hover:bg-primary-hover h-11 rounded-xl"
            >
              Continue
            </Button>
          </DialogFooter>
        </form>
      )}

      {step === "review" && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] flex flex-col gap-2.5">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Confirm Deposit</h4>
            <div className="flex justify-between text-sm border-t border-[var(--border-default)] pt-2.5">
              <span className="text-[var(--text-muted)]">Amount</span>
              <span className="text-[var(--text-primary)] font-mono font-bold">
                ₦{amountNum.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              You&apos;ll be redirected to a secure Paystack checkout popup to complete your payment.
            </p>
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
              disabled={isLoading}
              className="w-full sm:w-1/2 bg-success text-white hover:bg-success/90"
            >
              {isLoading ? (
                <><Loader2 className="size-4 animate-spin mr-2" /> Setting up...</>
              ) : (
                "Pay with Paystack"
              )}
            </Button>
          </DialogFooter>
        </div>
      )}

      {step === "processing" && (
        <div className="mt-4 flex flex-col items-center justify-center gap-4 py-8">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-[var(--text-secondary)] text-center">
            Initializing secure payment...
          </p>
        </div>
      )}
    </ResponsiveWrapper>
  )
}

export default DepositDialog
