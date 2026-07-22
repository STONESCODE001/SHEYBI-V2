"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { WalletCard } from "@/components/parent/wallet-card"
import type { ShellVariant } from "./types"
import { PLACEHOLDER_BALANCE } from "./constants"

interface WalletDisplayRegionProps {
  readonly variant: ShellVariant
  readonly availableBalance?: string
  readonly className?: string
}

function WalletDisplayRegion({
  variant,
  availableBalance = PLACEHOLDER_BALANCE,
  className,
}: WalletDisplayRegionProps) {
  if (variant === "guest") {
    return (
      <div
        data-slot="wallet-display-region"
        className={cn(
          "mb-6 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4",
          className
        )}
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Sign in to view your wallet balance and trade markets.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/sign-in"
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center rounded-xl",
              "bg-[var(--accent-primary)] px-4 text-sm font-medium text-[var(--text-inverse)]",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
              "hover:bg-[var(--accent-primary-hover)]"
            )}
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center rounded-xl",
              "border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 text-sm font-medium text-[var(--text-primary)]",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
              "hover:bg-[var(--bg-hover)]"
            )}
          >
            Create Account
          </Link>
        </div>
      </div>
    )
  }

  if (variant === "admin") {
    return null
  }

  return (
    <div
      data-slot="wallet-display-region"
      className={cn("mb-6 w-full", className)}
      aria-live="polite"
    >
      <WalletCard
        availableBalance={availableBalance}
        lockedBalance="₦12,500.00"
        portfolioValue="₦48,200.00"
        status="Active"
      />
    </div>
  )
}

export { WalletDisplayRegion }
export type { WalletDisplayRegionProps }
