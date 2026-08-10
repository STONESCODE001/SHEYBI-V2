/**
 * Repository Interface Definitions
 * =================================
 * This file defines the TypeScript contracts for every database operation
 * that the Prediction Engine integration layer needs.
 *
 * ARCHITECTURE:
 * - Server Actions import these interfaces, never concrete implementations.
 * - MockRepository implements these with in-memory Maps (current).
 * - InstantDBRepository will implement these with adminDb.transact() (future).
 * - Swapping implementations requires changing ONE import in index.ts.
 *
 * RULES:
 * - All methods are async (even mock) to match real DB signatures.
 * - All financial amounts use number type (Naira with 4 decimal precision).
 * - All timestamps use number type (Unix milliseconds).
 * - All IDs use string type (UUIDs).
 *
 * @see context/feature-specs/12-prediction-engine-integration.md
 */

import type {
  Market,
  MarketOption,
  MarketState,
  MarketType,
  Position,
  PositionState,
  SettlementStatus,
} from '@/lib/prediction-engine/types';

// Re-export engine types so Server Actions only import from repositories
export type {
  Market,
  MarketOption,
  MarketState,
  MarketType,
  Position,
  PositionState,
  SettlementStatus,
};

// ============================================================================
// DATA TYPES — Used for creating and updating records
// ============================================================================

/**
 * Display variant determines how the UI renders the market card.
 * - "binary": YES/NO buttons
 * - "1v1": Side-by-side contestant cards with YES/NO under each (4-option multi_option)
 * - "standard": Candidate list with probability bars (3+ option multi_option)
 *
 * The engine ignores this field — it's purely a UI hint.
 */
export type DisplayVariant = 'binary' | '1v1' | 'standard';

/**
 * Data required to create a new market.
 * This is what the admin creation form produces after validation.
 */
