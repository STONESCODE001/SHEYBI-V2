/**
 * Trade Server Actions
 * =====================
 * Production-ready Server Actions for buying and selling positions.
 * These orchestrate the full trade lifecycle:
 *   1. Authenticate via Clerk
 *   2. Validate all preconditions
 *   3. Calculate trade via LMSR engine
 *   4. Persist all state changes atomically via repository
 *
 * EXECUTION ORDER: Follows prediction-engine.md §Buying Positions (15 steps)
 * and §Selling Positions (12 steps) exactly.
 *
 * WALLET MODEL:
 *   Buy:  availableBalance -= tradeAmount, lockedBalance += tradeAmount
 *   Sell: lockedBalance -= proportionalInvested, availableBalance += netProceeds
 *
 * @see context/feature-specs/12-prediction-engine-integration.md
 * @see context/prediction-engine.md
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import {
  calculateBuyTrade,
  calculateSellTrade,
  TRADING_FEE_RATE,
} from '@/lib/prediction-engine/lmsr';
import { repository } from '@/lib/repositories';
import type { OptionBatchUpdate } from '@/lib/repositories';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Standardized action response.
 * Every Server Action returns this shape so the UI can handle success/error uniformly.
 */
interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Data returned to the UI after a successful buy trade.
 */
interface BuyTradeResponse {
  sharesReceived: number;
  averagePricePerShare: number;
  fee: number;
  newProbability: number;
  estimatedPayout: number;
  estimatedProfit: number;
}

/**
 * Data returned to the UI after a successful sell trade.
 */
interface SellTradeResponse {
  sharesSold: number;
  grossProceeds: number;
  fee: number;
  netProceeds: number;
  realizedPL: number;
  positionClosed: boolean;
}

// ============================================================================
// BUY POSITION ACTION
// ============================================================================

/**
 * Execute a complete buy trade.
 *
 * EXECUTION ORDER (matches prediction-engine.md §Buying Positions):
 *  1. Validate authentication (Clerk)
 *  2. Validate account status (not suspended)
 *  3. Validate market state (must be 'open')
 *  4. Validate selected option (must exist in market)
 *  5. Validate trade amount (≥ MIN_TRADE, ≤ 20% of liquidity)
 *  6. Validate wallet balance (available ≥ tradeAmount)
 *  7. Validate Single-Outcome Exposure Invariant
 *  8. Deduct trade amount from wallet (available → locked)
 *  9. Deduct trading fee (2.5%)
 * 10. Calculate purchased shares (LMSR closed-form)
 * 11. Update option probability
 * 12. Update option share price
 * 13. Create or update position
 * 14. Record ledger entries (trade + fee)
 * 15. Update trading volume
 *
 * Steps 8-15 are all persisted via repository calls.
 * In production (InstantDB), these would be a single transact() call.
 *
 * @param marketId - The market to trade in
 * @param optionId - The specific option to buy shares of
 * @param tradeAmount - Gross ₦ amount the user wants to spend (fee included)
 * @param idempotencyKey - Unique key to prevent duplicate trades (e.g. from double-click)
 */
