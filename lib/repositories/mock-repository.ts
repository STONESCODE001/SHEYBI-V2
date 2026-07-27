/**
 * Mock Repository Implementation
 * ================================
 * In-memory implementation of all repository interfaces using Map data structures.
 * Ships with realistic seed data so the entire trading flow can run end-to-end
 * without any external database.
 *
 * SEED DATA INCLUDES:
 * - 1 binary market: "Will a Female Housemate win HoH this week?" (YES/NO, ₦100k liquidity)
 * - 1 1v1 market: "Mike vs Mercy: Who Survives Eviction?" (4 options at 25% each, ₦100k liquidity)
 * - 1 multi-option market: "Who will be evicted?" (3 options at 33.33% each, ₦200k liquidity)
 * - 2 user wallets: demoplayer (₦50k available) and bbnaijafan (₦25k available, ₦5k locked)
 * - 1 existing position: bbnaijafan holds YES shares in the binary market
 *
 * SWAP TO INSTANTDB:
 * When InstantDB is configured, create lib/repositories/instantdb-repository.ts
 * implementing the same IRepository interface, then change the export in index.ts.
 * See context/feature-specs/12-prediction-engine-integration.md §"How to Swap".
 *
 * @see lib/repositories/types.ts for interface definitions
 */

import { calculateB, calculateProbabilities } from '@/lib/prediction-engine/lmsr';
import type {
  Market,
  MarketOption,
  Position,
} from '@/lib/prediction-engine/types';

import type {
  AuditLogData,
  AuditLogEntry,
  IRepository,
  LedgerEntry,
  LedgerEntryData,
  MarketActivityData,
  MarketCreateData,
  MarketUpdateData,
  OptionBatchUpdate,
  OptionCreateData,
  OptionUpdateData,
  PositionCreateData,
  PositionUpdateData,
  Wallet,
  WalletBalanceDeltas,
} from './types';
import type { MarketState } from './types';

// ============================================================================
// SEED DATA CONSTANTS
// ============================================================================

/** Platform fee account ID — used as destinationAccountId for fee ledger entries */
const PLATFORM_FEE_ACCOUNT = 'platform_fee_account';

/** Seed user IDs — these match what Clerk would return in production */
const SEED_USERS = {
  DEMO_PLAYER: 'user_demo_001',
  BBNAIJA_FAN: 'user_demo_002',
  ADMIN: 'user_admin_001',
} as const;

/** Seed market IDs */
const SEED_MARKETS = {
  BINARY: 'mkt_binary_001',
  ONE_V_ONE: 'mkt_1v1_001',
  MULTI: 'mkt_multi_001',
} as const;

/** Seed option IDs */
const SEED_OPTIONS = {
  // Binary market options
  BINARY_YES: 'opt_binary_yes',
  BINARY_NO: 'opt_binary_no',
  // 1v1 market options (4 total)
  MIKE_YES: 'opt_mike_yes',
  MIKE_NO: 'opt_mike_no',
  MERCY_YES: 'opt_mercy_yes',
  MERCY_NO: 'opt_mercy_no',
  // Multi-option market options
  SEYI: 'opt_seyi',
  VENITA: 'opt_venita',
  ADEKUNLE: 'opt_adekunle',
} as const;

// ============================================================================
// SEED DATA GENERATORS
// ============================================================================

/**
 * Creates the initial set of markets with correct LMSR parameters.
 * Each market's liquidityParam (b) is calculated using calculateB(liquidity, numOptions).
 */