export interface MarketCreateData {
  title: string;
  description: string;
  categorySlug?: string;
  marketType: MarketType;
  displayVariant: DisplayVariant;
  state: MarketState;
  openingTime: number;
  closingTime: number;
  liquidity: number;
  liquidityParam: number; // LMSR b = L / (N * ln(N))
  tradingVolume: number;  // Always 0 for new markets
  totalTrades: number;    // Always 0 for new markets
  createdBy: string;      // Clerk userId of admin
  imageUrl?: string;
  slug: string;
  isFeatured: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Data required to create a market option.
 * Binary markets get 2 options, 1v1 gets 4, multi-option gets 3+.
 */
export interface OptionCreateData {
  name: string;
  displayOrder: number;
  probability: number;     // Initial equal split as a fraction (e.g. 0.5 for binary, 0.25 for 1v1)
  sharePrice: number;      // Initial price = 1/N (e.g. 0.5 for binary, 0.25 for 1v1)
  sharesOutstanding: number; // Always 0 for new markets
  isWinningOption: boolean;  // Always false for new markets
  imageUrl?: string;       // Contestant avatar for 1v1 and multi-option
  createdAt: number;
}

/**
 * Fields that can be updated on a market after creation.
 * Used for state transitions, volume updates, and resolution.
 */
export interface MarketUpdateData {
  state: MarketState;
  closingTime: number;
  resolutionTime: number;
  tradingVolume: number;
  totalTrades: number;
  winningOptionId: string;
  updatedAt: number;
}

/**
 * Fields that can be updated on a single option.
 * Used by the engine after processing a trade.
 */
export interface OptionUpdateData {
  probability: number;
  sharePrice: number;
  sharesOutstanding: number;
  isWinningOption: boolean;
  isPaused: boolean;
}

/**
 * Batch update payload for updating all options in one operation.
 * Used after every trade to update the full probability vector atomically.
 *
 * IMPORTANT: When swapping to InstantDB, this maps to a single
 * adminDb.transact() call with multiple tx.market_options[id].update() ops.
 */
export interface OptionBatchUpdate {
  optionId: string;
  sharesOutstanding: number;
  probability: number;
  sharePrice: number;
}

/**
 * Market activity feed entry.
 * Appended after every significant market event (trade, state change, etc.).
 */
export interface MarketActivityData {
  activityType:
  | 'created'
  | 'opened'
  | 'paused'
  | 'unpaused'
  | 'trade'
  | 'closed'
  | 'reopened'
  | 'resolved'
  | 'cancelled'
  | 'extended'
  | 'option_paused'
  | 'option_unpaused';
  description: string;
  relatedUserId?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

// ============================================================================
// WALLET TYPES
// ============================================================================

/**
 * Wallet record as stored in the database.
 */
export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number; // Funds ready for trading or withdrawal
  lockedBalance: number;    // Funds committed to open positions
  createdAt: number;
  updatedAt: number;
}

/**
 * Delta values for wallet balance updates.
 * Positive = increase, Negative = decrease.
 *
 * WALLET BALANCE MODEL (from 12-prediction-engine-integration.md):
 * - Buy:              availableBalance -= tradeAmount, lockedBalance += tradeAmount
 * - Sell:             lockedBalance -= proportionalInvested, availableBalance += netProceeds
 * - Settlement (win): lockedBalance -= invested, availableBalance += payout
 * - Settlement (loss):lockedBalance -= invested
 * - Cancel refund:    lockedBalance -= invested, availableBalance += invested
 * - Deposit:          availableBalance += amount
 * - Withdrawal req:   availableBalance -= amount (lockedBalance NEVER touched)
 * - Withdrawal reject:availableBalance += amount
 */
export interface WalletBalanceDeltas {
  availableBalanceDelta: number;
  lockedBalanceDelta: number;
}

// ============================================================================
// POSITION TYPES
// ============================================================================

/**
 * Data required to create a new position.
 * Created on a user's first buy of a specific option in a market.
 */
export interface PositionCreateData {
  userId: string;
  marketId: string;
  optionId: string;
  sharesOwned: number;
  investedAmount: number;     // Gross amount spent (trade amount, NOT net after fee)
  averageEntryPrice: number;
  state: PositionState;       // 'open'
  settlementStatus: SettlementStatus; // 'unsettled'
  createdAt: number;
  updatedAt: number;
}

/**
 * Fields that can be updated on a position.
 * Used after buys (add shares), sells (remove shares), and settlement.
 */
export interface PositionUpdateData {
  sharesOwned: number;
  investedAmount: number;
  averageEntryPrice: number;
  state: PositionState;
  settlementStatus: SettlementStatus;
  realizedProfitLoss: number;
  updatedAt: number;
}

// ============================================================================
// LEDGER TYPES
// ============================================================================

/**
 * Ledger event types.
 * Every financial mutation creates exactly one ledger entry with one of these types.
 */
export type LedgerEventType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_REFUND'
  | 'TRADE_BUY'
  | 'TRADE_SELL'
  | 'TRADING_FEE'
  | 'WITHDRAWAL_FEE'
  | 'SETTLEMENT_WIN'
  | 'SETTLEMENT_LOSS'
  | 'REFUND_CANCEL';

/**
 * Data required to create an immutable ledger entry.
 *
 * IMMUTABILITY RULE: Once created, ledger entries can NEVER be modified or deleted.
 * Corrections must create NEW entries (e.g. WITHDRAWAL_REFUND to reverse a WITHDRAWAL).
 */
export interface LedgerEntryData {
  userId: string;
  eventType: LedgerEventType;
  amount: number;
  sourceAccountId: string;       // Origin of funds (e.g. user wallet ID)
  destinationAccountId: string;  // Destination (e.g. platform fee account, user wallet)
  description: string;           // Human-readable explanation
  idempotencyKey: string;        // Unique key preventing duplicate entries
  balanceAfter: number;          // User's available balance after this event
  referenceId?: string;          // Related record ID (position, market, withdrawal, etc.)
  metadata?: Record<string, unknown>;
  createdAt: number;
}

/**
 * Ledger entry as stored in the database (includes generated ID).
 */
export interface LedgerEntry extends LedgerEntryData {
  id: string;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

/**
 * Audit log action types.
 * Every administrative action creates an immutable audit record.
 */
export type AuditActionType =
  | 'CREATE_MARKET'
  | 'OPEN_MARKET'
  | 'PAUSE_MARKET'
  | 'UNPAUSE_MARKET'
  | 'CLOSE_MARKET'
  | 'REOPEN_MARKET'
  | 'RESOLVE_MARKET'
  | 'CANCEL_MARKET'
  | 'APPROVE_WITHDRAWAL'
  | 'REJECT_WITHDRAWAL'
  | 'SUSPEND_USER'
  | 'PAUSE_MARKET_OPTION'
  | 'UNPAUSE_MARKET_OPTION';

/**
 * Data required to create an immutable audit log entry.
 */
export interface AuditLogData {
  adminUserId: string;
  actionType: AuditActionType;
  targetEntityId: string;
  details: Record<string, unknown>;
  createdAt: number;
}

/**
 * Audit log entry as stored (includes generated ID).
 */
export interface AuditLogEntry extends AuditLogData {
  id: string;
}

// ============================================================================
// REPOSITORY INTERFACES
// ============================================================================

/**
 * Market data access operations.
 *
 * INSTANTDB SWAP GUIDE:
 * - getMarketById → adminDb.query({ markets: { options: {}, $: { where: { id } } } })
 * - createMarket → adminDb.transact([tx.markets[id].update(...), tx.market_options[id].update(...)])
 * - updateMarketOptions → adminDb.transact(updates.map(u => tx.market_options[u.optionId].update(...)))
 */
export interface IMarketRepository {
  /** Fetch a single market by ID, including its options array. */
  getMarketById(marketId: string): Promise<Market | null>;

