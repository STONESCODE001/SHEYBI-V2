import * as React from "react"
import { cn } from "@/lib/utils"

export interface LoadingLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  fullScreen?: boolean
}

export function LoadingLayout({ className, fullScreen = true, ...props }: LoadingLayoutProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
        fullScreen ? "fixed inset-0 z-[100]" : "absolute inset-0 z-50 rounded-[inherit]",
        className
      )}
      {...props}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only" role="status" aria-live="polite">Loading...</span>
    </div>
  )
}
