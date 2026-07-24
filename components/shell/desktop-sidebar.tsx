"use client"

import { cn } from "@/lib/utils"
import { ShellLogo } from "./shell-logo"
import { WalletDisplayRegion } from "./wallet-display-region"
import { PrimaryNavigationRegion } from "./primary-navigation"
import { CategoryNavigationRegion } from "./category-navigation"
import { UserProfileRegion } from "./user-profile-region"
import type { CategoryItem, ShellVariant } from "./types"

interface DesktopSidebarProps {
  readonly variant: ShellVariant
  readonly availableBalance?: string
  readonly userName?: string
  readonly userAvatarUrl?: string
  readonly categories?: readonly CategoryItem[]
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
  categories,
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
          "fixed inset-y-0 left-0 z-[30] hidden w-[260px] flex-col",
          "border-r border-[var(--border-default)] bg-[var(--bg-surface)]",
          "transition-transform duration-300 ease-in-out",
          // Desktop: always visible and static in flow via sibling spacer
          "lg:flex lg:translate-x-0",
          // Tablet: collapsible overlay
          expanded ? "md:flex" : "md:flex md:-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col p-6">
          <ShellLogo className="mb-6 shrink-0" />

          {/* <WalletDisplayRegion
            variant={variant}
            availableBalance={availableBalance}
          /> */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <PrimaryNavigationRegion variant={variant} />
            {variant !== "admin" ? (
              <CategoryNavigationRegion categories={categories} />
            ) : null}
          </div>

          <UserProfileRegion
            variant={variant}
            userName={userName}
            userAvatarUrl={userAvatarUrl}
            className="-mx-6 mt-4"
          />
        </div>
      </aside>
    </>
  )
}

export { DesktopSidebar }
export type { DesktopSidebarProps }
