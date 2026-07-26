import * as React from "react"
import { cn } from "@/lib/utils"

export interface SettingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SettingCard({
  title,
  description,
  action,
  className,
  ...props
}: SettingCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-[var(--bg-surface)] p-4 shadow-sm border border-[var(--border-default)] sm:flex-row sm:items-center sm:justify-between sm:p-5",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
