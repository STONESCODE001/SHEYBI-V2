"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface CategoryTab {
  /** Unique identifier for the tab. */
  readonly value: string
  /** Display label. */
  readonly label: string
  /** Optional market count. */
  readonly count?: number
  /** Optional icon to display alongside label. */
  readonly icon?: React.ReactNode
  /** Whether the tab is disabled. */
  readonly disabled?: boolean
}

interface CategoryTabsProps extends React.ComponentProps<"div"> {
  /** Array of category tab definitions. */
  readonly categories?: readonly CategoryTab[]
  /** Currently active tab value. */
  readonly activeCategory?: string
  /** Callback when the active category changes. */
  readonly onCategoryChange?: (value: string) => void
  /** Content to render below tabs. */
  readonly children?: React.ReactNode
}

const DEFAULT_CATEGORIES: readonly CategoryTab[] = [
  {
    value: "trending",
    label: "Trending",
    icon: <Star className="w-4 h-4 fill-black text-black" />,
  },
  {
    value: "weekly",
    label: "Weekly",
  },
  {
    value: "hoh",
    label: "HOH",
  },
]

function CategoryTabs({
  categories = DEFAULT_CATEGORIES,
  activeCategory,
  onCategoryChange,
  children,
  className,
  ...props
}: CategoryTabsProps): React.ReactElement {
  const [selected, setSelected] = React.useState<string>(
    activeCategory || categories[0]?.value || "trending"
  )

  const currentTab = activeCategory !== undefined ? activeCategory : selected

  const handleSelect = (val: string) => {
    setSelected(val)
    onCategoryChange?.(val)
  }

  return (
    <div data-slot="category-tabs" className={cn("w-full py-2", className)} {...props}>
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
        {categories.map((category) => {
          const isActive = currentTab === category.value
          return (
            <button
              key={category.value}
              type="button"
              disabled={category.disabled}
              onClick={() => handleSelect(category.value)}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 select-none cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-[#FFC700] text-black shadow-md"
                  : "bg-transparent text-gray-300 hover:text-white hover:bg-white/5"
              )}
            >
              {category.icon ? (
                <span className={cn("inline-flex items-center", isActive ? "text-black" : "text-gray-400")}>
                  {category.icon}
                </span>
              ) : null}
              <span>{category.label}</span>
            </button>
          )
        })}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export { CategoryTabs }
export type { CategoryTabsProps, CategoryTab }