function createSeedMarkets(): Map<string, Market> {
  const now = Date.now();
  const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;

  const markets = new Map<string, Market>();

  // ---- BINARY MARKET: 2 options, 50/50 split ----
  const binaryLiquidity = 100_000;
  const binaryB = calculateB(binaryLiquidity, 2);

  markets.set(SEED_MARKETS.BINARY, {
    id: SEED_MARKETS.BINARY,
    title: 'Will a Female Housemate win HoH this week?',
    description: 'Predict whether a female housemate will win the Head of House challenge this week.',
    marketType: 'binary',
    state: 'open',
    openingTime: now - 3600_000, // Opened 1 hour ago
    closingTime: oneWeekFromNow,
    liquidity: binaryLiquidity,
    liquidityParam: binaryB,
    tradingVolume: 5_000, // bbnaijafan already traded ₦5k
    totalTrades: 1,
    createdBy: SEED_USERS.ADMIN,
    options: [
      {
        id: SEED_OPTIONS.BINARY_YES,
        name: 'YES',
        displayOrder: 1,
        probability: 0.5,  // 50% — will update once we account for existing position
        sharePrice: 0.5,
        sharesOutstanding: 0, // Will be set after calculating existing position impact
        isWinningOption: false,
      },
      {
        id: SEED_OPTIONS.BINARY_NO,
        name: 'NO',
        displayOrder: 2,
        probability: 0.5,
        sharePrice: 0.5,
        sharesOutstanding: 0,
        isWinningOption: false,
      },
    ],
  });

  // Simulate the existing position's effect on the binary market.
  // bbnaijafan invested ₦5,000 on YES. Fee = 2.5% = ₦125. Net = ₦4,875.
  // We need to calculate how many shares ₦4,875 buys and update sharesOutstanding.
  // For simplicity in seed data, we pre-calculate approximate shares:
  // With b ≈ 144,269.5 and initial q = [0, 0], buying ₦4,875 net on option 0:
  // Δ ≈ b * ln((2 * e^(4875/b) - 1) / 1) ≈ 9,653 shares (approximate)
  const existingShares = 9_653;
  const binaryMarket = markets.get(SEED_MARKETS.BINARY)!;
  binaryMarket.options[0].sharesOutstanding = existingShares;
  // Recalculate probabilities with updated shares vector
  const binaryQ = [existingShares, 0];
  const binaryProbs = calculateProbabilities(binaryB, binaryQ);
  binaryMarket.options[0].probability = binaryProbs[0];
  binaryMarket.options[0].sharePrice = binaryProbs[0];
  binaryMarket.options[1].probability = binaryProbs[1];
  binaryMarket.options[1].sharePrice = binaryProbs[1];

  // ---- 1V1 MARKET: 4 options (Mike YES, Mike NO, Mercy YES, Mercy NO), 25% each ----
  const oneVOneLiquidity = 100_000;
  const oneVOneB = calculateB(oneVOneLiquidity, 4);

  markets.set(SEED_MARKETS.ONE_V_ONE, {
    id: SEED_MARKETS.ONE_V_ONE,
    title: 'Mike vs Mercy: Who Survives Eviction?',
    description: 'Predict the outcome of the eviction showdown between Mike and Mercy.',
    marketType: 'multi_option',
    state: 'open',
    openingTime: now - 7200_000, // Opened 2 hours ago
    closingTime: oneWeekFromNow,
    liquidity: oneVOneLiquidity,
    liquidityParam: oneVOneB,
    tradingVolume: 0,
    totalTrades: 0,
    createdBy: SEED_USERS.ADMIN,
    options: [
      {
        id: SEED_OPTIONS.MIKE_YES,
        name: 'Mike YES',
        displayOrder: 1,
        probability: 0.25,
        sharePrice: 0.25,
        sharesOutstanding: 0,
        isWinningOption: false,
      },
      {
        id: SEED_OPTIONS.MIKE_NO,
        name: 'Mike NO',
        displayOrder: 2,
        probability: 0.25,
        sharePrice: 0.25,
        sharesOutstanding: 0,
        isWinningOption: false,
      },
      {
        id: SEED_OPTIONS.MERCY_YES,
        name: 'Mercy YES',
        displayOrder: 3,
        probability: 0.25,
        sharePrice: 0.25,
        sharesOutstanding: 0,
        isWinningOption: false,
      },
      {
        id: SEED_OPTIONS.MERCY_NO,
        name: 'Mercy NO',
        displayOrder: 4,
        probability: 0.25,
        sharePrice: 0.25,
        sharesOutstanding: 0,
        isWinningOption: false,
      },
    ],
  });

  // ---- MULTI-OPTION MARKET: 3 options, ~33.33% each ----
  const multiLiquidity = 200_000;
  const multiB = calculateB(multiLiquidity, 3);

  // Calculate initial probabilities for 3 options (should be ~33.33% each)
  const multiProbs = calculateProbabilities(multiB, [0, 0, 0]);

  markets.set(SEED_MARKETS.MULTI, {
    id: SEED_MARKETS.MULTI,
    title: 'Who will be evicted from the BBNaija House on Sunday?',
    description: 'Predict which housemate will be evicted during the live Sunday show.',
    marketType: 'multi_option',
    state: 'open',
    openingTime: now - 1800_000, // Opened 30 mins ago
    closingTime: oneWeekFromNow,
    liquidity: multiLiquidity,
    liquidityParam: multiB,
    tradingVolume: 0,
    totalTrades: 0,
    createdBy: SEED_USERS.ADMIN,
    options: [
      {
        id: SEED_OPTIONS.SEYI,
        name: 'Seyi Awolowo',
        displayOrder: 1,
        probability: multiProbs[0],
        sharePrice: multiProbs[0],
        sharesOutstanding: 0,
        isWinningOption: false,
      },
      {
        id: SEED_OPTIONS.VENITA,
        name: 'Venita Akpofure',
        displayOrder: 2,
        probability: multiProbs[1],
        sharePrice: multiProbs[1],
        sharesOutstanding: 0,
        isWinningOption: false,
      },
      {
        id: SEED_OPTIONS.ADEKUNLE,
        name: 'Adekunle Olopade',
        displayOrder: 3,
        probability: multiProbs[2],
        sharePrice: multiProbs[2],
        sharesOutstanding: 0,
        isWinningOption: false,
      },
    ],
  });

  return markets;
}

