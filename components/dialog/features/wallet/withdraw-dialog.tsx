"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"
import { cn } from "@/lib/utils"

import { requestWithdrawalAction } from "@/lib/actions/wallet-actions"

interface WithdrawDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
}

type WithdrawStep = "input" | "review"

export function WithdrawDialog({ isOpen, onClose, status, setStatus }: WithdrawDialogProps) {
  const dialog = useDialog()
  const [step, setStep] = React.useState<WithdrawStep>("input")
  const [amount, setAmount] = React.useState("")
  const [bank, setBank] = React.useState("gtb")
  const [accountNumber, setAccountNumber] = React.useState("")
  const [accountName, setAccountName] = React.useState("")
  const [resolvingAccount, setResolvingAccount] = React.useState(false)

  // Simulate account resolution when 10 digits are inputted
  React.useEffect(() => {
    if (accountNumber.length === 10) {
      setResolvingAccount(true)
      const timer = setTimeout(() => {
        setAccountName("JANE DOE")
        setResolvingAccount(false)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setAccountName("")
    }
  }, [accountNumber])

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0 || accountNumber.length !== 10 || !accountName) return
    setStep("review")
  }

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount)
    setStep("input") // reset step for next time
    onClose()

    const loader = dialog.loading({
      title: "Processing Withdrawal",
      description: "Submitting withdrawal request..."
    })

    const result = await requestWithdrawalAction(amountNum)

    loader.close()

    if (!result.success) {
      await dialog.error({
        title: "Withdrawal Failed",
        description: result.error ?? "Failed to request withdrawal."
      })
      return
    }

    // Show success dialog
    await dialog.success({
      title: "Withdrawal Requested",
      description: `₦${amountNum.toLocaleString()} withdrawal request submitted. Net amount ₦${result.data?.netAmount.toLocaleString()} will reflect in your bank account shortly.`
    })
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Withdraw Funds"
      description="Withdraw money from your Sheybi wallet."
    >
      <DialogHeader className="p-0">
        <DialogTitle className="text-xl">Withdraw Funds</DialogTitle>
        <DialogDescription>Submit your bank payout information and withdrawal amount.</DialogDescription>
      </DialogHeader>

      {step === "input" ? (
        <form onSubmit={handleNext} className="mt-4 flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount" className="text-sm font-medium text-[var(--text-secondary)]">Amount (₦)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              min="100"
              placeholder="Min ₦1,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] font-mono text-base focus-visible:ring-[var(--border-active)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-bank" className="text-sm font-medium text-[var(--text-secondary)]">Destination Bank</Label>
            <select
              id="withdraw-bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
            >
              <option value="gtb">Guaranty Trust Bank</option>
              <option value="access">Access Bank</option>
              <option value="zenith">Zenith Bank</option>
              <option value="uba">United Bank for Africa</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-account" className="text-sm font-medium text-[var(--text-secondary)]">Account Number</Label>
            <Input
              id="withdraw-account"
              type="text"
              maxLength={10}
              placeholder="10-digit Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              required
              className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] font-mono text-base focus-visible:ring-[var(--border-active)]"
            />
          </div>

          {resolvingAccount && (
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 animate-pulse">
              Verifying bank account...
            </div>
          )}

          {accountName && (
            <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-default)] text-xs text-[var(--state-success)] font-mono">
              Account Holder: {accountName}
            </div>
          )}

          <DialogFooter className="mt-4 p-0">
            <Button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0 || accountNumber.length !== 10 || !accountName}
              className="w-full bg-primary text-white hover:bg-primary-hover h-11 rounded-xl"
            >
              Continue
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] flex flex-col gap-2.5">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Review Payout Details</h4>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Bank</span>
              <span className="text-[var(--text-primary)] font-medium">
                {bank === "gtb" ? "GTBank" : bank === "access" ? "Access Bank" : bank === "zenith" ? "Zenith Bank" : "UBA"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Account</span>
              <span className="text-[var(--text-primary)] font-mono font-medium">{accountNumber} ({accountName})</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[var(--border-default)] pt-2.5">
              <span className="text-[var(--text-muted)]">Withdrawal Amount</span>
              <span className="text-[var(--text-primary)] font-mono font-bold text-[var(--loss)]">
                -₦{parseFloat(amount).toLocaleString()}
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
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </div>
      )}
    </ResponsiveWrapper>
  )
}
export default WithdrawDialog