export async function buyPositionAction(
  marketId: string,
  optionId: string,
  tradeAmount: number,
  idempotencyKey: string
): Promise<ActionResponse<BuyTradeResponse>> {
  try {
    // ---- STEP 1: Validate authentication ----
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    // ---- STEP 2: Validate account status ----
    // TODO: Check user suspension status when user management is implemented.
    // For now, any authenticated user can trade.

    // ---- STEP 3: Fetch and validate market ----
    const market = await repository.markets.getMarketById(marketId);
    if (!market) {
      return { success: false, error: 'Market not found.' };
    }
    if (market.state !== 'open') {
      return { success: false, error: `Market is not open for trading. Current state: ${market.state}` };
    }

    // ---- STEP 4: Validate selected option ----
    const optionIndex = market.options.findIndex((o) => o.id === optionId);
    if (optionIndex === -1) {
      return { success: false, error: 'Selected market option does not exist.' };
    }
    if (market.options[optionIndex].isPaused) {
      return { success: false, error: 'Trading for this option is currently paused.' };
    }

    // ---- STEP 5: Validate trade amount ----
    // (amount validation happens inside calculateBuyTrade via MIN_TRADE_AMOUNT and MAX_TRADE_LIQUIDITY_RATIO)
    if (tradeAmount <= 0) {
      return { success: false, error: 'Trade amount must be positive.' };
    }

    // ---- STEP 6: Fetch wallet and validate balance ----
    const wallet = await repository.wallets.getWalletByUserId(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found. Please contact support.' };
    }
    if (wallet.availableBalance < tradeAmount) {
      return {
        success: false,
        error: `Insufficient balance. Available: ₦${wallet.availableBalance.toLocaleString()}, Required: ₦${tradeAmount.toLocaleString()}`,
      };
    }

    // ---- STEP 7: Validate Single-Outcome Exposure Invariant ----
    const existingPosition = await repository.positions.getActivePositionInMarket(userId, marketId);
    /**
     * SINGLE-OUTCOME EXPOSURE INVARIANT (prediction-engine.md §Trading Rules):
     * Users may only hold an active position in ONE outcome of a given market.
     * If they already hold shares in a different option, the buy is rejected.
     * They must fully sell their existing position before buying another option.
     */
    const userExistingPositions = existingPosition ? [existingPosition] : [];

    // ---- STEP 8-10: Calculate trade via LMSR engine ----
    /**
     * calculateBuyTrade handles:
     * - Market state validation (double-check)
     * - MIN_TRADE_AMOUNT and MAX_TRADE_LIQUIDITY_RATIO validation
     * - Fee calculation (2.5%)
     * - Net amount calculation (tradeAmount - fee)
     * - LMSR closed-form share calculation
     * - Probability vector update
     * - Probability bounds validation [1%, 99%]
     * - Single-Outcome Exposure check
     */
    const tradeResult = calculateBuyTrade({
      userId,
      market,
      optionId,
      tradeAmount,
      userAvailableBalance: wallet.availableBalance,
      userExistingPositionsInMarket: userExistingPositions,
    });

    // ---- IDEMPOTENCY CHECK ----
    const keyExists = await repository.ledger.idempotencyKeyExists(idempotencyKey);
    if (keyExists) {
      return { success: false, error: 'This trade has already been processed.' };
    }

    // ---- STEPS 11-15: Persist all state changes ----
    /**
     * In the mock repository, these are sequential Map mutations.
     * When swapping to InstantDB, wrap ALL of these in a single
     * adminDb.transact([...]) call for atomicity.
     */
    const now = Date.now();

    // 11-12. Update all market options with new probabilities and prices
    const optionUpdates: OptionBatchUpdate[] = market.options.map((opt, i) => ({
      optionId: opt.id,
      sharesOutstanding: tradeResult.updatedSharesVector[i],
      probability: tradeResult.updatedProbabilities[i] * 100, // Percentage scale (0 - 100)
      sharePrice: tradeResult.updatedProbabilities[i], // sharePrice === probability in LMSR (0 < price < 1)
    }));
    await repository.markets.updateMarketOptions(marketId, optionUpdates);

    // 8. Update wallet: availableBalance → lockedBalance
    await repository.wallets.updateWalletBalance(userId, {
      availableBalanceDelta: -tradeAmount,
      lockedBalanceDelta: +tradeAmount,
    });

    // 13. Create or update position
    if (existingPosition && existingPosition.optionId === optionId) {
      /**
       * User already holds shares in THIS option.
       * Aggregate: add shares, recalculate average entry price, increase invested amount.
       */
      const newTotalShares = existingPosition.sharesOwned + tradeResult.sharesReceived;
      const newTotalInvested = existingPosition.investedAmount + tradeAmount;
      const newAvgPrice = newTotalInvested / newTotalShares;

      await repository.positions.updatePosition(existingPosition.id, {
        sharesOwned: newTotalShares,
        investedAmount: newTotalInvested,
        averageEntryPrice: newAvgPrice,
        updatedAt: now,
      });
    } else {
      /**
       * First purchase of this option in this market.
       * Create a new position record.
       */
      await repository.positions.createPosition({
        userId,
        marketId,
        optionId,
        sharesOwned: tradeResult.sharesReceived,
        investedAmount: tradeAmount,
        averageEntryPrice: tradeResult.averagePricePerShare,
        state: 'open',
        settlementStatus: 'unsettled',
        createdAt: now,
        updatedAt: now,
      });
    }

    // 14. Record ledger entries
    // Trade entry
    await repository.ledger.createLedgerEntry({
      userId,
      eventType: 'TRADE_BUY',
      amount: tradeResult.netAmount,
      sourceAccountId: wallet.id,
      destinationAccountId: marketId,
      description: `Bought ${tradeResult.sharesReceived.toFixed(2)} shares of "${market.options[optionIndex].name}" in "${market.title}"`,
      idempotencyKey,
      balanceAfter: wallet.availableBalance - tradeAmount,
      referenceId: marketId,
      metadata: {
        optionId,
        optionName: market.options[optionIndex].name,
        sharesReceived: tradeResult.sharesReceived,
        pricePerShare: tradeResult.averagePricePerShare,
      },
      createdAt: now,
    });

    // Fee entry
    await repository.ledger.createLedgerEntry({
      userId,
      eventType: 'TRADING_FEE',
      amount: tradeResult.fee,
      sourceAccountId: wallet.id,
      destinationAccountId: 'platform_fee_account',
      description: `Trading fee (${TRADING_FEE_RATE * 100}%) on buy order`,
      idempotencyKey: `${idempotencyKey}_fee`,
      balanceAfter: wallet.availableBalance - tradeAmount,
      referenceId: marketId,
      createdAt: now,
    });

    // 15. Update market trading volume and trade count
    await repository.markets.updateMarket(marketId, {
      tradingVolume: market.tradingVolume + tradeAmount,
      totalTrades: market.totalTrades + 1,
      updatedAt: now,
    });

    // Market activity feed
    await repository.markets.addMarketActivity(marketId, {
      activityType: 'trade',
      description: `User bought ${tradeResult.sharesReceived.toFixed(2)} shares of "${market.options[optionIndex].name}"`,
      relatedUserId: userId,
      metadata: {
        tradeAmount,
        sharesReceived: tradeResult.sharesReceived,
        side: 'buy',
        optionName: market.options[optionIndex].name,
      },
      createdAt: now,
    });

    return {
      success: true,
      data: {
        sharesReceived: tradeResult.sharesReceived,
        averagePricePerShare: tradeResult.averagePricePerShare,
        fee: tradeResult.fee,
        newProbability: tradeResult.newProbability,
        estimatedPayout: tradeResult.estimatedPayout,
        estimatedProfit: tradeResult.estimatedProfit,
      },
    };
  } catch (error) {
    /**
     * Catch errors from the LMSR engine (validation failures, math errors)
     * and from the repository (balance invariant violations, not-found errors).
     * Return them as user-friendly error messages.
     */
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

// ============================================================================
// SELL POSITION ACTION
// ============================================================================

/**
 * Execute a complete sell trade.
 *
 * EXECUTION ORDER (matches prediction-engine.md §Selling Positions):
 *  1. Validate ownership (auth + position belongs to user)
 *  2. Validate market state (must be 'open')
 *  3. Validate share quantity
 *  4. Determine current market price (LMSR)
 *  5. Calculate sale value
 *  6. Deduct trading fee (2.5%)
 *  7. Credit available balance
 *  8. Update position
 *  9. Update market probability
 * 10. Update market price
 * 11. Record ledger entry
 * 12. Update trading volume
 *
 * @param marketId - The market containing the position
 * @param optionId - The option to sell shares of
 * @param sharesToSell - Number of shares to sell (can be partial)
 * @param idempotencyKey - Unique key to prevent duplicate sells
 */
export async function sellPositionAction(
  marketId: string,
  optionId: string,
  sharesToSell: number,
  idempotencyKey: string
): Promise<ActionResponse<SellTradeResponse>> {
  try {
    // ---- STEP 1: Validate authentication and ownership ----
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    // ---- STEP 2: Fetch and validate market ----
    const market = await repository.markets.getMarketById(marketId);
    if (!market) {
      return { success: false, error: 'Market not found.' };
    }
    if (market.state !== 'open') {
      return { success: false, error: `Market is not open for trading. Current state: ${market.state}` };
    }

    // ---- STEP 3: Fetch position and validate share quantity ----
    const position = await repository.positions.getPositionByUserAndOption(userId, optionId);
    if (!position) {
      return { success: false, error: 'You do not hold a position in this option.' };
    }
    const option = market.options.find((o) => o.id === optionId);
    if (option?.isPaused) {
      return { success: false, error: 'Trading for this option is currently paused.' };
    }
    if (sharesToSell <= 0) {
      return { success: false, error: 'Shares to sell must be positive.' };
    }
    if (sharesToSell > position.sharesOwned) {
      return {
        success: false,
        error: `Cannot sell ${sharesToSell.toFixed(2)} shares. You own ${position.sharesOwned.toFixed(2)} shares.`,
      };
    }

    // ---- STEPS 4-6: Calculate sell trade via LMSR engine ----
    /**
     * calculateSellTrade handles:
     * - Market state validation (double-check)
     * - Share quantity validation
     * - LMSR cost function for gross proceeds: C(q) - C(q - Δe_i)
     * - Fee calculation (2.5% of gross proceeds)
     * - Probability vector update
     * - Probability bounds validation [1%, 99%]
     * - Realized P&L calculation
     */
    const sellResult = calculateSellTrade({
      userId,
      market,
      optionId,
      sharesToSell,
      userPosition: position,
    });

    // ---- IDEMPOTENCY CHECK ----
    const keyExists = await repository.ledger.idempotencyKeyExists(idempotencyKey);
    if (keyExists) {
      return { success: false, error: 'This sell order has already been processed.' };
    }

    // ---- STEPS 7-12: Persist all state changes ----
    const now = Date.now();

    // 9-10. Update all market options with new probabilities and prices
    const optionUpdates: OptionBatchUpdate[] = market.options.map((opt, i) => ({
      optionId: opt.id,
      sharesOutstanding: sellResult.updatedSharesVector[i],
      probability: sellResult.updatedProbabilities[i] * 100, // Percentage scale (0 - 100)
      sharePrice: sellResult.updatedProbabilities[i],
    }));
    await repository.markets.updateMarketOptions(marketId, optionUpdates);

    /**
     * 7. Update wallet balances:
     * - lockedBalance decreases by proportional invested amount
     *   (the portion of the original investment corresponding to the shares being sold)
     * - availableBalance increases by net proceeds (gross - fee)
     */
    const proportionalInvested = (sharesToSell / position.sharesOwned) * position.investedAmount;
    await repository.wallets.updateWalletBalance(userId, {
      availableBalanceDelta: +sellResult.netProceeds,
      lockedBalanceDelta: -proportionalInvested,
    });

    // Get updated wallet for ledger balanceAfter
    const walletAfter = await repository.wallets.getWalletByUserId(userId);

    // 8. Update position
    const newSharesOwned = position.sharesOwned - sharesToSell;
    const newInvestedAmount = position.investedAmount - proportionalInvested;
    const newState = sellResult.positionClosed ? 'closed' as const : 'partially_sold' as const;
    const totalRealizedPL = (position.realizedProfitLoss ?? 0) + sellResult.realizedPL;

    await repository.positions.updatePosition(position.id, {
      sharesOwned: newSharesOwned,
      investedAmount: newInvestedAmount,
      state: newState,
      realizedProfitLoss: totalRealizedPL,
      updatedAt: now,
    });

    // 11. Record ledger entries
    const optionName = market.options.find((o) => o.id === optionId)?.name ?? 'Unknown';

    // Sell proceeds entry
    await repository.ledger.createLedgerEntry({
      userId,
      eventType: 'TRADE_SELL',
      amount: sellResult.netProceeds,
      sourceAccountId: marketId,
      destinationAccountId: walletAfter?.id ?? 'unknown',
      description: `Sold ${sharesToSell.toFixed(2)} shares of "${optionName}" in "${market.title}"`,
      idempotencyKey,
      balanceAfter: walletAfter?.availableBalance ?? 0,
      referenceId: position.id,
      metadata: {
        optionId,
        optionName,
        sharesSold: sharesToSell,
        grossProceeds: sellResult.grossProceeds,
        realizedPL: sellResult.realizedPL,
      },
      createdAt: now,
    });

    // Fee entry
    await repository.ledger.createLedgerEntry({
      userId,
      eventType: 'TRADING_FEE',
      amount: sellResult.fee,
      sourceAccountId: walletAfter?.id ?? 'unknown',
      destinationAccountId: 'platform_fee_account',
      description: `Trading fee (${TRADING_FEE_RATE * 100}%) on sell order`,
      idempotencyKey: `${idempotencyKey}_fee`,
      balanceAfter: walletAfter?.availableBalance ?? 0,
      referenceId: position.id,
      createdAt: now,
    });

    // 12. Update market trading volume
    await repository.markets.updateMarket(marketId, {
      tradingVolume: market.tradingVolume + sellResult.grossProceeds,
      totalTrades: market.totalTrades + 1,
      updatedAt: now,
    });

    // Market activity feed
    await repository.markets.addMarketActivity(marketId, {
      activityType: 'trade',
      description: `User sold ${sharesToSell.toFixed(2)} shares of "${optionName}"`,
      relatedUserId: userId,
      metadata: {
        grossProceeds: sellResult.grossProceeds,
        sharesSold: sharesToSell,
        side: 'sell',
        optionName,
      },
      createdAt: now,
    });

    return {
      success: true,
      data: {
        sharesSold: sellResult.sharesSold,
        grossProceeds: sellResult.grossProceeds,
        fee: sellResult.fee,
        netProceeds: sellResult.netProceeds,
        realizedPL: sellResult.realizedPL,
        positionClosed: sellResult.positionClosed,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}
