"use client"

import { DialogRegistry } from "./dialog-registry"

// Import Infrastructure Dialogs
import { AlertDialog } from "./infrastructure/alert-dialog"
import { ConfirmDialog } from "./infrastructure/confirm-dialog"
import { ErrorDialog } from "./infrastructure/error-dialog"
import { LoadingDialog } from "./infrastructure/loading-dialog"
import { SuccessDialog } from "./infrastructure/success-dialog"
import { InfoDialog } from "./infrastructure/info-dialog"
import { SessionExpiredDialog } from "./infrastructure/session-expired-dialog"
import { MaintenanceDialog } from "./infrastructure/maintenance-dialog"
import { OfflineDialog } from "./infrastructure/offline-dialog"
import { MarketResolvedDialog } from "./infrastructure/market-resolved-dialog"
import { MarketSuspendedDialog } from "./infrastructure/market-suspended-dialog"
import { ComingSoonDialog } from "./infrastructure/coming-soon-dialog"
import { RateLimitDialog } from "./infrastructure/rate-limit-dialog"
import { KYCRequiredDialog } from "./infrastructure/kyc-required-dialog"

// Import Feature Dialogs
import { SearchDialog } from "./features/search/search-dialog"
import { NotificationsDialog } from "./features/notifications/notifications-dialog"
import { WalletDetailsDialog } from "./features/wallet/wallet-details-dialog"
import { DepositDialog } from "./features/wallet/deposit-dialog"
import { WithdrawDialog } from "./features/wallet/withdraw-dialog"
import { TradeConfirmDialog } from "./features/market/trade-confirm-dialog"
import { TradeDialog } from "./features/market/trade-dialog"
import { ShareDialog } from "./features/market/share-dialog"
import { FilterDialog } from "./features/market/filter-dialog"
import { MarketSuggestionDialog } from "./features/market/market-suggestion-dialog"
import { ResolveMarketDialog } from "./features/market/resolve-market-dialog"
import { ReopenMarketDialog } from "./features/market/reopen-market-dialog"
import { PauseMarketDialog } from "./features/market/pause-market-dialog"
import { ProfileMenuDialog } from "./features/profile/profile-menu-dialog"
import { EditProfileDialog } from "./features/profile/edit-profile-dialog"
import { ChangeEmailDialog } from "./features/settings/change-email-dialog"
import { UpdatePasswordDialog } from "./features/settings/update-password-dialog"

let registered = false

export function registerDialogs() {
  if (registered) return
  registered = true

  console.log("[Dialog Framework] Centralizing registration for all application dialogs...")

  // Infrastructure Preset Registration
  DialogRegistry.register("system/alert", AlertDialog as any)
  DialogRegistry.register("system/confirm", ConfirmDialog as any)
  DialogRegistry.register("system/error", ErrorDialog as any)
  DialogRegistry.register("system/loading", LoadingDialog as any)
  DialogRegistry.register("system/success", SuccessDialog as any)
  DialogRegistry.register("system/info", InfoDialog as any)

  // Additional Infrastructure Dialogs
  DialogRegistry.register("system/session-expired", SessionExpiredDialog as any)
  DialogRegistry.register("system/maintenance", MaintenanceDialog as any)
  DialogRegistry.register("system/offline", OfflineDialog as any)
  DialogRegistry.register("system/market-resolved", MarketResolvedDialog as any)
  DialogRegistry.register("system/market-suspended", MarketSuspendedDialog as any)
  DialogRegistry.register("system/coming-soon", ComingSoonDialog as any)
  DialogRegistry.register("system/rate-limit", RateLimitDialog as any)
  DialogRegistry.register("system/kyc-required", KYCRequiredDialog as any)

  // Feature Dialogs Registration
  DialogRegistry.register("global/search", SearchDialog as any)
  DialogRegistry.register("global/notifications", NotificationsDialog as any)
  DialogRegistry.register("wallet/details", WalletDetailsDialog as any)
  DialogRegistry.register("wallet/deposit", DepositDialog as any)
  DialogRegistry.register("wallet/withdraw", WithdrawDialog as any)
  DialogRegistry.register("trade/confirm", TradeConfirmDialog as any)
  DialogRegistry.register("trade/dialog", TradeDialog as any)
  DialogRegistry.register("trade/panel", TradeDialog as any)
  DialogRegistry.register("market/share", ShareDialog as any)
  DialogRegistry.register("market/filters", FilterDialog as any)
  DialogRegistry.register("market/suggestion", MarketSuggestionDialog as any)
  DialogRegistry.register("market/resolve", ResolveMarketDialog as any)
  DialogRegistry.register("market/reopen", ReopenMarketDialog as any)
  DialogRegistry.register("market/pause", PauseMarketDialog as any)
  DialogRegistry.register("profile/menu", ProfileMenuDialog as any)
  DialogRegistry.register("profile/edit", EditProfileDialog as any)
  DialogRegistry.register("settings/change-email", ChangeEmailDialog as any)
  DialogRegistry.register("settings/update-password", UpdatePasswordDialog as any)
}
