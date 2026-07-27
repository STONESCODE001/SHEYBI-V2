import { i } from "@instantdb/react";

const schema = i.schema({
  entities: {
    // --- PREDICTION & MARKET DOMAIN ---

    categories: i.entity({
      name: i.string(),
      slug: i.string().unique(),
      description: i.string().optional(),
      icon: i.string().optional(),
      displayOrder: i.number(),
      isActive: i.boolean(),
      createdAt: i.number(), // Unix timestamp ms
    }),

    markets: i.entity({
      title: i.string(),
      description: i.string(),
      marketType: i.string(), // "binary" | "multi_option"
      state: i.string(), // "draft" | "scheduled" | "open" | "paused" | "closed" | "resolved" | "cancelled"
      openingTime: i.number(), // Unix timestamp ms
      closingTime: i.number(), // Unix timestamp ms
      resolutionTime: i.number().optional(),
      liquidity: i.number(), // Admin-assigned Naira amount L
      liquidityParam: i.number(), // Computed LMSR `b` parameter
      tradingVolume: i.number(), // Cumulative ₦ traded
      totalTrades: i.number(), // Count of completed trades
      winningOptionId: i.string().optional(),
      createdBy: i.string(), // Clerk userId
      imageUrl: i.string().optional(), // Market thumbnail
      slug: i.string().unique(),
      isFeatured: i.boolean(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    market_options: i.entity({
      name: i.string(),
      displayOrder: i.number(),
      probability: i.number(), // 0-100 (percentage)
      sharePrice: i.number(), // Current ₦ price per share (0 < price < 1)
      sharesOutstanding: i.number(), // Total outstanding shares (LMSR q_i)
      isWinningOption: i.boolean(),
      imageUrl: i.string().optional(), // Contestant avatar
      createdAt: i.number(),
    }),

    positions: i.entity({
      userId: i.string(),
      marketId: i.string(),
      optionId: i.string(),
      sharesOwned: i.number(),
      investedAmount: i.number(), // Gross amount spent
      averageEntryPrice: i.number(),
      state: i.string(), // "open" | "partially_sold" | "closed" | "won" | "lost" | "cancelled"
      settlementStatus: i.string(), // "unsettled" | "settled"
      realizedProfitLoss: i.number().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    wallets: i.entity({
      userId: i.string().unique(),
      availableBalance: i.number(),
      lockedBalance: i.number(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    ledger: i.entity({
      transactionId: i.string(),
      userId: i.string(),
      eventType: i.string(), // "DEPOSIT" | "WITHDRAWAL" | "TRADE_BUY" | "TRADE_SELL" | "SETTLEMENT_WIN" | "REFUND_CANCEL" | "TRADING_FEE" | "WITHDRAWAL_FEE"
      amount: i.number(),
      sourceAccountId: i.string(),
      destinationAccountId: i.string(),
      description: i.string(),
      metadata: i.json().optional(),
      createdAt: i.number(),
    }),

    market_activity: i.entity({
      activityType: i.string(), // "created" | "opened" | "paused" | "unpaused" | "trade" | "closed" | "reopened" | "resolved" | "cancelled" | "extended"
      description: i.string(),
      relatedUserId: i.string().optional(),
      metadata: i.json().optional(),
      createdAt: i.number(),
    }),

    market_suggestions: i.entity({
      submittedBy: i.string(), // Clerk userId
      submitterName: i.string(), // Display name snapshot
      title: i.string(),
      description: i.string(),
      categorySlug: i.string().optional(),
      status: i.string(), // "pending" | "approved" | "rejected"
      reviewedBy: i.string().optional(), // Admin Clerk userId
      reviewedAt: i.number().optional(),
      rejectionReason: i.string().optional(),
      convertedMarketId: i.string().optional(),
      createdAt: i.number(),
    }),

    audit_logs: i.entity({
      adminUserId: i.string(),
      actionType: i.string(), // "CREATE_MARKET" | "PAUSE_MARKET" | "UNPAUSE_MARKET" | "CLOSE_MARKET" | "REOPEN_MARKET" | "RESOLVE_MARKET" | "CANCEL_MARKET"
      targetEntityId: i.string(),
      details: i.json(),
      createdAt: i.number(),
    }),
  },

  links: {
    categoryMarkets: {
      forward: { on: "categories", has: "many", label: "markets" },
      reverse: { on: "markets", has: "one", label: "category" },
    },
    marketOptions: {
      forward: { on: "markets", has: "many", label: "options" },
      reverse: { on: "market_options", has: "one", label: "market" },
    },
    marketActivityRecords: {
      forward: { on: "markets", has: "many", label: "activity" },
      reverse: { on: "market_activity", has: "one", label: "market" },
    },
    marketPositions: {
      forward: { on: "markets", has: "many", label: "positions" },
      reverse: { on: "positions", has: "one", label: "market" },
    },
  },
});

export default schema;
export type Schema = typeof schema;
