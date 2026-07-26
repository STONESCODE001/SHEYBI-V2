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
        "inline-flex h-9 items-center justify-center rounded-xl px-3.5 cursor-pointer outline-none transition-colors duration-200",
        "bg-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-hover)] shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        "text-sm font-bold text-[var(--text-inverse)] tracking-tight",
        className
      )}
    >
      <span className="sr-only">Available balance</span>
      <span>{availableBalance}</span>
    </button>
  )
}

export { WalletChip }
export type { WalletChipProps }
