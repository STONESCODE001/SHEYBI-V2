import * as React from "react"
import { cn } from "@/lib/utils"
import { EmptyIllustration } from "@/components/child"

export interface ErrorLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  primaryAction?: React.ReactNode
}

export function ErrorLayout({
  title,
  description,
  primaryAction,
  className,
  ...props
}: ErrorLayoutProps) {
  return (
    <div className={cn("flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center", className)} {...props}>
      <main className="mx-auto flex max-w-md flex-col items-center gap-6">
        <EmptyIllustration className="h-48 w-48 text-danger" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
          <p className="text-text-secondary">{description}</p>
        </div>
        {primaryAction && (
          <div className="mt-4 w-full sm:w-auto">
            {primaryAction}
          </div>
        )}
      </main>
    </div>
  )
}
