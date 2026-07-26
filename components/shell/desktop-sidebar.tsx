"use client"

import { cn } from "@/lib/utils"
import { ShellLogo } from "./shell-logo"
import { PrimaryNavigationRegion } from "./primary-navigation"
import { UserProfileRegion } from "./user-profile-region"
import type { ShellVariant } from "./types"

interface DesktopSidebarProps {
  readonly variant: ShellVariant
  readonly availableBalance?: string
  readonly userName?: string
  readonly userAvatarUrl?: string
  /** Tablet collapsible: when true, sidebar overlays content. */
  readonly expanded?: boolean
  readonly onClose?: () => void
  readonly className?: string
}

function DesktopSidebar({
  variant,
  availableBalance,
  userName,
  userAvatarUrl,
  expanded = false,
  onClose,
  className,
}: DesktopSidebarProps) {
  return (
    <>
      {/* Tablet overlay backdrop when expanded */}
      {expanded ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-[25] hidden bg-[var(--bg-base)]/60 md:block lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        data-slot="desktop-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-[30] hidden w-[260px] flex-col p-3.5 md:p-4",
          "bg-[var(--bg-base)]",
          "transition-transform duration-300 ease-in-out",
          // Desktop: always visible and static in flow via sibling spacer
          "lg:flex lg:translate-x-0",
          // Tablet: collapsible overlay
          expanded ? "md:flex" : "md:flex md:-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Elevated floating parent container card wrapping entire sidebar content (borderless) */}
        <div className="flex h-full w-full flex-col rounded-2xl bg-[var(--bg-surface)] p-4 shadow-sm">
          <ShellLogo className="mb-6 shrink-0" />

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <PrimaryNavigationRegion variant={variant} />
          </div>

          <UserProfileRegion
            variant={variant}
            userName={userName}
            userAvatarUrl={userAvatarUrl}
            className="-mx-4 -mb-4 mt-4"
          />
        </div>
      </aside>
    </>
  )
}

export { DesktopSidebar }
export type { DesktopSidebarProps }
