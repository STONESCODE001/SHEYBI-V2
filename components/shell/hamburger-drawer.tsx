"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionIcon } from "@/components/child/action-icon"
import { ShellLogo } from "./shell-logo"
import { WalletDisplayRegion } from "./wallet-display-region"
import { PrimaryNavigationRegion } from "./primary-navigation"
import { CategoryNavigationRegion } from "./category-navigation"
import { UserProfileRegion } from "./user-profile-region"
import type { CategoryItem, ShellVariant } from "./types"

interface HamburgerDrawerProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly variant: ShellVariant
  readonly availableBalance?: string
  readonly userName?: string
  readonly userAvatarUrl?: string
  readonly categories?: readonly CategoryItem[]
}

function HamburgerDrawer({
  open,
  onOpenChange,
  variant,
  availableBalance,
  userName,
  userAvatarUrl,
  categories,
}: HamburgerDrawerProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange])

  React.useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
      }

      if (event.key !== "Tab" || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled])'
    )
    firstFocusable?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, close])

  if (!open) {
    return null
  }

  return (
    <div data-slot="hamburger-drawer" className="md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-[30] bg-[var(--bg-base)]/70"
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-y-0 left-0 z-[30] flex h-[100dvh] w-[80vw] max-w-[320px] flex-col",
          "border-r border-[var(--border-default)] bg-[var(--bg-surface)]",
          "shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
          "animate-in slide-in-from-left duration-200"
        )}
      >
        <div className="flex items-center justify-between p-4 pb-0">
          <ShellLogo />
          <ActionIcon icon={X} aria-label="Close menu" onClick={close} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <WalletDisplayRegion
              variant={variant}
              availableBalance={availableBalance}
            />
            <PrimaryNavigationRegion variant={variant} onNavigate={close} />
            {variant !== "admin" ? (
              <CategoryNavigationRegion
                categories={categories}
                onNavigate={close}
              />
            ) : null}
          </div>

          <div data-slot="drawer-footer-actions" className="mt-4 shrink-0">
            <UserProfileRegion
              variant={variant}
              userName={userName}
              userAvatarUrl={userAvatarUrl}
              className="-mx-4"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { HamburgerDrawer }
export type { HamburgerDrawerProps }
