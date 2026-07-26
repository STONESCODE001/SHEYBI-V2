import * as React from "react"
import { cn } from "@/lib/utils"

export interface AdminTableProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  children?: React.ReactNode
}

export function AdminTable({
  title,
  description,
  children,
  className,
  ...props
}: AdminTableProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 overflow-hidden rounded-2xl bg-[var(--bg-surface)] shadow-sm border border-[var(--border-default)]",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col gap-1 border-b border-[var(--border-default)] p-4 sm:p-5">
          {title && (
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="p-4 sm:p-5">
        {children || (
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-secondary)] text-sm text-[var(--text-muted)]">
            Admin Table Placeholder
          </div>
        )}
      </div>
    </div>
  )
}
