"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AuthenticatedLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header: React.ReactNode
  sidebar?: React.ReactNode
  rightPanel?: React.ReactNode
  bottomNavigation?: React.ReactNode
  dialogLayer?: React.ReactNode
  toastLayer?: React.ReactNode
  children: React.ReactNode
}

export function AuthenticatedLayout({
  header,
  sidebar,
  rightPanel,
  bottomNavigation,
  dialogLayer,
  toastLayer,
  children,
  className,
  ...props
}: AuthenticatedLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

  return (
    <div className={cn("relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background", className)} {...props}>
      <header className="sticky top-0 z-40 flex h-[64px] w-full shrink-0 items-center border-b border-border bg-background">
        {header}
      </header>
      
      <div className="relative flex flex-1 overflow-hidden">
        {sidebar && (
          <>
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 z-40 hidden bg-black/50 md:block lg:hidden" 
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
            <aside 
              className={cn(
                "fixed inset-y-0 left-0 z-50 hidden w-[260px] shrink-0 flex-col border-r border-border bg-background transition-transform duration-300 md:flex lg:static lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              {sidebar}
            </aside>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "absolute top-4 z-40 hidden items-center justify-center rounded-r-md border border-l-0 border-border bg-surface px-2 py-4 shadow-sm transition-transform duration-300 md:flex lg:hidden",
                isSidebarOpen ? "translate-x-[260px]" : "left-0"
              )}
              aria-label="Toggle sidebar"
              aria-expanded={isSidebarOpen}
            >
              <div className="h-4 w-1 rounded-full bg-outline" />
            </button>
          </>
        )}
        
        <main className="flex flex-1 flex-col overflow-y-auto pb-[72px] md:pb-0">
          <div className="mx-auto w-full max-w-[1200px] p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
        
        {rightPanel && (
          <aside className="hidden w-[300px] shrink-0 flex-col border-l border-border bg-background lg:flex">
            {rightPanel}
          </aside>
        )}
      </div>

      {bottomNavigation && (
        <nav className="fixed bottom-0 z-40 flex h-[72px] w-full items-center border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
          {bottomNavigation}
        </nav>
      )}

      {dialogLayer && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
          <div className="pointer-events-auto w-full max-h-[90vh] overflow-y-auto rounded-t-xl bg-background sm:h-auto sm:rounded-b-xl">
            {dialogLayer}
          </div>
        </div>
      )}

      {toastLayer && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex flex-col justify-end p-4 pb-[90px] md:pb-6">
          <div className="pointer-events-auto mx-auto w-full max-w-md">
            {toastLayer}
          </div>
        </div>
      )}
    </div>
  )
}
