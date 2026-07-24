"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ActionIcon } from "@/components/child/action-icon"
import { useDialog } from "@/components/dialog"

interface GlobalSearchRegionProps {
  readonly mode?: "expanded" | "trigger"
  readonly className?: string
}

function GlobalSearchRegion({
  mode = "expanded",
  className,
}: GlobalSearchRegionProps) {
  const dialog = useDialog()

  if (mode === "trigger") {
    return (
      <ActionIcon
        icon={Search}
        aria-label="Search Markets"
        onClick={() => dialog.open("global/search")}
        className={className}
      />
    )
  }

  return (
    <div
      data-slot="global-search-region"
      className={cn("relative min-w-0 flex-1", className)}
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]"
        aria-hidden="true"
      />
      <Input
        type="search"
        aria-label="Search Markets"
        placeholder="Search markets..."
        onClick={() => dialog.open("global/search")}
        className={cn(
          "h-10 w-full max-w-[400px] rounded-xl py-2 pr-3 pl-9 text-base cursor-pointer",
          "bg-[var(--bg-surface-secondary)] border-[var(--border-default)]"
        )}
      />
    </div>
  )
}

export { GlobalSearchRegion }
export type { GlobalSearchRegionProps }
