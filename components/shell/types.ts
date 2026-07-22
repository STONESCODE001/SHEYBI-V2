import type { ReactNode } from "react"

export type ShellVariant = "guest" | "authenticated" | "admin"

export type NavIconName =
  | "home"
  | "markets"
  | "portfolio"
  | "wallet"
  | "notifications"
  | "settings"
  | "profile"
  | "users"
  | "transactions"
  | "audit"
  | "categories"
  | "dashboard"

export interface NavItem {
  readonly label: string
  readonly href: string
  readonly icon: NavIconName
}

export interface CategoryItem {
  readonly label: string
  readonly href: string
}

export interface TickerItem {
  readonly id: string
  readonly label: string
  readonly change: string
}

export interface ApplicationShellProps {
  readonly variant?: ShellVariant
  readonly children: ReactNode
  /** Overlay dialog content hosted in Dialog Layer. */
  readonly dialog?: ReactNode
  /** Toast content hosted in Toast Layer. */
  readonly toast?: ReactNode
  readonly isLoading?: boolean
  /** Placeholder wallet balance for authenticated shells. */
  readonly availableBalance?: string
  /** Unread notification count. Badge hidden when 0. */
  readonly unreadCount?: number
  /** Placeholder display name for profile region. */
  readonly userName?: string
  readonly userAvatarUrl?: string
  /** Market ticker items. Region hidden when empty. */
  readonly tickerItems?: readonly TickerItem[]
  /** Category links. Shows empty state when empty array. */
  readonly categories?: readonly CategoryItem[]
  readonly className?: string
}
