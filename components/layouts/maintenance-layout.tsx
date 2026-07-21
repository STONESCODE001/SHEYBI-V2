import * as React from "react"
import { cn } from "@/lib/utils"
import { EmptyIllustration } from "@/components/child"

export interface MaintenanceLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  statusMessage: string
  countdown?: React.ReactNode
}

export function MaintenanceLayout({
  statusMessage,
  countdown,
  className,
  ...props
}: MaintenanceLayoutProps) {
  return (
    <div className={cn("flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center", className)} {...props}>
      <main className="mx-auto flex max-w-md flex-col items-center gap-6">
        <EmptyIllustration className="h-48 w-48 text-warning" />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Under Maintenance</h1>
          <p className="text-lg text-text-secondary">{statusMessage}</p>
          {countdown && (
            <div className="mt-6 flex w-full justify-center">
              {countdown}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
