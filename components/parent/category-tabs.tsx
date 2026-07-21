"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface CategoryTab {
  /** Unique identifier for the tab. */
  readonly value: string
  /** Display label. */
  readonly label: string
  /** Optional market count. */
  readonly count?: number
  /** Whether the tab is disabled. */
  readonly disabled?: boolean
}

interface CategoryTabsProps extends React.ComponentProps<"div"> {
  /** Array of category tab definitions. */
  readonly categories: readonly CategoryTab[]
  /** Currently active tab value. */
  readonly activeCategory?: string
  /** Callback when the active category changes. */
  readonly onCategoryChange?: (value: string) => void
  /** Content to render for the active tab. */
  readonly children?: React.ReactNode
}

function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  children,
  className,
  ...props
}: CategoryTabsProps): React.ReactElement {
  const defaultValue = activeCategory || categories[0]?.value || ""

  return (
    <div data-slot="category-tabs" className={cn("w-full", className)} {...props}>
      <Tabs
        defaultValue={defaultValue}
        value={activeCategory}
        onValueChange={onCategoryChange}
      >
        <div className="overflow-x-auto scrollbar-none">
          <TabsList
            variant="line"
            className="w-full justify-start gap-1"
            aria-label="Market categories"
          >
            {categories.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                disabled={category.disabled}
                className={cn(
                  "min-h-[44px] min-w-[44px] gap-1.5 rounded-lg px-3 py-2",
                  "text-sm transition-colors duration-200",
                  "hover:bg-[var(--bg-hover)]",
                  "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {category.label}
                {category.count !== undefined && (
                  <Badge
                    variant="secondary"
                    className="ml-1 min-w-[20px] rounded-full px-1.5 py-0 text-xs"
                  >
                    {category.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value={activeCategory || defaultValue} className="outline-none">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { CategoryTabs }
export type { CategoryTabsProps, CategoryTab }
