import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Store,
  Briefcase,
  Wallet,
  Bell,
  Settings,
  User,
  Users,
  ArrowLeftRight,
  ScrollText,
  Tags,
  Home,
  Plus,
} from "lucide-react"
import type { CategoryItem, NavIconName, NavItem, TickerItem } from "./types"

export const PRIMARY_NAV_AUTHENTICATED: readonly NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Market", href: "/markets", icon: "markets" },
  { label: "Trades", href: "/portfolio", icon: "portfolio" },
  { label: "Wallet", href: "/wallet", icon: "wallet" },
  { label: "Market Suggestion", href: "#suggest", icon: "plus" },
] as const

export const PRIMARY_NAV_ADMIN: readonly NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Markets", href: "/admin/markets", icon: "markets" },
  { label: "Categories", href: "/admin/categories", icon: "categories" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Transactions", href: "/admin/transactions", icon: "transactions" },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: "audit" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
] as const

export const PRIMARY_NAV_GUEST: readonly NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Market", href: "/markets", icon: "markets" },
  { label: "Trades", href: "/sign-in", icon: "portfolio" },
  { label: "Wallet", href: "/sign-in", icon: "wallet" },
  { label: "Create", href: "/sign-in", icon: "plus" },
] as const

export const BOTTOM_NAV_AUTHENTICATED: readonly NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Markets", href: "/markets", icon: "markets" },
  { label: "Portfolio", href: "/portfolio", icon: "portfolio" },
  { label: "Wallet", href: "/wallet", icon: "wallet" },
  { label: "Profile", href: "/profile", icon: "profile" },
] as const

export const BOTTOM_NAV_GUEST: readonly NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Markets", href: "/markets", icon: "markets" },
  { label: "Create", href: "/sign-in", icon: "plus" },
  { label: "Trades", href: "/sign-in", icon: "portfolio" },
  { label: "Profile", href: "/sign-in", icon: "profile" },
] as const

export const BOTTOM_NAV_ADMIN: readonly NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Markets", href: "/admin/markets", icon: "markets" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Transactions", href: "/admin/transactions", icon: "transactions" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
] as const

export const DEFAULT_CATEGORIES: readonly CategoryItem[] = [
  { label: "Entertainment", href: "/markets?category=entertainment" },
  { label: "Sports", href: "/markets?category=sports" },
  { label: "Politics", href: "/markets?category=politics" },
  { label: "Crypto", href: "/markets?category=crypto" },
] as const

export const DEFAULT_TICKER_ITEMS: readonly TickerItem[] = [
  { id: "1", label: "BBNaija Winner", change: "62%" },
  { id: "2", label: "Head of House", change: "48%" },
  { id: "3", label: "Eviction Night", change: "71%" },
  { id: "4", label: "Veto Power", change: "35%" },
  { id: "5", label: "Twist Incoming", change: "54%" },
] as const

export const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  home: Home,
  markets: Store,
  portfolio: Briefcase,
  wallet: Wallet,
  notifications: Bell,
  settings: Settings,
  profile: User,
  users: Users,
  transactions: ArrowLeftRight,
  audit: ScrollText,
  categories: Tags,
  dashboard: LayoutDashboard,
  plus: Plus,
}

export const PLACEHOLDER_BALANCE = "₦125,000.00"
export const PLACEHOLDER_USER_NAME = "Sheybi User"
