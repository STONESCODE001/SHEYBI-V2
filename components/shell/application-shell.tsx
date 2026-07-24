"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionIcon } from "@/components/child/action-icon"
import { DesktopSidebar } from "./desktop-sidebar"
import { DesktopHeader } from "./desktop-header"
import { MobileHeader } from "./mobile-header"
import { HamburgerDrawer } from "./hamburger-drawer"
import { BottomNavigation } from "./bottom-navigation"
import { LiveMarketTicker } from "./live-market-ticker"
import { DialogLayer } from "./dialog-layer"
import { ToastLayer } from "./toast-layer"
import { LoadingLayer } from "./loading-layer"
import { DialogViewport } from "@/components/dialog"
import type { ApplicationShellProps } from "./types"
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TICKER_ITEMS,
  PLACEHOLDER_BALANCE,
  PLACEHOLDER_USER_NAME,
} from "./constants"

function ApplicationShell({
  variant = "authenticated",
  children,
  dialog,
  toast,
  isLoading = false,
  availableBalance = PLACEHOLDER_BALANCE,
  unreadCount = 3,
  userName = PLACEHOLDER_USER_NAME,
  userAvatarUrl,
  tickerItems = DEFAULT_TICKER_ITEMS,
  categories = DEFAULT_CATEGORIES,
  className,
}: ApplicationShellProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [tabletSidebarOpen, setTabletSidebarOpen] = React.useState(false)

  return (
    <div
      data-slot="application-root"
      data-variant={variant}
      className={cn(
        "relative flex h-[100dvh] w-screen overflow-hidden bg-[var(--bg-base)] font-sans",
        className
      )}
    >
      {/* Desktop / Tablet Sidebar */}
      <DesktopSidebar
        variant={variant}
        availableBalance={availableBalance}
        userName={userName}
        userAvatarUrl={userAvatarUrl}
        categories={categories}
        expanded={tabletSidebarOpen}
        onClose={() => setTabletSidebarOpen(false)}
      />

      {/* Content column — offset for fixed desktop sidebar */}
      <div
        className={cn(
          "relative flex min-w-0 flex-1 flex-col overflow-hidden",
          "lg:pl-[260px]"
        )}
      >
        {/* Tablet sidebar toggle (md–lg only) */}
        <ActionIcon
          icon={PanelLeft}
          aria-label="Toggle sidebar"
          aria-expanded={tabletSidebarOpen}
          onClick={() => setTabletSidebarOpen((open) => !open)}
          className={cn(
            "absolute top-3 left-3 z-[25] hidden",
            "md:inline-flex lg:hidden",
            variant !== "guest" && "top-[4.5rem]"
          )}
        />

        <DesktopHeader
          variant={variant}
          availableBalance={availableBalance}
          unreadCount={unreadCount}
        />

        <MobileHeader
          variant={variant}
          availableBalance={availableBalance}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        <LiveMarketTicker items={tickerItems} />

        {/* Main Content Region — owns vertical scrolling */}
        <main
          data-slot="main-content-region"
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            "pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0"
          )}
        >
          <div
            className={cn(
              "mx-auto w-full max-w-[1200px]",
              "px-4 py-4 md:px-8 md:py-6"
            )}
          >
            {children}
          </div>
        </main>

        <BottomNavigation variant={variant} />
      </div>

      {/* Overlay regions */}
      <HamburgerDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        variant={variant}
        availableBalance={availableBalance}
        userName={userName}
        userAvatarUrl={userAvatarUrl}
        categories={categories}
      />

      <DialogLayer>{dialog || <DialogViewport />}</DialogLayer>
      <ToastLayer>{toast}</ToastLayer>
      <LoadingLayer visible={isLoading} />
    </div>
  )
}

export { ApplicationShell }
