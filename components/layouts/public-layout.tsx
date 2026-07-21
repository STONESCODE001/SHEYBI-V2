import * as React from "react"
import { cn } from "@/lib/utils"

export interface PublicLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}

export function PublicLayout({
  header,
  footer,
  children,
  className,
  ...props
}: PublicLayoutProps) {
  return (
    <div className={cn("flex h-[100dvh] flex-col overflow-hidden bg-background", className)} {...props}>
      <header className="sticky top-0 z-40 w-full shrink-0 border-b border-border bg-background">
        {header}
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 lg:py-8">
          {children}
        </div>
      </main>
      {footer && (
        <footer className="mt-auto w-full shrink-0 border-t border-border bg-background">
          {footer}
        </footer>
      )}
    </div>
  )
}
