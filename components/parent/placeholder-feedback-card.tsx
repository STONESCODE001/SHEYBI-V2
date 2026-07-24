import * as React from "react"
import { cn } from "@/lib/utils"

export interface PlaceholderFeedbackCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  message?: string
  action?: React.ReactNode
}

export function PlaceholderFeedbackCard({
  title,
  message,
  action,
  className,
  ...props
}: PlaceholderFeedbackCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] bg-[var(--surface)] p-8 text-center shadow-sm outline outline-1 -outline-offset-1 outline-[var(--border)]",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-fixed)] text-[var(--on-primary-fixed)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-mail"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {message && (
          <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
