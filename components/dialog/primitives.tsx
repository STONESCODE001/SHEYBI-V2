"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"

// Header region
export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left p-2", className)}
      {...props}
    />
  )
}

// Title region
export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold tracking-tight text-foreground font-sans", className)}
      {...props}
    />
  )
}

// Description region
export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground font-sans", className)}
      {...props}
    />
  )
}

// Body region
export function DialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-2 text-sm text-muted-foreground", className)} {...props} />
}

// Scroll Area region
export function DialogScrollArea({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "max-h-[60vh] sm:max-h-[50vh] overflow-y-auto px-2 py-1 scrollbar-thin border-y border-border/20my-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Footer region
export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 p-2",
        "sm:flex-row sm:justify-end sm:gap-2",
        className
      )}
      {...props}
    />
  )
}

// Loading state region
export function DialogLoadingState({
  message = "Please wait...",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { message?: string }) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-6 gap-3", className)}
      aria-live="polite"
      aria-busy="true"
      {...props}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}

// Error state region
export function DialogErrorState({
  title = "An error occurred",
  message,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { title?: string; message: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-4 rounded-xl border border-destructive/20 bg-destructive/5 gap-2",
        className
      )}
      role="alert"
      {...props}
    >
      <AlertCircle className="h-8 w-8 text-destructive" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs">{message}</p>
    </div>
  )
}

// Empty state region
export function DialogEmptyState({
  title = "No results found",
  description = "Try adjusting your filters or search terms.",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { title?: string; description?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-8 gap-2",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
    </div>
  )
}
