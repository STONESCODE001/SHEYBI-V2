"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { NavItem, ShellVariant } from "./types"
import {
  BOTTOM_NAV_ADMIN,
  BOTTOM_NAV_AUTHENTICATED,
  BOTTOM_NAV_GUEST,
  NAV_ICONS,
} from "./constants"

import { useDialog } from "@/components/dialog"

interface BottomNavigationProps {
  readonly variant: ShellVariant
  readonly className?: string
}

function resolveItems(variant: ShellVariant): readonly NavItem[] {
  if (variant === "admin") return BOTTOM_NAV_ADMIN
  if (variant === "guest") return BOTTOM_NAV_GUEST
  return BOTTOM_NAV_AUTHENTICATED
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/" || href === "/admin" || href === "/sign-in") {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function BottomNavigation({ variant, className }: BottomNavigationProps) {
  const pathname = usePathname()
  const dialog = useDialog()
  const items = resolveItems(variant)

  return (
    <nav
      data-slot="bottom-navigation"
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 flex h-[72px] w-full items-stretch",
        "border-t border-[var(--border-default)] bg-[var(--bg-surface)]",
        "pb-[env(safe-area-inset-bottom)] md:hidden",
        className
      )}
    >
      <ul className="flex h-full w-full items-stretch justify-evenly">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.icon]
          const active = isActivePath(pathname, item.href)

          if (item.icon === "plus") {
            return (
              <li key={item.label || item.href} className="flex min-w-0 flex-1 items-center justify-center">
                <button
                  type="button"
                  onClick={() => dialog.open("market/suggestion")}
                  aria-label="Suggest market"
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl cursor-pointer",
                    "text-[var(--accent-yellow)] font-bold transition-transform active:scale-95",
                    "outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
                  )}
                >
                  <Icon className="size-6 shrink-0" aria-hidden="true" />
                </button>
              </li>
            )
          }

          return (
            <li key={item.label || item.href} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label || "Navigation tab"}
                className={cn(
                  "flex min-h-11 w-full flex-col items-center justify-center gap-1 px-1",
                  "outline-none transition-colors duration-200",
                  "focus-visible:ring-2 focus-visible:ring-[var(--border-active)] focus-visible:ring-inset",
                  active
                    ? "text-[var(--accent-yellow)] font-bold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full transition-colors",
                    active && "bg-[var(--accent-yellow)]/15"
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                </div>
                {item.label ? (
                  <span className="max-w-full truncate text-[11px]">{item.label}</span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { BottomNavigation }
export type { BottomNavigationProps }