/**
 * Creates the initial set of wallets.
 * Every user gets exactly one wallet with a starting balance.
 */
function createSeedWallets(): Map<string, Wallet> {
  const now = Date.now();
  const wallets = new Map<string, Wallet>();

  wallets.set('wallet_001', {
    id: 'wallet_001',
    userId: SEED_USERS.DEMO_PLAYER,
    availableBalance: 50_000,  // ₦50,000 available
    lockedBalance: 0,          // No open positions
    createdAt: now - 86400_000,
    updatedAt: now,
  });

  wallets.set('wallet_002', {
    id: 'wallet_002',
    userId: SEED_USERS.BBNAIJA_FAN,
    availableBalance: 25_000,  // ₦25,000 available
    lockedBalance: 5_000,      // ₦5,000 locked in binary market position
    createdAt: now - 86400_000,
    updatedAt: now,
  });

  wallets.set('wallet_003', {
    id: 'wallet_003',
    userId: SEED_USERS.ADMIN,
    availableBalance: 100_000, // ₦100,000 available
    lockedBalance: 0,
    createdAt: now - 86400_000,
    updatedAt: now,
  });

  return wallets;
}

/**
 * Creates seed positions.
 * bbnaijafan holds a YES position in the binary market.
 */
function createSeedPositions(): Map<string, Position> {
  const now = Date.now();
  const positions = new Map<string, Position>();

  positions.set('pos_001', {
    id: 'pos_001',
    userId: SEED_USERS.BBNAIJA_FAN,
    marketId: SEED_MARKETS.BINARY,
    optionId: SEED_OPTIONS.BINARY_YES,
    sharesOwned: 9_653,        // Approximate shares from ₦5,000 investment
    investedAmount: 5_000,     // Gross amount spent
    averageEntryPrice: 0.518,  // ₦4,875 net / 9,653 shares ≈ 0.505 (approx)
    state: 'open',
    settlementStatus: 'unsettled',
    realizedProfitLoss: 0,
  });

  return positions;
}

// ============================================================================
// MOCK REPOSITORY IMPLEMENTATION
// ============================================================================

