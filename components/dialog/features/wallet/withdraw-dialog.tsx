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
import { cn } from "@/lib/utils"

import {
  fetchNigerianBanks,
  resolveBankAccount,
  type NigerianBank,
} from "@/lib/actions/paystack-actions"
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

  // ---- Bank list state (fetched from Paystack /bank) ----
  const [banks, setBanks] = React.useState<NigerianBank[]>([])
  const [banksLoading, setBanksLoading] = React.useState(false)
  const [banksError, setBanksError] = React.useState<string | null>(null)

  // ---- Selected bank (stores both name and code for /bank/resolve) ----
  const [selectedBankCode, setSelectedBankCode] = React.useState("")
  const [selectedBankName, setSelectedBankName] = React.useState("")

  // ---- Account resolution state (Paystack /bank/resolve) ----
  const [accountNumber, setAccountNumber] = React.useState("")
  const [accountName, setAccountName] = React.useState("")
  const [resolvingAccount, setResolvingAccount] = React.useState(false)
  const [resolveError, setResolveError] = React.useState<string | null>(null)

  // ---- Reset on close ----
  React.useEffect(() => {
    if (!isOpen) {
      setStep("input")
      setAmount("")
      setSelectedBankCode("")
      setSelectedBankName("")
      setAccountNumber("")
      setAccountName("")
      setResolveError(null)
    }
  }, [isOpen])

  // ---- Fetch bank list from Paystack on first open ----
  React.useEffect(() => {
    if (!isOpen || banks.length > 0) return

    setBanksLoading(true)
    setBanksError(null)

    fetchNigerianBanks().then((result) => {
      setBanksLoading(false)
      if (result.success && result.data && result.data.length > 0) {
        setBanks(result.data)
      } else {
        setBanksError(result.error ?? "Failed to load banks.")
      }
    })
  }, [isOpen, banks.length])

  // ---- Real account resolution via Paystack /bank/resolve ----
  React.useEffect(() => {
    // Only trigger when 10 digits entered AND a bank is selected
    if (accountNumber.length !== 10 || !selectedBankCode) {
      setAccountName("")
      setResolveError(null)
      return
    }

    let cancelled = false
    setResolvingAccount(true)
    setAccountName("")
    setResolveError(null)

    const timer = setTimeout(() => {
      resolveBankAccount(accountNumber, selectedBankCode).then((result) => {
        if (cancelled) return
        setResolvingAccount(false)
        if (result.success && result.data) {
          setAccountName(result.data.accountName)
        } else {
          setResolveError(result.error ?? "Could not verify account.")
        }
      })
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [accountNumber, selectedBankCode])
  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value
    const bank = banks.find((b) => b.code === selectedCode)
    setSelectedBankCode(selectedCode)
    setSelectedBankName(bank?.name ?? "")
    // Re-trigger account resolution when bank changes (if account already entered)
    setAccountName("")
    setResolveError(null)
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!val || val < 1000) return
    if (accountNumber.length !== 10 || !accountName) return
    setStep("review")
  }

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount)
    setStep("input")
    onClose()

    const loader = dialog.loading({
      title: "Processing Withdrawal",
      description: "Submitting withdrawal request..."
    })

    const result = await requestWithdrawalAction(amountNum, {
      bankName: selectedBankName,
      accountNumber,
      accountName,
    })

    loader.close()

    if (!result.success) {
      await dialog.error({
        title: "Withdrawal Failed",
        description: result.error ?? "Failed to request withdrawal."
      })
      return
    }

    await dialog.success({
      title: "Withdrawal Requested",
      description: `₦${amountNum.toLocaleString()} withdrawal request submitted. Net amount ₦${result.data?.netAmount.toLocaleString()} will reflect in your bank account after approval.`
    })
  }

  const amountNum = parseFloat(amount)
  const isValidForm = amountNum >= 1000 && accountNumber.length === 10 && !!accountName

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

      {step === "input" && (
        <form onSubmit={handleNext} className="mt-4 flex flex-col gap-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount" className="text-sm font-medium text-[var(--text-secondary)]">Amount (₦)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              min="1000"
              step="any"
              placeholder="Min ₦1,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] font-mono text-base focus-visible:ring-[var(--border-active)]"
            />
          </div>

          {/* Bank dropdown — live from Paystack */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-bank" className="text-sm font-medium text-[var(--text-secondary)]">
              Destination Bank
              {banksLoading && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Loader2 className="size-3 animate-spin" /> Loading banks...
                </span>
              )}
            </Label>
            {banksError ? (
              <p className="text-xs text-[var(--state-error)]">{banksError}</p>
            ) : (
              <select
                id="withdraw-bank"
                value={selectedBankCode}
                onChange={handleBankChange}
                disabled={banksLoading || banks.length === 0}
                className={cn(
                  "w-full h-11 px-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
                  (banksLoading || banks.length === 0) && "opacity-50 cursor-not-allowed"
                )}
              >
                {banks.length === 0 ? (
                  <option value="">Loading banks...</option>
                ) : (
                  <option value="">Select your bank</option>
                )}
                {banks.map((bank) => (
                  <option key={`${bank.code}-${bank.slug}`} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-account" className="text-sm font-medium text-[var(--text-secondary)]">Account Number</Label>
            <Input
              id="withdraw-account"
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit Account Number"
              value={accountNumber}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "")
                setAccountNumber(digits)
              }}
              required
              className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] font-mono text-base focus-visible:ring-[var(--border-active)]"
            />
          </div>

          {/* Account resolution feedback */}
          {resolvingAccount && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] animate-pulse">
              <Loader2 className="size-3 animate-spin" />
              Verifying account with {selectedBankName}...
            </div>
          )}

          {resolveError && !resolvingAccount && (
            <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--state-error)]/30 text-xs text-[var(--state-error)]">
              {resolveError}
            </div>
          )}

          {accountName && !resolvingAccount && !resolveError && (
            <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--state-success)]/40 flex items-center gap-2">
              <div className="size-2 rounded-full bg-[var(--state-success)] flex-shrink-0" />
              <span className="text-xs text-[var(--state-success)] font-mono font-medium">
                {accountName}
              </span>
            </div>
          )}

          <DialogFooter className="mt-4 p-0">
            <Button
              type="submit"
              disabled={!isValidForm}
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
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Review Payout Details</h4>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Bank</span>
              <span className="text-[var(--text-primary)] font-medium">{selectedBankName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Account</span>
              <span className="text-[var(--text-primary)] font-mono font-medium">
                {accountNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Account Name</span>
              <span className="text-[var(--text-primary)] font-medium">{accountName}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[var(--border-default)] pt-2.5">
              <span className="text-[var(--text-muted)]">Withdrawal Amount</span>
              <span className="font-mono font-bold text-[var(--loss)]">
                -₦{amountNum.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              A standard processing fee will be deducted. Net amount will be sent after admin approval.
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
