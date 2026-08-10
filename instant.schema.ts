import { i } from "@instantdb/react";

const schema = i.schema({
  entities: {
    // --- IDENTITY DOMAIN ---
    $users: i.entity({
      email: i.string().unique().indexed(),
      emailVerified: i.boolean().optional(),
      displayName: i.string().optional(),
      username: i.string().optional(),
      avatarUrl: i.string().optional(),
      accountStatus: i.string().optional().indexed(), // "active" | "suspended"
      role: i.string().optional().indexed(), // "user" | "admin" | "superadmin"
      createdAt: i.number().optional(),
      updatedAt: i.number().optional(),
    }),

    // --- PREDICTION & MARKET DOMAIN ---

    categories: i.entity({
      name: i.string(),
      slug: i.string().unique(),
      description: i.string().optional(),
      icon: i.string().optional(),
      displayOrder: i.number().indexed(),
      isActive: i.boolean().indexed(),
      createdAt: i.number().indexed(), // Unix timestamp ms
    }),

    markets: i.entity({
      title: i.string(),
      description: i.string(),
      marketType: i.string().indexed(), // "binary" | "multi_option"
      displayVariant: i.string().indexed(), // "binary" | "1v1" | "standard"
      state: i.string().indexed(), // "draft" | "scheduled" | "open" | "paused" | "closed" | "resolved" | "cancelled"
      openingTime: i.number().indexed(), // Unix timestamp ms
      closingTime: i.number().indexed(), // Unix timestamp ms
      resolutionTime: i.number().optional(),
      liquidity: i.number(), // Admin-assigned Naira amount L
      liquidityParam: i.number(), // Computed LMSR `b` parameter
      tradingVolume: i.number().indexed(), // Cumulative ₦ traded
      totalTrades: i.number(), // Count of completed trades
      winningOptionId: i.string().optional(),
      createdBy: i.string().indexed(), // Clerk userId
      imageUrl: i.string().optional(), // Market thumbnail
      slug: i.string().unique(),
      isFeatured: i.boolean().indexed(),
      createdAt: i.number().indexed(),
      updatedAt: i.number(),
    }),

    market_options: i.entity({
      name: i.string(),
      displayOrder: i.number().indexed(),
      probability: i.number(), // 0-100 (percentage)
      sharePrice: i.number(), // Current ₦ price per share (0 < price < 1)
      sharesOutstanding: i.number(), // Total outstanding shares (LMSR q_i)
      isWinningOption: i.boolean(),
      isPaused: i.boolean().optional(),
      imageUrl: i.string().optional(), // Contestant avatar
      createdAt: i.number(),
    }),

    positions: i.entity({
      userId: i.string().indexed(),
      marketId: i.string().indexed(),
      optionId: i.string().indexed(),
      sharesOwned: i.number(),
      investedAmount: i.number(), // Gross amount spent
      averageEntryPrice: i.number(),
      state: i.string().indexed(), // "open" | "partially_sold" | "closed" | "won" | "lost" | "cancelled"
      settlementStatus: i.string().indexed(), // "unsettled" | "settled"
      realizedProfitLoss: i.number().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // --- FINANCIAL DOMAIN ---

    wallets: i.entity({
      userId: i.string().unique().indexed(),
      availableBalance: i.number(),
      lockedBalance: i.number(),
      lifetimeDeposits: i.number(),
      lifetimeWithdrawals: i.number(),
      lifetimeProfit: i.number(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    wallet_transactions: i.entity({
      userId: i.string().indexed(),
      transactionType: i.string().indexed(), // "Deposit" | "Withdrawal" | "Buy" | "Sell" | "Settlement" | "Fee"
      amount: i.number(),
      status: i.string().indexed(), // "Pending" | "Completed" | "Failed"
      reference: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),

    ledger: i.entity({
      transactionId: i.string().optional(),
      userId: i.string().indexed(),
      eventType: i.string().indexed(), // "DEPOSIT" | "WITHDRAWAL" | "TRADE_BUY" | "TRADE_SELL" | "SETTLEMENT_WIN" | "REFUND_CANCEL" | "TRADING_FEE" | "WITHDRAWAL_FEE"
      amount: i.number(),
      sourceAccountId: i.string(),
      destinationAccountId: i.string(),
      description: i.string(),
      idempotencyKey: i.string().unique().indexed(),
      balanceAfter: i.number(),
      referenceId: i.string().optional(),
      metadata: i.json().optional(),
      createdAt: i.number().indexed(),
    }),

    deposits: i.entity({
      userId: i.string().indexed(),
      provider: i.string(),
      providerReference: i.string().indexed(),
      providerEventId: i.string().indexed(),
      amount: i.number(),
      currency: i.string(),
      status: i.string().indexed(), // "Pending" | "Processing" | "Completed" | "Failed"
      completedAt: i.number().optional(),
      createdAt: i.number().indexed(),
    }),

    withdrawal_requests: i.entity({
      userId: i.string().indexed(),
      reference: i.string().optional().indexed(),
      grossAmount: i.number(),
      feeAmount: i.number(),
      netAmount: i.number(),
      bankName: i.string(),
      accountName: i.string(),
      accountNumber: i.string(),
      status: i.string().indexed(), // "Pending" | "Approved" | "Processing" | "Paid" | "Rejected"
      rejectionReason: i.string().optional(),
      approvedBy: i.string().optional(),
      createdAt: i.number().indexed(),
      updatedAt: i.number(),
    }),

    // --- ADMINISTRATIVE & SYSTEM DOMAIN ---

    market_activity: i.entity({
      activityType: i.string().indexed(), // "created" | "opened" | "paused" | "unpaused" | "trade" | "closed" | "reopened" | "resolved" | "cancelled" | "extended"
      description: i.string(),
      relatedUserId: i.string().optional().indexed(),
      metadata: i.json().optional(),
      createdAt: i.number().indexed(),
    }),

    market_suggestions: i.entity({
      submittedBy: i.string().indexed(), // Clerk userId
      submitterName: i.string(), // Display name snapshot
      title: i.string(),
      description: i.string(),
      categorySlug: i.string().optional().indexed(),
      status: i.string().indexed(), // "pending" | "approved" | "rejected"
      reviewedBy: i.string().optional(), // Admin Clerk userId
      reviewedAt: i.number().optional(),
      rejectionReason: i.string().optional(),
      convertedMarketId: i.string().optional(),
      createdAt: i.number().indexed(),
    }),

    audit_logs: i.entity({
      adminUserId: i.string().indexed(),
      actionType: i.string().indexed(), // "CREATE_MARKET" | "PAUSE_MARKET" | "UNPAUSE_MARKET" | "CLOSE_MARKET" | "REOPEN_MARKET" | "RESOLVE_MARKET" | "CANCEL_MARKET"
      targetEntityId: i.string().indexed(),
      details: i.json(),
      createdAt: i.number().indexed(),
    }),

    notifications: i.entity({
      userId: i.string().indexed(),
      type: i.string().indexed(),
      title: i.string(),
      message: i.string(),
      isRead: i.boolean().indexed(),
      relatedEntity: i.string().optional(),
      relatedEntityId: i.string().optional(),
      createdAt: i.number().indexed(),
    }),

    kyc_records: i.entity({
      userId: i.string().unique().indexed(),
      verificationStatus: i.string().indexed(), // "pending" | "approved" | "rejected"
      legalName: i.string().optional(),
      dateOfBirth: i.string().optional(),
      documentType: i.string().optional(),
      nin: i.string().optional(),
      documentImageUrl: i.string().optional(),
      submittedAt: i.number().indexed(),
      reviewedAt: i.number().optional(),
      reviewedBy: i.string().optional(),
      rejectionReason: i.string().optional(),
    }),

    system_settings: i.entity({
      settingKey: i.string().unique().indexed(),
      value: i.string(),
      description: i.string().optional(),
      updatedBy: i.string().optional(),
      updatedAt: i.number(),
    }),

    // --- INSTANT STORAGE DOMAIN ---
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
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
    userWallets: {
      forward: { on: "$users", has: "one", label: "wallet" },
      reverse: { on: "wallets", has: "one", label: "user" },
    },
    userPositions: {
      forward: { on: "$users", has: "many", label: "positions" },
      reverse: { on: "positions", has: "one", label: "user" },
    },
    userLedger: {
      forward: { on: "$users", has: "many", label: "ledger" },
      reverse: { on: "ledger", has: "one", label: "user" },
    },
    userDeposits: {
      forward: { on: "$users", has: "many", label: "deposits" },
      reverse: { on: "deposits", has: "one", label: "user" },
    },
    userWithdrawals: {
      forward: { on: "$users", has: "many", label: "withdrawals" },
      reverse: { on: "withdrawal_requests", has: "one", label: "user" },
    },
  },
});

export default schema;
export type Schema = typeof schema;
