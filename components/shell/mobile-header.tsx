"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ShellLogo } from "./shell-logo"
import { WalletChip } from "./wallet-chip"
import { GlobalSearchRegion } from "./global-search"
import type { ShellVariant } from "./types"

interface MobileHeaderProps {
  readonly variant: ShellVariant
  readonly availableBalance?: string
  readonly onOpenDrawer?: () => void
  readonly className?: string
}

function MobileHeader({
  variant,
  availableBalance,
  className,
}: MobileHeaderProps) {
  if (variant === "guest") {
    return (
      <header
        data-slot="mobile-header"
        className={cn(
          "sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between gap-2",
          "bg-[var(--bg-base)] px-4",
          "pt-[env(safe-area-inset-top)] md:hidden",
          className
        )}
      >
        <ShellLogo showTagline />

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className={cn(
              "flex h-9 items-center rounded-xl px-3 text-xs font-semibold",
              "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
              "outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
            )}
          >
            Log In
          </Link>
          <Link
            href="/sign-in"
            className={cn(
              "flex h-9 items-center rounded-xl px-3 text-xs font-semibold",
              "bg-[var(--accent-yellow)] text-[var(--text-inverse)] hover:bg-[var(--accent-yellow-hover)]",
              "outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
            )}
          >
            Sign up
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header
      data-slot="mobile-header"
      className={cn(
        "sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between gap-2",
        "bg-[var(--bg-base)] px-4",
        "pt-[env(safe-area-inset-top)] md:hidden",
        className
      )}
    >
      <ShellLogo showTagline />

      <div className="flex items-center gap-1.5">
        <GlobalSearchRegion mode="trigger" />
        <WalletChip
          variant={variant}
          availableBalance={availableBalance}
          className="mr-0 scale-95"
        />
      </div>
    </header>
  )
}

export { MobileHeader }
export type { MobileHeaderProps }