/**
 * In-memory mock repository.
 * All data lives in Maps and is lost when the server restarts.
 * This is intentional — it's for development and testing only.
 */
class MockRepository implements IRepository {
  // Internal data stores
  private _markets: Map<string, Market>;
  private _options: Map<string, MarketOption & { marketId: string }>;
  private _wallets: Map<string, Wallet>;
  private _positions: Map<string, Position>;
  private _ledger: Map<string, LedgerEntry>;
  private _auditLogs: Map<string, AuditLogEntry>;
  private _marketActivity: Map<string, MarketActivityData & { id: string; marketId: string }>;
  private _idempotencyKeys: Set<string>;

  constructor() {
    // Initialize with seed data
    this._markets = createSeedMarkets();
    this._wallets = createSeedWallets();
    this._positions = createSeedPositions();
    this._ledger = new Map();
    this._auditLogs = new Map();
    this._marketActivity = new Map();
    this._idempotencyKeys = new Set();

    // Build options index from markets for fast lookup
    this._options = new Map();
    for (const market of this._markets.values()) {
      for (const option of market.options) {
        this._options.set(option.id, { ...option, marketId: market.id });
      }
    }
  }

  // ==========================================================================
  // MARKET REPOSITORY
  // ==========================================================================

  markets = {
    getMarketById: async (marketId: string): Promise<Market | null> => {
      return this._markets.get(marketId) ?? null;
    },

    getMarkets: async (filter?: { state?: MarketState; categoryId?: string }): Promise<Market[]> => {
      let results = Array.from(this._markets.values());

      if (filter?.state) {
        results = results.filter((m) => m.state === filter.state);
      }

      return results;
    },

    createMarket: async (
      marketData: MarketCreateData,
      optionsData: OptionCreateData[]
    ): Promise<string> => {
      const marketId = crypto.randomUUID();

      // Create option objects with generated IDs
      const options: MarketOption[] = optionsData.map((opt) => {
        const optionId = crypto.randomUUID();
        const option: MarketOption = {
          id: optionId,
          name: opt.name,
          displayOrder: opt.displayOrder,
          probability: opt.probability,
          sharePrice: opt.sharePrice,
          sharesOutstanding: opt.sharesOutstanding,
          isWinningOption: opt.isWinningOption,
        };
        // Index in options map for fast lookup
        this._options.set(optionId, { ...option, marketId });
        return option;
      });

      // Create market with options embedded
      const market: Market = {
        id: marketId,
        title: marketData.title,
        description: marketData.description,
        marketType: marketData.marketType,
        state: marketData.state,
        openingTime: marketData.openingTime,
        closingTime: marketData.closingTime,
        liquidity: marketData.liquidity,
        liquidityParam: marketData.liquidityParam,
        tradingVolume: marketData.tradingVolume,
        totalTrades: marketData.totalTrades,
        createdBy: marketData.createdBy,
        options,
      };

      this._markets.set(marketId, market);
      return marketId;
    },

    updateMarket: async (
      marketId: string,
      updates: Partial<MarketUpdateData>
    ): Promise<void> => {
      const market = this._markets.get(marketId);
      if (!market) throw new Error(`Market ${marketId} not found`);

      // Apply updates to the market object
      if (updates.state !== undefined) market.state = updates.state;
      if (updates.closingTime !== undefined) market.closingTime = updates.closingTime;
      if (updates.resolutionTime !== undefined) market.resolutionTime = updates.resolutionTime;
      if (updates.tradingVolume !== undefined) market.tradingVolume = updates.tradingVolume;
      if (updates.totalTrades !== undefined) market.totalTrades = updates.totalTrades;
      if (updates.winningOptionId !== undefined) market.winningOptionId = updates.winningOptionId;
    },

    updateMarketOption: async (
      optionId: string,
      updates: Partial<OptionUpdateData>
    ): Promise<void> => {
      const indexed = this._options.get(optionId);
      if (!indexed) throw new Error(`Option ${optionId} not found`);

      // Find the option in its parent market and update
      const market = this._markets.get(indexed.marketId);
      if (!market) throw new Error(`Market for option ${optionId} not found`);

      const option = market.options.find((o) => o.id === optionId);
      if (!option) throw new Error(`Option ${optionId} not found in market options`);

      if (updates.probability !== undefined) option.probability = updates.probability;
      if (updates.sharePrice !== undefined) option.sharePrice = updates.sharePrice;
      if (updates.sharesOutstanding !== undefined) option.sharesOutstanding = updates.sharesOutstanding;
      if (updates.isWinningOption !== undefined) option.isWinningOption = updates.isWinningOption;

      // Keep index in sync
      this._options.set(optionId, { ...option, marketId: indexed.marketId });
    },

    updateMarketOptions: async (
      marketId: string,
      optionUpdates: OptionBatchUpdate[]
    ): Promise<void> => {
      /**
       * ATOMIC BATCH UPDATE
       * In the mock, this updates all options sequentially.
       * In InstantDB, this would be a single adminDb.transact() call.
       */
      for (const update of optionUpdates) {
        await this.markets.updateMarketOption(update.optionId, {
          sharesOutstanding: update.sharesOutstanding,
          probability: update.probability,
          sharePrice: update.sharePrice,
        });
      }
    },

    addMarketActivity: async (
      marketId: string,
      activity: MarketActivityData
    ): Promise<void> => {
      const id = crypto.randomUUID();
      this._marketActivity.set(id, { id, marketId, ...activity });
    },
  };