  /** Fetch all markets, optionally filtered by state. */
  getMarkets(filter?: { state?: MarketState; categoryId?: string }): Promise<Market[]>;

  /** Persist a new market and its options. Returns the created market ID. */
  createMarket(marketData: MarketCreateData, optionsData: OptionCreateData[]): Promise<string>;

  /** Update a market's mutable fields (state, volume, winning option, etc.). */
  updateMarket(marketId: string, updates: Partial<MarketUpdateData>): Promise<void>;

  /** Update a single option's fields (probability, price, shares). */
  updateMarketOption(optionId: string, updates: Partial<OptionUpdateData>): Promise<void>;

  /**
   * Batch update ALL options for a market after a trade.
   * This must be atomic — either all options update or none do.
   *
   * INSTANTDB: Use a single adminDb.transact() call.
   */
  updateMarketOptions(marketId: string, optionUpdates: OptionBatchUpdate[]): Promise<void>;

  /** Append a market activity feed entry. */
  addMarketActivity(marketId: string, activity: MarketActivityData): Promise<void>;
}

/**
 * Wallet data access operations.
 *
 * INSTANTDB SWAP GUIDE:
 * - getWalletByUserId → adminDb.query({ wallets: { $: { where: { userId } } } })
 * - updateWalletBalance → adminDb.transact([tx.wallets[id].update({ availableBalance, lockedBalance })])
 */
export interface IWalletRepository {
  /** Fetch wallet by user ID. Returns null if user has no wallet. */
  getWalletByUserId(userId: string): Promise<Wallet | null>;

  /** Create a new wallet for a user (called during registration). Returns wallet ID. */
  createWallet(userId: string): Promise<string>;

  /**
   * Update wallet balances using deltas (not absolute values).
   * This prevents race conditions — the repository reads the current balance
   * and applies the delta, rather than overwriting with a potentially stale value.
   *
   * INVARIANT: Wallet balances must NEVER become negative.
   * The repository must throw if a delta would cause a negative balance.
   */
  updateWalletBalance(userId: string, deltas: WalletBalanceDeltas): Promise<void>;
}

/**
 * Position data access operations.
 *
 * INSTANTDB SWAP GUIDE:
 * - getActivePositionInMarket → adminDb.query({ positions: { $: { where: { userId, marketId } } } })
 *   then filter for state in ('open', 'partially_sold')
 * - getPositionsByMarket → adminDb.query({ positions: { $: { where: { marketId } } } })
 */
export interface IPositionRepository {
  /**
   * Fetch a user's ACTIVE position in a specific market (any option).
   * "Active" means state is 'open' or 'partially_sold'.
   * Returns null if no active position exists.
   *
   * Used by Single-Outcome Exposure Invariant check.
   */
  getActivePositionInMarket(userId: string, marketId: string): Promise<Position | null>;

  /** Fetch a user's position for a specific option (any state). */
  getPositionByUserAndOption(userId: string, optionId: string): Promise<Position | null>;

  /** Fetch ALL positions for a market (any state). Used during settlement. */
  getPositionsByMarket(marketId: string): Promise<Position[]>;

