"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useDialog } from "@/components/dialog"
import type { NavItem, ShellVariant } from "./types"
import {
  NAV_ICONS,
  PRIMARY_NAV_ADMIN,
  PRIMARY_NAV_AUTHENTICATED,
  PRIMARY_NAV_GUEST,
} from "./constants"

interface PrimaryNavigationRegionProps {
  readonly variant: ShellVariant
  readonly onNavigate?: () => void
  readonly className?: string
}

function resolveItems(variant: ShellVariant): readonly NavItem[] {
  if (variant === "admin") return PRIMARY_NAV_ADMIN
  if (variant === "guest") return PRIMARY_NAV_GUEST
  return PRIMARY_NAV_AUTHENTICATED
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/" || href === "/admin") {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function PrimaryNavigationRegion({
  variant,
  onNavigate,
  className,
}: PrimaryNavigationRegionProps) {
  const pathname = usePathname()
  const dialog = useDialog()
  const items = resolveItems(variant)

  return (
    <nav
      data-slot="primary-navigation-region"
      aria-label="Main Navigation"
      className={cn("w-full", className)}
    >
      <ul role="menu" className="flex flex-col gap-2.5">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.icon]
          const active = isActivePath(pathname, item.href)

          if (item.icon === "plus") {
            return (
              <li key={item.label || item.href || "suggest"} role="none" className="mt-1">
                <button
                  type="button"
                  role="menuitem"
                  aria-label={item.label || "Market Suggestion"}
                  onClick={() => {
                    onNavigate?.()
                    if (variant === "guest") {
                      window.location.href = "/sign-in"
                    } else {
                      dialog.open("market/suggest")
                    }
                  }}
                  className={cn(
                    "flex h-11 w-full items-center justify-center rounded-xl cursor-pointer",
                    "border border-[var(--accent-yellow)] bg-[var(--bg-base)] text-[var(--accent-yellow)]",
                    "outline-none transition-colors duration-200 hover:bg-[var(--bg-hover)]",
                    "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
                  )}
                >
                  <Icon className="size-6 shrink-0" aria-hidden="true" />
                </button>
              </li>
            )
          }

          return (
            <li key={item.label || item.href} role="none">
              <Link
                href={item.href}
                role="menuitem"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold",
                  "outline-none transition-colors duration-200",
                  "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
                  active
                    ? "bg-[var(--accent-yellow)] font-bold text-[var(--text-inverse)] shadow-sm"
                    : "bg-[var(--bg-base)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label ? <span>{item.label}</span> : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { PrimaryNavigationRegion }
export type { PrimaryNavigationRegionProps }
