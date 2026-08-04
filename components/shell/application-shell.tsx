"use client"

import * as React from "react"
import { useAuth } from "@clerk/nextjs"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionIcon } from "@/components/child/action-icon"
import { DesktopSidebar } from "./desktop-sidebar"
import { DesktopHeader } from "./desktop-header"
import { MobileHeader } from "./mobile-header"
import { BottomNavigation } from "./bottom-navigation"
import { LiveMarketTicker } from "./live-market-ticker"
import { FooterRegion } from "./footer-region"
import { DialogLayer } from "./dialog-layer"
import { ToastLayer } from "./toast-layer"
import { LoadingLayer } from "./loading-layer"
import { DialogViewport } from "@/components/dialog"
import { useWallet } from "@/lib/hooks/use-wallet"
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
  className,
}: ApplicationShellProps) {
  const [tabletSidebarOpen, setTabletSidebarOpen] = React.useState(false)
  const { isSignedIn, isLoaded } = useAuth()
  const { wallet } = useWallet()

  const displayBalance = wallet
    ? `₦${(wallet.availableBalance ?? 0).toLocaleString()}`
    : availableBalance

  const effectiveVariant = React.useMemo(() => {
    if (variant === "admin") return "admin"
    if (!isLoaded) return variant
    return isSignedIn ? "authenticated" : "guest"
  }, [variant, isLoaded, isSignedIn])

  return (
    <div
      data-slot="application-root"
      data-variant={effectiveVariant}
      className={cn(
        "relative flex h-[100dvh] w-screen overflow-hidden bg-bg-base text-text-primary font-sans",
        effectiveVariant === "admin" && "dark",
        className
      )}
    >
      {/* Desktop / Tablet Sidebar */}
      <DesktopSidebar
        variant={effectiveVariant}
        availableBalance={displayBalance}
        userName={userName}
        userAvatarUrl={userAvatarUrl}
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
            effectiveVariant !== "guest" && "top-[4.5rem]"
          )}
        />

        <DesktopHeader
          variant={effectiveVariant}
          availableBalance={displayBalance}
          unreadCount={unreadCount}
        />

        <MobileHeader
          variant={effectiveVariant}
          availableBalance={displayBalance}
        />

        {/* LiveMarketTicker implementation paused: <LiveMarketTicker items={tickerItems} /> */}

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
              "mx-auto w-full max-w-[1200px] min-h-[calc(100vh-160px)]",
              "px-4 py-4 md:px-8 md:py-6"
            )}
          >
            {children}
          </div>
          <FooterRegion />
        </main>

        <BottomNavigation variant={effectiveVariant} />
      </div>

      {/* Overlay regions */}
      <DialogLayer>{dialog || <DialogViewport />}</DialogLayer>
      <ToastLayer>{toast}</ToastLayer>
      <LoadingLayer visible={isLoading} />
    </div>
  )
}

export { ApplicationShell }
