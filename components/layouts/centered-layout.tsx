import * as React from "react"
import { cn } from "@/lib/utils"

export interface CenteredLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CenteredLayout({ children, className, ...props }: CenteredLayoutProps) {
  return (
    <div className={cn("flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-8", className)} {...props}>
      <main className="w-full max-w-md">
        {children}
      </main>
    </div>
  )
}
