"use client"

import { cn } from "@/lib/utils"
import { GlobalSearchRegion } from "./global-search"
import { WalletChip } from "./wallet-chip"
import { NotificationRegion } from "./notification-region"
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
  unreadCount = 0,
  className,
}: DesktopHeaderProps) {
  if (variant === "guest") {
    return null
  }

  return (
    <header
      data-slot="desktop-header"
      className={cn(
        "sticky top-0 z-20 hidden h-16 w-full shrink-0 items-center",
        "border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-6",
        "md:flex",
        className
      )}
    >
      <GlobalSearchRegion mode="expanded" className="flex-1" />
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <WalletChip variant={variant} availableBalance={availableBalance} />
        <NotificationRegion variant={variant} unreadCount={unreadCount} />
      </div>
    </header>
  )
}

export { DesktopHeader }
export type { DesktopHeaderProps }