  /** Fetch ALL positions for a user (any state). Used for portfolio view. */
  getPositionsByUser(userId: string): Promise<Position[]>;

  /** Create a new position record. Returns position ID. */
  createPosition(data: PositionCreateData): Promise<string>;

  /** Update an existing position's fields. */
  updatePosition(positionId: string, updates: Partial<PositionUpdateData>): Promise<void>;
}

/**
 * Ledger data access operations.
 *
 * IMMUTABILITY: The ledger is append-only. No update or delete methods exist.
 *
 * INSTANTDB SWAP GUIDE:
 * - createLedgerEntry → adminDb.transact([tx.ledger[newId].update({ ...entry })])
 * - idempotencyKeyExists → adminDb.query({ ledger: { $: { where: { idempotencyKey } } } })
 */
export interface ILedgerRepository {
  /** Create an immutable ledger entry. Returns entry ID. */
  createLedgerEntry(entry: LedgerEntryData): Promise<string>;

  /** Fetch all ledger entries for a user (for transaction history). Ordered by createdAt desc. */
  getLedgerEntriesByUser(userId: string): Promise<LedgerEntry[]>;

  /**
   * Check if an idempotency key already exists.
   * Used to prevent duplicate financial events (e.g. double-clicking buy button).
   * If true, the operation should be silently skipped or return the original result.
   */
  idempotencyKeyExists(key: string): Promise<boolean>;
}

/**
 * Audit log data access operations.
 *
 * IMMUTABILITY: Audit logs are append-only. No update or delete methods exist.
 */
export interface IAuditLogRepository {
  /** Create an immutable audit log entry. Returns entry ID. */
  createAuditLog(entry: AuditLogData): Promise<string>;
}

// ============================================================================
// WITHDRAWAL REQUEST TYPES
// ============================================================================

export interface WithdrawalRequestCreateData {
  userId: string;
  reference?: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface WithdrawalRequestUpdateData {
  status: string;
  rejectionReason?: string;
  approvedBy?: string;
  updatedAt: number;
}

export interface WithdrawalRequest extends WithdrawalRequestCreateData {
  id: string;
  reference?: string;
  rejectionReason?: string;
  approvedBy?: string;
}

export interface IWithdrawalRepository {
  createWithdrawalRequest(data: WithdrawalRequestCreateData): Promise<string>;
  getWithdrawalRequests(filter?: { status?: string }): Promise<WithdrawalRequest[]>;
  updateWithdrawalRequest(id: string, updates: Partial<WithdrawalRequestUpdateData>): Promise<void>;
}

// ============================================================================
// MARKET SUGGESTION TYPES
// ============================================================================

export interface MarketSuggestionCreateData {
  submittedBy: string;
  submitterName: string;
  title: string;
  description: string;
  categorySlug?: string;
  status: string;
  createdAt: number;
}

export interface MarketSuggestionUpdateData {
  status: string;
  reviewedBy?: string;
  reviewedAt?: number;
  rejectionReason?: string;
  convertedMarketId?: string;
}

export interface MarketSuggestion extends MarketSuggestionCreateData {
  id: string;
  reviewedBy?: string;
  reviewedAt?: number;
  rejectionReason?: string;
  convertedMarketId?: string;
}

export interface ISuggestionRepository {
  createMarketSuggestion(data: MarketSuggestionCreateData): Promise<string>;
  getMarketSuggestions(filter?: { status?: string }): Promise<MarketSuggestion[]>;
  updateMarketSuggestion(id: string, updates: Partial<MarketSuggestionUpdateData>): Promise<void>;
}

// ============================================================================
// COMBINED REPOSITORY
// ============================================================================

/**
 * Combined repository interface.
 * The mock and InstantDB implementations both export a single object
 * satisfying this interface, making the swap a one-line change.
 *
 * Usage in Server Actions:
 *   import { repository } from '@/lib/repositories';
 *   const market = await repository.markets.getMarketById(id);
 */
export interface IRepository {
  markets: IMarketRepository;
  wallets: IWalletRepository;
  positions: IPositionRepository;
  ledger: ILedgerRepository;
  auditLogs: IAuditLogRepository;
  withdrawals: IWithdrawalRepository;
  suggestions: ISuggestionRepository;
}
