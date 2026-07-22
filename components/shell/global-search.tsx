"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ActionIcon } from "@/components/child/action-icon"

interface GlobalSearchRegionProps {
  readonly mode?: "expanded" | "trigger"
  readonly className?: string
}

function GlobalSearchRegion({
  mode = "expanded",
  className,
}: GlobalSearchRegionProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  if (mode === "trigger") {
    return (
      <>
        <ActionIcon
          icon={Search}
          aria-label="Search Markets"
          onClick={() => setOpen(true)}
          className={className}
        />
        {open ? (
          <div
            data-slot="global-search-overlay"
            className="fixed inset-0 z-[35] flex flex-col bg-[var(--bg-base)]"
            role="dialog"
            aria-modal="true"
            aria-label="Search Markets"
          >
            <div className="flex h-16 items-center gap-2 border-b border-[var(--border-default)] px-4">
              <Input
                autoFocus
                type="search"
                aria-label="Search Markets"
                placeholder="Search markets..."
                className="h-11 flex-1 rounded-xl bg-[var(--bg-surface-secondary)] text-base"
              />
              <ActionIcon
                icon={X}
                aria-label="Close search"
                onClick={() => setOpen(false)}
              />
            </div>
            <div className="flex flex-1 items-start justify-center p-6">
              <p className="text-sm text-[var(--text-muted)]">
                Start typing to search markets...
              </p>
            </div>
          </div>
        ) : null}
      </>
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
        className={cn(
          "h-10 w-full max-w-[400px] rounded-xl py-2 pr-3 pl-9 text-base",
          "bg-[var(--bg-surface-secondary)] border-[var(--border-default)]"
        )}
      />
    </div>
  )
}

export { GlobalSearchRegion }
export type { GlobalSearchRegionProps }
