"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  const items = resolveItems(variant)

  return (
    <nav
      data-slot="primary-navigation-region"
      aria-label="Main Navigation"
      className={cn("w-full", className)}
    >
      <ul role="menu" className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.icon]
          const active = isActivePath(pathname, item.href)

          return (
            <li key={item.href} role="none">
              <Link
                href={item.href}
                role="menuitem"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-base",
                  "outline-none transition-colors duration-200",
                  "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
                  active
                    ? "bg-[var(--bg-active)] font-semibold text-[var(--text-primary)]"
                    : "font-normal text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
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
