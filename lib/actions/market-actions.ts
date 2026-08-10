/**
 * Market Lifecycle & Administration Server Actions
 * ==================================================
 * Handles the complete market lifecycle with persistence via the Repository Pattern:
 *
 * STATE TRANSITIONS:
 *   draft → scheduled → open ↔ paused ↔ closed → resolved / cancelled
 *
 * ACTIONS:
 *   createMarketAction     — Create a new market (binary, 1v1, or multi-option)
 *   resolveMarketAction    — Resolve market, pay winners, mark losers
 *   cancelMarketAction     — Cancel market, refund all positions
 *   pauseMarketAction      — Pause trading temporarily
 *   unpauseMarketAction    — Resume trading after pause
 *   reopenMarketAction     — Extend closing time or reopen closed market
 *
 * WALLET MODEL FOR SETTLEMENT:
 *   Winner: lockedBalance -= investedAmount, availableBalance += payout (shares × ₦1.00)
 *   Loser:  lockedBalance -= investedAmount (funds lost)
 *   Cancel: lockedBalance -= investedAmount, availableBalance += investedAmount (100% refund)
 *
 * @see context/feature-specs/12-prediction-engine-integration.md
 * @see context/prediction-engine.md §Market Lifecycle
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { calculateB, calculateRefunds, calculateSettlement } from '@/lib/prediction-engine/lmsr';
import { repository } from '@/lib/repositories';
import type { DisplayVariant, OptionCreateData } from '@/lib/repositories';

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface CreateMarketInput {
  title: string;
  description: string;
  categorySlug: string;
  marketType: 'binary' | 'multi_option';
  /**
   * Display variant for UI rendering:
   * - "binary": YES/NO card
   * - "1v1": Side-by-side contestant card (must have exactly 2 contestant names,
   *          system auto-generates 4 options: A YES, A NO, B YES, B NO)
   * - "standard": Multi-option candidate list
   */
  displayVariant: DisplayVariant;
  openingTime: number; // ms
  closingTime: number; // ms
  liquidity: number;   // Naira amount L
  /**
   * Option names provided by admin.
   * - Binary: ["YES", "NO"]
   * - 1v1: ["Mike", "Mercy"] — system auto-generates 4 options from these 2 names
   * - Multi-option: ["Seyi", "Venita", "Adekunle", ...]
   */
  optionNames: string[];
  optionImageUrls?: string[];
  imageUrl?: string;
  createdBy: string;
  state?: 'open' | 'draft' | 'scheduled';
}

export interface ResolveMarketInput {
  marketId: string;
  winningOptionId: string;
  confirmedTitleAllCaps: string; // Must match market.title.toUpperCase()
  adminUserId: string;
}

export interface ReopenMarketInput {
  marketId: string;
  newClosingTime: number; // ms
  adminUserId: string;
}

// ============================================================================
// RESPONSE TYPE
// ============================================================================

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// VALIDATION HELPERS — Imported from ./market-validation (pure functions)
// ============================================================================

import {
  prepareMarketCreationData,
  validateResolutionPayload,
  validatePauseTransition,
  validateUnpauseTransition,
  validateReopenTransition,
} from './market-validation';

// ============================================================================
// SERVER ACTIONS WITH PERSISTENCE
// ============================================================================

/**
 * Create a new market with its options and persist to the repository.
 *
 * EXECUTION ORDER:
 * 1. Validate admin authentication via Clerk
 * 2. Validate and prepare market data (incl. 1v1 auto-generation)
 * 3. Persist market and options via repository
 * 4. Create audit log entry
 * 5. Return created market ID
 */
