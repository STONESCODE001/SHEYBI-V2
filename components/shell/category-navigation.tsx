"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { CategoryItem } from "./types"
import { DEFAULT_CATEGORIES } from "./constants"

interface CategoryNavigationRegionProps {
  readonly categories?: readonly CategoryItem[]
  readonly onNavigate?: () => void
  readonly className?: string
}

function CategoryNavigationRegion({
  categories = DEFAULT_CATEGORIES,
  onNavigate,
  className,
}: CategoryNavigationRegionProps) {
  const pathname = usePathname()

  return (
    <nav
      data-slot="category-navigation-region"
      aria-label="Market Categories"
      className={cn("mt-6 w-full", className)}
    >
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Categories
      </p>
      {categories.length === 0 ? (
        <p className="px-3 text-sm text-[var(--text-muted)]">
          No categories available
        </p>
      ) : (
        <ul role="menu" className="flex flex-col gap-1">
          {categories.map((category) => {
            const active =
              pathname.includes(`category=${category.label.toLowerCase()}`) ||
              pathname === category.href

            return (
              <li key={category.href} role="none">
                <Link
                  href={category.href}
                  role="menuitem"
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "flex h-10 w-full items-center rounded-xl px-3 text-sm",
                    "outline-none transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
                    active
                      ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                  )}
                >
                  {category.label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )
}

export { CategoryNavigationRegion }
export type { CategoryNavigationRegionProps }
