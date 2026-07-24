"use client"

import { cn } from "@/lib/utils"
import type { ShellVariant } from "./types"
import { PLACEHOLDER_BALANCE } from "./constants"
import { useDialog } from "@/components/dialog"

interface WalletChipProps {
  readonly variant: ShellVariant
  readonly availableBalance?: string
  readonly className?: string
}

function WalletChip({
  variant,
  availableBalance = PLACEHOLDER_BALANCE,
  className,
}: WalletChipProps) {
  const dialog = useDialog()

  if (variant === "guest") {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => dialog.open("wallet/details", { availableBalance })}
      data-slot="wallet-chip"
      aria-live="polite"
      className={cn(
        "mr-4 flex h-8 items-center rounded-xl px-3 cursor-pointer outline-none transition-colors duration-200",
        "border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-hover)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        "font-mono text-sm font-medium text-[var(--wallet)]",
        className
      )}
    >
      <span className="sr-only">Available balance</span>
      <span
        aria-hidden="true"
        className="mr-1.5 size-1.5 rounded-full bg-[var(--accent-primary)]"
      />
      {availableBalance}
    </button>
  )
}

export { WalletChip }
export type { WalletChipProps }