export async function createMarketAction(
  input: CreateMarketInput
): Promise<ActionResponse<{ marketId: string }>> {
  try {
    // ---- Step 1: Validate admin auth ----
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }
    // TODO: Validate admin role via Clerk metadata

    // ---- Step 2: Prepare and validate ----
    const { marketData, optionsData } = prepareMarketCreationData({
      ...input,
      createdBy: userId, // Override with authenticated user
    });

    // ---- Step 3: Persist ----
    const marketId = await repository.markets.createMarket(marketData, optionsData);

    // ---- Step 4: Audit log ----
    await repository.auditLogs.createAuditLog({
      adminUserId: userId,
      actionType: 'CREATE_MARKET',
      targetEntityId: marketId,
      details: {
        title: marketData.title,
        marketType: marketData.marketType,
        displayVariant: marketData.displayVariant,
        liquidity: marketData.liquidity,
        numOptions: optionsData.length,
        optionNames: optionsData.map((o) => o.name),
      },
      createdAt: Date.now(),
    });

    // ---- Step 5: Market activity ----
    await repository.markets.addMarketActivity(marketId, {
      activityType: 'created',
      description: `Market "${marketData.title}" created with ₦${marketData.liquidity.toLocaleString()} liquidity`,
      relatedUserId: userId,
      createdAt: Date.now(),
    });

    return { success: true, data: { marketId } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Resolve a market: select the winning option, pay winners, mark losers.
 *
 * EXECUTION ORDER:
 * 1. Validate admin auth
 * 2. Validate ALL CAPS title confirmation (safety check)
 * 3. Validate market state (must be 'open' or 'closed')
 * 4. Fetch all positions
 * 5. Calculate settlement via LMSR engine
 * 6. For each winner: lockedBalance -= invested, availableBalance += payout
 * 7. For each loser: lockedBalance -= invested
 * 8. Update position states and settlement statuses
 * 9. Update market state to 'resolved'
 * 10. Record ledger entries
 * 11. Create audit log
 *
 * SETTLEMENT PAYOUT: Winners receive ₦1.00 per share owned.
 * SETTLEMENT LOSS: Losers forfeit their entire invested amount.
 */
export async function resolveMarketAction(
  input: ResolveMarketInput
): Promise<ActionResponse> {
  try {
    // ---- Step 1: Validate admin auth ----
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return { success: false, error: 'Authentication required.' };
    }

    // ---- Step 2: Fetch market ----
    const market = await repository.markets.getMarketById(input.marketId);
    if (!market) {
      return { success: false, error: 'Market not found.' };
    }

    // ---- Step 3: Validate ALL CAPS title ----
    if (!validateResolutionPayload(market.title, input.confirmedTitleAllCaps)) {
      return {
        success: false,
        error: 'Title confirmation does not match. Please type the market title in ALL CAPS exactly.',
      };
    }

    // ---- Step 4: Validate market state ----
    if (market.state !== 'open' && market.state !== 'closed' && market.state !== 'paused' && market.state !== 'draft') {
      return {
        success: false,
        error: `Cannot resolve market in state '${market.state}'.`,
      };
    }

    // Validate winning option exists
    const winningOption = market.options.find((o) => o.id === input.winningOptionId);
    if (!winningOption) {
      return { success: false, error: 'Selected winning option does not exist in this market.' };
    }

    // ---- Step 5: Fetch all positions ----
    const allPositions = await repository.positions.getPositionsByMarket(input.marketId);
    const activePositions = allPositions.filter(
      (p) => p.state === 'open' || p.state === 'partially_sold'
    );

    // ---- Step 6: Calculate settlement ----
    /**
     * calculateSettlement returns an array of SettlementPositionResult:
     * - Winners: payout = sharesOwned × ₦1.00, state = 'won'
     * - Losers: payout = ₦0.00, state = 'lost'
     */
    const settlementResults = calculateSettlement(
      activePositions,
      input.winningOptionId
    );

    const now = Date.now();

    // ---- Steps 7-10: Process each position ----
    for (const result of settlementResults) {
      const position = activePositions.find((p) => p.id === result.positionId);
      if (!position) continue;

      if (result.state === 'won') {
        /**
         * WINNER SETTLEMENT:
         * lockedBalance -= investedAmount (release locked funds)
         * availableBalance += payout (shares × ₦1.00)
         */
        await repository.wallets.updateWalletBalance(result.userId, {
          availableBalanceDelta: +result.payout,
          lockedBalanceDelta: -position.investedAmount,
        });

        // Update position state
        await repository.positions.updatePosition(result.positionId, {
          state: 'won',
          settlementStatus: 'settled',
          realizedProfitLoss: result.realizedPL,
          updatedAt: now,
        });

        // Record settlement ledger entry
        const wallet = await repository.wallets.getWalletByUserId(result.userId);
        await repository.ledger.createLedgerEntry({
          userId: result.userId,
          eventType: 'SETTLEMENT_WIN',
          amount: result.payout,
          sourceAccountId: market.id,
          destinationAccountId: wallet?.id ?? 'unknown',
          description: `Won ₦${result.payout.toLocaleString()} on "${winningOption.name}" in "${market.title}"`,
          idempotencyKey: `settlement_win_${result.positionId}`,
          balanceAfter: wallet?.availableBalance ?? 0,
          referenceId: result.positionId,
          metadata: {
            sharesOwned: position.sharesOwned,
            investedAmount: position.investedAmount,
            payout: result.payout,
            profitLoss: result.realizedPL,
          },
          createdAt: now,
        });
      } else {
        /**
         * LOSER SETTLEMENT:
         * lockedBalance -= investedAmount (funds are forfeited)
         * availableBalance: no change (nothing to credit)
         */
        await repository.wallets.updateWalletBalance(result.userId, {
          availableBalanceDelta: 0,
          lockedBalanceDelta: -position.investedAmount,
        });

        // Update position state
        await repository.positions.updatePosition(result.positionId, {
          state: 'lost',
          settlementStatus: 'settled',
          realizedProfitLoss: -position.investedAmount,
          updatedAt: now,
        });

        // Record loss ledger entry
        const wallet = await repository.wallets.getWalletByUserId(result.userId);
        await repository.ledger.createLedgerEntry({
          userId: result.userId,
          eventType: 'SETTLEMENT_LOSS',
          amount: 0,
          sourceAccountId: wallet?.id ?? 'unknown',
          destinationAccountId: market.id,
          description: `Lost ₦${position.investedAmount.toLocaleString()} on "${position.optionId}" in "${market.title}"`,
          idempotencyKey: `settlement_loss_${result.positionId}`,
          balanceAfter: wallet?.availableBalance ?? 0,
          referenceId: result.positionId,
          metadata: {
            sharesOwned: position.sharesOwned,
            investedAmount: position.investedAmount,
          },
          createdAt: now,
        });
      }
    }

    // ---- Step 11: Update market state ----
    await repository.markets.updateMarket(input.marketId, {
      state: 'resolved',
      winningOptionId: input.winningOptionId,
      resolutionTime: now,
      updatedAt: now,
    });

    // Mark winning option
    await repository.markets.updateMarketOption(input.winningOptionId, {
      isWinningOption: true,
    });

    // ---- Market activity ----
    await repository.markets.addMarketActivity(input.marketId, {
      activityType: 'resolved',
      description: `Market resolved. Winner: "${winningOption.name}". ${settlementResults.length} positions settled.`,
      relatedUserId: authUserId,
      metadata: {
        winningOptionId: input.winningOptionId,
        winningOptionName: winningOption.name,
        totalPositions: settlementResults.length,
        totalPayout: settlementResults.reduce((sum, r) => sum + r.payout, 0),
      },
      createdAt: now,
    });

    // ---- Audit log ----
    await repository.auditLogs.createAuditLog({
      adminUserId: authUserId,
      actionType: 'RESOLVE_MARKET',
      targetEntityId: input.marketId,
      details: {
        winningOptionId: input.winningOptionId,
        winningOptionName: winningOption.name,
        positionsSettled: settlementResults.length,
        totalPayout: settlementResults.reduce((sum, r) => sum + r.payout, 0),
      },
      createdAt: now,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Cancel a market and refund all active positions.
 *
 * CANCELLATION REFUND: Every position receives 100% of investedAmount back.
 *   lockedBalance -= investedAmount
 *   availableBalance += investedAmount
 *
 * The LMSR engine's calculateRefunds() computes the refund for each position.
 */
export async function cancelMarketAction(
  marketId: string
): Promise<ActionResponse> {
  try {
    // ---- Validate admin auth ----
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return { success: false, error: 'Authentication required.' };
    }

    // ---- Fetch and validate market ----
    const market = await repository.markets.getMarketById(marketId);
    if (!market) {
      return { success: false, error: 'Market not found.' };
    }
    if (market.state === 'resolved' || market.state === 'cancelled') {
      return { success: false, error: `Cannot cancel market in state '${market.state}'.` };
    }

    // ---- Fetch positions ----
    const allPositions = await repository.positions.getPositionsByMarket(marketId);
    const activePositions = allPositions.filter(
      (p) => p.state === 'open' || p.state === 'partially_sold'
    );

    // ---- Calculate refunds ----
    const refundResults = calculateRefunds(activePositions);

    const now = Date.now();

    // ---- Process refunds ----
    for (const refund of refundResults) {
      const position = activePositions.find((p) => p.id === refund.positionId);
      if (!position) continue;

      /**
       * CANCELLATION REFUND:
       * Move funds from lockedBalance back to availableBalance.
       * User gets back 100% of what they invested.
       */
      await repository.wallets.updateWalletBalance(refund.userId, {
        availableBalanceDelta: +refund.refundAmount,
        lockedBalanceDelta: -position.investedAmount,
      });

      // Update position state
      await repository.positions.updatePosition(refund.positionId, {
        state: 'cancelled',
        settlementStatus: 'settled',
        realizedProfitLoss: 0, // No profit or loss on cancellation
        updatedAt: now,
      });

      // Record refund ledger entry
      const wallet = await repository.wallets.getWalletByUserId(refund.userId);
      await repository.ledger.createLedgerEntry({
        userId: refund.userId,
        eventType: 'REFUND_CANCEL',
        amount: refund.refundAmount,
        sourceAccountId: market.id,
        destinationAccountId: wallet?.id ?? 'unknown',
        description: `Refund of ₦${refund.refundAmount.toLocaleString()} — market "${market.title}" cancelled`,
        idempotencyKey: `cancel_refund_${refund.positionId}`,
        balanceAfter: wallet?.availableBalance ?? 0,
        referenceId: refund.positionId,
        createdAt: now,
      });
    }

    // ---- Update market state ----
    await repository.markets.updateMarket(marketId, {
      state: 'cancelled',
      updatedAt: now,
    });

    // ---- Market activity ----
    await repository.markets.addMarketActivity(marketId, {
      activityType: 'cancelled',
      description: `Market cancelled. ${refundResults.length} positions refunded.`,
      relatedUserId: authUserId,
      metadata: {
        positionsRefunded: refundResults.length,
        totalRefunded: refundResults.reduce((sum, r) => sum + r.refundAmount, 0),
      },
      createdAt: now,
    });

    // ---- Audit log ----
    await repository.auditLogs.createAuditLog({
      adminUserId: authUserId,
      actionType: 'CANCEL_MARKET',
      targetEntityId: marketId,
      details: {
        positionsRefunded: refundResults.length,
        totalRefunded: refundResults.reduce((sum, r) => sum + r.refundAmount, 0),
      },
      createdAt: now,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Pause a market — temporarily stops trading.
 * State: 'open' → 'paused'
 */
export async function pauseMarketAction(
  marketId: string
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Authentication required.' };

    const market = await repository.markets.getMarketById(marketId);
    if (!market) return { success: false, error: 'Market not found.' };

    validatePauseTransition(market.state);

    const now = Date.now();
    await repository.markets.updateMarket(marketId, { state: 'paused', updatedAt: now });

    await repository.markets.addMarketActivity(marketId, {
      activityType: 'paused',
      description: 'Market paused by admin. Trading temporarily suspended.',
      relatedUserId: userId,
      createdAt: now,
    });

    await repository.auditLogs.createAuditLog({
      adminUserId: userId,
      actionType: 'PAUSE_MARKET',
      targetEntityId: marketId,
      details: { previousState: market.state },
      createdAt: now,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Unpause a market — resumes trading.
 * State: 'paused' → 'open'
 */
export async function unpauseMarketAction(
  marketId: string
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Authentication required.' };

    const market = await repository.markets.getMarketById(marketId);
    if (!market) return { success: false, error: 'Market not found.' };

    validateUnpauseTransition(market.state);

    const now = Date.now();
    await repository.markets.updateMarket(marketId, { state: 'open', updatedAt: now });

    await repository.markets.addMarketActivity(marketId, {
      activityType: 'unpaused',
      description: 'Market unpaused by admin. Trading resumed.',
      relatedUserId: userId,
      createdAt: now,
    });

    await repository.auditLogs.createAuditLog({
      adminUserId: userId,
      actionType: 'UNPAUSE_MARKET',
      targetEntityId: marketId,
      details: { previousState: market.state },
      createdAt: now,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Reopen or extend a market — set a new closing time.
 * State: 'open'/'paused'/'closed' → 'open' with new closingTime
 */
export async function reopenMarketAction(
  input: ReopenMarketInput
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Authentication required.' };

    const market = await repository.markets.getMarketById(input.marketId);
    if (!market) return { success: false, error: 'Market not found.' };

    validateReopenTransition(market.state, market.closingTime, input.newClosingTime);

    const now = Date.now();
    await repository.markets.updateMarket(input.marketId, {
      state: 'open',
      closingTime: input.newClosingTime,
      updatedAt: now,
    });

    await repository.markets.addMarketActivity(input.marketId, {
      activityType: 'reopened',
      description: `Market reopened/extended. New closing time: ${new Date(input.newClosingTime).toLocaleString()}.`,
      relatedUserId: userId,
      metadata: {
        previousClosingTime: market.closingTime,
        newClosingTime: input.newClosingTime,
        previousState: market.state,
      },
      createdAt: now,
    });

    await repository.auditLogs.createAuditLog({
      adminUserId: userId,
      actionType: 'REOPEN_MARKET',
      targetEntityId: input.marketId,
      details: {
        previousState: market.state,
        previousClosingTime: market.closingTime,
        newClosingTime: input.newClosingTime,
      },
      createdAt: now,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

export interface ToggleOptionPauseInput {
  marketId: string;
  optionId: string;
  isPaused: boolean;
}

/**
 * Pause or unpause an individual option in a multi-option market.
 * Used for pausing evicted or disabled housemates.
 */
export async function toggleOptionPauseAction(
  input: ToggleOptionPauseInput
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Authentication required.' };

    const market = await repository.markets.getMarketById(input.marketId);
    if (!market) return { success: false, error: 'Market not found.' };

    if (market.marketType !== 'multi_option') {
      return { success: false, error: 'Option pausing is only available for multi-option markets.' };
    }

    const option = market.options.find((o) => o.id === input.optionId);
    if (!option) return { success: false, error: 'Market option not found.' };

    const now = Date.now();
    await repository.markets.updateMarketOption(input.optionId, {
      isPaused: input.isPaused,
    });

    await repository.markets.addMarketActivity(input.marketId, {
      activityType: input.isPaused ? 'option_paused' : 'option_unpaused',
      description: `Option "${option.name}" ${input.isPaused ? 'paused' : 'unpaused'} by admin.`,
      relatedUserId: userId,
      createdAt: now,
    });

    await repository.auditLogs.createAuditLog({
      adminUserId: userId,
      actionType: input.isPaused ? 'PAUSE_MARKET_OPTION' : 'UNPAUSE_MARKET_OPTION',
      targetEntityId: input.optionId,
      details: {
        marketId: input.marketId,
        optionName: option.name,
        isPaused: input.isPaused,
      },
      createdAt: now,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