  // ==========================================================================
  // WALLET REPOSITORY
  // ==========================================================================

  wallets = {
    getWalletByUserId: async (userId: string): Promise<Wallet | null> => {
      for (const wallet of this._wallets.values()) {
        if (wallet.userId === userId) return wallet;
      }
      return null;
    },

    createWallet: async (userId: string): Promise<string> => {
      const id = crypto.randomUUID();
      const wallet: Wallet = {
        id,
        userId,
        availableBalance: 0,
        lockedBalance: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this._wallets.set(id, wallet);
      return id;
    },

    updateWalletBalance: async (
      userId: string,
      deltas: WalletBalanceDeltas
    ): Promise<void> => {
      const wallet = await this.wallets.getWalletByUserId(userId);
      if (!wallet) throw new Error(`Wallet not found for user ${userId}`);

      const newAvailable = wallet.availableBalance + deltas.availableBalanceDelta;
      const newLocked = wallet.lockedBalance + deltas.lockedBalanceDelta;

      /**
       * FINANCIAL INVARIANT: Wallet balances must NEVER become negative.
       * This is the last line of defense — Server Actions should validate
       * before reaching this point, but the repository enforces it as well.
       */
      if (newAvailable < -0.0001) {
        throw new Error(
          `Wallet balance invariant violation: availableBalance would become ${newAvailable} ` +
          `(current: ${wallet.availableBalance}, delta: ${deltas.availableBalanceDelta})`
        );
      }
      if (newLocked < -0.0001) {
        throw new Error(
          `Wallet balance invariant violation: lockedBalance would become ${newLocked} ` +
          `(current: ${wallet.lockedBalance}, delta: ${deltas.lockedBalanceDelta})`
        );
      }

      wallet.availableBalance = Math.max(0, newAvailable); // Clamp tiny floating point errors
      wallet.lockedBalance = Math.max(0, newLocked);
      wallet.updatedAt = Date.now();
    },
  };

  // ==========================================================================
  // POSITION REPOSITORY
  // ==========================================================================

  positions = {
    getActivePositionInMarket: async (
      userId: string,
      marketId: string
    ): Promise<Position | null> => {
      /**
       * SINGLE-OUTCOME EXPOSURE INVARIANT:
       * This method finds the user's active position (state = 'open' or 'partially_sold')
       * in a specific market, regardless of which option they hold.
       * Used to enforce: "User can only hold ONE position per market."
       */
      for (const position of this._positions.values()) {
        if (
          position.userId === userId &&
          position.marketId === marketId &&
          (position.state === 'open' || position.state === 'partially_sold')
        ) {
          return position;
        }
      }
      return null;
    },

    getPositionByUserAndOption: async (
      userId: string,
      optionId: string
    ): Promise<Position | null> => {
      for (const position of this._positions.values()) {
        if (
          position.userId === userId &&
          position.optionId === optionId &&
          (position.state === 'open' || position.state === 'partially_sold')
        ) {
          return position;
        }
      }
      return null;
    },

    getPositionsByMarket: async (marketId: string): Promise<Position[]> => {
      return Array.from(this._positions.values()).filter(
        (p) => p.marketId === marketId
      );
    },

    getPositionsByUser: async (userId: string): Promise<Position[]> => {
      return Array.from(this._positions.values()).filter(
        (p) => p.userId === userId
      );
    },

    createPosition: async (data: PositionCreateData): Promise<string> => {
      const id = crypto.randomUUID();
      const position: Position = {
        id,
        userId: data.userId,
        marketId: data.marketId,
        optionId: data.optionId,
        sharesOwned: data.sharesOwned,
        investedAmount: data.investedAmount,
        averageEntryPrice: data.averageEntryPrice,
        state: data.state,
        settlementStatus: data.settlementStatus,
        realizedProfitLoss: 0,
      };
      this._positions.set(id, position);
      return id;
    },

    updatePosition: async (
      positionId: string,
      updates: Partial<PositionUpdateData>
    ): Promise<void> => {
      const position = this._positions.get(positionId);
      if (!position) throw new Error(`Position ${positionId} not found`);

      if (updates.sharesOwned !== undefined) position.sharesOwned = updates.sharesOwned;
      if (updates.investedAmount !== undefined) position.investedAmount = updates.investedAmount;
      if (updates.averageEntryPrice !== undefined) position.averageEntryPrice = updates.averageEntryPrice;
      if (updates.state !== undefined) position.state = updates.state;
      if (updates.settlementStatus !== undefined) position.settlementStatus = updates.settlementStatus;
      if (updates.realizedProfitLoss !== undefined) position.realizedProfitLoss = updates.realizedProfitLoss;
    },
  };

  // ==========================================================================
  // LEDGER REPOSITORY
  // ==========================================================================

  ledger = {
    createLedgerEntry: async (entry: LedgerEntryData): Promise<string> => {
      /**
       * IDEMPOTENCY CHECK:
       * If this idempotency key already exists, silently skip the write.
       * This prevents double-clicking the buy button from creating duplicate trades.
       */
      if (this._idempotencyKeys.has(entry.idempotencyKey)) {
        throw new Error(`Duplicate idempotency key: ${entry.idempotencyKey}`);
      }

      const id = crypto.randomUUID();
      const ledgerEntry: LedgerEntry = { id, ...entry };

      /**
       * IMMUTABILITY: Once a ledger entry is set, it can NEVER be modified or deleted.
       * The mock enforces this by never exposing update/delete methods.
       */
      this._ledger.set(id, ledgerEntry);
      this._idempotencyKeys.add(entry.idempotencyKey);
      return id;
    },

    getLedgerEntriesByUser: async (userId: string): Promise<LedgerEntry[]> => {
      return Array.from(this._ledger.values())
        .filter((e) => e.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt); // Newest first
    },

    idempotencyKeyExists: async (key: string): Promise<boolean> => {
      return this._idempotencyKeys.has(key);
    },
  };

  // ==========================================================================
  // AUDIT LOG REPOSITORY
  // ==========================================================================

  auditLogs = {
    createAuditLog: async (entry: AuditLogData): Promise<string> => {
      const id = crypto.randomUUID();
      const logEntry: AuditLogEntry = { id, ...entry };
      this._auditLogs.set(id, logEntry);
      return id;
    },
  };
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Single mock repository instance.
 * This maintains state across Server Action calls within the same server process.
 *
 * IMPORTANT: State is lost on server restart. This is fine for development.
 * In production, InstantDB persists all data permanently.
 */
export const mockRepository: IRepository = new MockRepository();
