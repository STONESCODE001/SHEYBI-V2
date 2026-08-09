import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--bg-surface-secondary)]",
        className
      )}
      {...props}
    />
  )
}

export function MarketCardSkeleton({ className }: { className?: string }): React.ReactElement {
  return (
    <div
      className={cn(
        "h-full w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-4",
        className
      )}
    >
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>
      <div className="space-y-3 pt-2">
        <Skeleton className="h-2.5 w-full rounded-full" />
        <div className="h-12 w-full rounded-2xl bg-[var(--bg-base)] p-1.5 flex gap-2">
          <Skeleton className="h-full flex-1 rounded-xl" />
          <Skeleton className="h-full flex-1 rounded-xl" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
    </div>
  )
}

export function WalletCardSkeleton({ className }: { className?: string }): React.ReactElement {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-sm space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <Skeleton className="h-10 w-44 rounded-lg" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

export function ActivityItemSkeleton({ className }: { className?: string }): React.ReactElement {
  return (
    <div
      className={cn(
        "w-full p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between gap-4",
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="size-10 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-3 w-12 rounded-md" />
      </div>
    </div>
  )
}
