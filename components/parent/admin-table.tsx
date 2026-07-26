"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

export interface AdminTableProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  children?: React.ReactNode
}

export function AdminTable({
  title,
  description,
  searchPlaceholder = "Search records...",
  searchValue,
  onSearchChange,
  children,
  className,
  ...props
}: AdminTableProps) {
  const [internalQuery, setInternalQuery] = React.useState("")
  const query = searchValue !== undefined ? searchValue : internalQuery

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInternalQuery(val)
    onSearchChange?.(val)
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-[var(--bg-surface)] shadow-sm border border-[var(--border-default)]",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] p-4 sm:p-5">
          <div>
            {title && (
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 size-4 text-[var(--text-muted)]" aria-hidden="true" />
              <Input
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder || "Search table records"}
                value={query}
                onChange={handleQueryChange}
                className="h-9 pl-9 text-xs rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] focus-visible:ring-primary"
              />
            </div>
            <button
              type="button"
              aria-label="Filter records"
              className="flex size-9 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Filter className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5 overflow-x-auto">
        {children || (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-secondary)] text-xs text-[var(--text-muted)]">
            No records found in this view.
          </div>
        )}
      </div>
    </div>
  )
}
