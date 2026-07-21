import * as React from "react"
import { cn } from "@/lib/utils"

export interface AdminLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header: React.ReactNode
  sidebar: React.ReactNode
  inspectorPanel?: React.ReactNode
  children: React.ReactNode
}

export function AdminLayout({
  header,
  sidebar,
  inspectorPanel,
  children,
  className,
  ...props
}: AdminLayoutProps) {
  return (
    <div className={cn("flex h-screen w-full flex-col overflow-hidden bg-background", className)} {...props}>
      <header className="flex h-[64px] w-full shrink-0 items-center border-b border-border bg-background">
        {header}
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-border bg-background md:flex">
          {sidebar}
        </aside>
        
        <main className="flex flex-1 flex-col overflow-y-auto bg-surface-subtle">
          <div className="h-full w-full p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
        
        {inspectorPanel && (
          <aside className="hidden w-[320px] shrink-0 flex-col border-l border-border bg-background xl:flex">
            {inspectorPanel}
          </aside>
        )}
      </div>
    </div>
  )
}
