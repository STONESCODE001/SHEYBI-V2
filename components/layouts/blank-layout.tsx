import * as React from "react"
import { cn } from "@/lib/utils"

export interface BlankLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function BlankLayout({ children, className, ...props }: BlankLayoutProps) {
  return (
    <div className={cn("min-h-screen w-full bg-background", className)} {...props}>
      {children}
    </div>
  )
}
