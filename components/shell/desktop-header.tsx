"use client"

import { cn } from "@/lib/utils"
import { GlobalSearchRegion } from "./global-search"
import { WalletChip } from "./wallet-chip"
// NotificationRegion paused per requirement
// import { NotificationRegion } from "./notification-region"
import type { ShellVariant } from "./types"

interface DesktopHeaderProps {
  readonly variant: ShellVariant
  readonly availableBalance?: string
  readonly unreadCount?: number
  readonly className?: string
}

function DesktopHeader({
  variant,
  availableBalance,
  className,
}: DesktopHeaderProps) {
  if (variant === "guest") {
    return (
      <header
        data-slot="desktop-header"
        className={cn(
          "sticky top-0 z-20 hidden h-16 w-full shrink-0 items-center justify-center",
          "bg-[var(--bg-base)] px-6",
          "md:flex",
          className
        )}
      >
        <div className="w-full max-w-[480px]">
          <GlobalSearchRegion mode="expanded" />
        </div>
      </header>
    )
  }

  return (
    <header
      data-slot="desktop-header"
      className={cn(
        "sticky top-0 z-20 hidden h-16 w-full shrink-0 items-center justify-between",
        "bg-[var(--bg-base)] px-6",
        "md:flex",
        className
      )}
    >
      <GlobalSearchRegion mode="expanded" className="max-w-[480px]" />
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <WalletChip variant={variant} availableBalance={availableBalance} />
      </div>
    </header>
  )
}

export { DesktopHeader }
export type { DesktopHeaderProps }
