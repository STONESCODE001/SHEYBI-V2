"use client"

import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionIcon } from "@/components/child/action-icon"
import { ShellLogo } from "./shell-logo"
import { WalletChip } from "./wallet-chip"
import { GlobalSearchRegion } from "./global-search"
import type { ShellVariant } from "./types"
import Link from "next/link"

interface MobileHeaderProps {
  readonly variant: ShellVariant
  readonly availableBalance?: string
  readonly onOpenDrawer: () => void
  readonly className?: string
}

function MobileHeader({
  variant,
  availableBalance,
  onOpenDrawer,
  className,
}: MobileHeaderProps) {
  return (
    <header
      data-slot="mobile-header"
      className={cn(
        "sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between gap-2",
        "border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-4",
        "pt-[env(safe-area-inset-top)] md:hidden",
        className
      )}
    >
      <ShellLogo compact />

      <div className="flex items-center gap-1">
        {variant === "guest" ? (
          <Link
            href="/sign-in"
            className={cn(
              "mr-2 flex h-8 items-center rounded-xl px-3 text-sm font-medium",
              "border border-[var(--border-default)] text-[var(--text-primary)]",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
            )}
          >
            Login
          </Link>
        ) : (
          <WalletChip
            variant={variant}
            availableBalance={availableBalance}
            className="mr-2 scale-95"
          />
        )}
        <GlobalSearchRegion mode="trigger" />
        <ActionIcon
          icon={Menu}
          aria-label="Open menu"
          onClick={onOpenDrawer}
        />
      </div>
    </header>
  )
}

export { MobileHeader }
export type { MobileHeaderProps }
