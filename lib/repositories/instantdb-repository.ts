/**
 * InstantDB Repository Implementation
 * ====================================
 * Production implementation of all repository interfaces using InstantDB Admin SDK.
 *
 * ARCHITECTURE:
 * - Uses adminDb from @/lib/instant-admin for atomic server-side transactions.
 * - Implements IRepository interface identical to MockRepository.
 * - Swapping between MockRepository and InstantDbRepository is controlled via index.ts export.
 *
 * @see lib/repositories/types.ts for interface definitions
 */

import { id } from "@instantdb/admin";
import { adminDb } from "@/lib/instant-admin";
import type {
  AuditLogData,
  AuditLogEntry,
  IAuditLogRepository,
  ILedgerRepository,
  IMarketRepository,
  IPositionRepository,
  IRepository,
  IWalletRepository,
  LedgerEntry,
  LedgerEntryData,
  Market,
  MarketActivityData,
  MarketCreateData,
  MarketOption,
  MarketState,
  MarketUpdateData,
  OptionBatchUpdate,
  OptionCreateData,
  OptionUpdateData,
  Position,
  PositionCreateData,
  PositionState,
  PositionUpdateData,
  SettlementStatus,
  Wallet,
  WalletBalanceDeltas,
  ISuggestionRepository,
  IWithdrawalRepository,
  MarketSuggestion,
  MarketSuggestionCreateData,
  MarketSuggestionUpdateData,
  WithdrawalRequest,
  WithdrawalRequestCreateData,
  WithdrawalRequestUpdateData,
} from "./types";

// ============================================================================
// MARKET REPOSITORY
// ============================================================================

class InstantDbMarketRepository implements IMarketRepository {
  async getMarketById(marketId: string): Promise<Market | null> {
    try {
      const result = await adminDb.query({
        markets: {
          options: {},
          $: { where: { id: marketId } },
        },
      });

      const raw = result.markets?.[0];
      if (!raw) return null;

      const options: MarketOption[] = (raw.options || [])
        .map((opt: any) => ({
          id: opt.id,
          name: opt.name,
          displayOrder: opt.displayOrder ?? 1,
          sharesOutstanding: opt.sharesOutstanding ?? 0,
          probability: opt.probability ?? 50,
          sharePrice: opt.sharePrice ?? 0.5,
          isWinningOption: opt.isWinningOption ?? false,
          imageUrl: opt.imageUrl,
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);

      return {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        marketType: raw.marketType as "binary" | "multi_option",
        state: raw.state as MarketState,
        openingTime: raw.openingTime,
        closingTime: raw.closingTime,
        resolutionTime: raw.resolutionTime,
        liquidity: raw.liquidity,
        liquidityParam: raw.liquidityParam,
        tradingVolume: raw.tradingVolume,
        totalTrades: raw.totalTrades,
        winningOptionId: raw.winningOptionId,
        createdBy: raw.createdBy,
        options,
      };
    } catch {
      return null;
    }
  }

  async getMarkets(filter?: { state?: MarketState; categoryId?: string }): Promise<Market[]> {
    try {
      let result: any;
      if (filter?.state) {
        result = await adminDb.query({
          markets: {
            options: {},
            $: { where: { state: filter.state } },
          },
        });
      } else {
        result = await adminDb.query({
          markets: {
            options: {},
          },
        });
      }

      return (result.markets || []).map((raw: any) => ({
        id: raw.id,
        title: raw.title,
        description: raw.description,
        marketType: raw.marketType as "binary" | "multi_option",
        state: raw.state as MarketState,
        openingTime: raw.openingTime,
        closingTime: raw.closingTime,
        resolutionTime: raw.resolutionTime,
        liquidity: raw.liquidity,
        liquidityParam: raw.liquidityParam,
        tradingVolume: raw.tradingVolume,
        totalTrades: raw.totalTrades,
        winningOptionId: raw.winningOptionId,
        createdBy: raw.createdBy,
        options: (raw.options || [])
          .map((opt: any) => ({
            id: opt.id,
            name: opt.name,
            displayOrder: opt.displayOrder ?? 1,
            sharesOutstanding: opt.sharesOutstanding ?? 0,
            probability: opt.probability ?? 50,
            sharePrice: opt.sharePrice ?? 0.5,
            isWinningOption: opt.isWinningOption ?? false,
            imageUrl: opt.imageUrl,
          }))
          .sort((a: MarketOption, b: MarketOption) => a.displayOrder - b.displayOrder),
      }));
    } catch {
      return [];
    }
  }

  async createMarket(marketData: MarketCreateData, optionsData: OptionCreateData[]): Promise<string> {
    const newMarketId = id();
    const txOps: any[] = [];

    txOps.push(
      adminDb.tx.markets[newMarketId].update({
        title: marketData.title,
        description: marketData.description,
        marketType: marketData.marketType,
        displayVariant: marketData.displayVariant,
        state: marketData.state,
        openingTime: marketData.openingTime,
        closingTime: marketData.closingTime,
        liquidity: marketData.liquidity,
        liquidityParam: marketData.liquidityParam,
        tradingVolume: marketData.tradingVolume,
        totalTrades: marketData.totalTrades,
        createdBy: marketData.createdBy,
        imageUrl: marketData.imageUrl,
        slug: marketData.slug,
        isFeatured: marketData.isFeatured,
        createdAt: marketData.createdAt,
        updatedAt: marketData.updatedAt,
      })
    );

    for (const opt of optionsData) {
      const newOptId = id();
      txOps.push(
        adminDb.tx.market_options[newOptId]
          .update({
            name: opt.name,
            displayOrder: opt.displayOrder,
            probability: opt.probability,
            sharePrice: opt.sharePrice,
            sharesOutstanding: opt.sharesOutstanding,
            isWinningOption: opt.isWinningOption,
            imageUrl: opt.imageUrl,
            createdAt: opt.createdAt,
          })
          .link({ market: newMarketId })
      );
    }

    await adminDb.transact(txOps);
    return newMarketId;
  }

  async updateMarket(marketId: string, updates: Partial<MarketUpdateData>): Promise<void> {
    await adminDb.transact([adminDb.tx.markets[marketId].update(updates)]);
  }

  async updateMarketOption(optionId: string, updates: Partial<OptionUpdateData>): Promise<void> {
    await adminDb.transact([adminDb.tx.market_options[optionId].update(updates)]);
  }

  async updateMarketOptions(marketId: string, optionUpdates: OptionBatchUpdate[]): Promise<void> {
    const txOps = optionUpdates.map((u) =>
      adminDb.tx.market_options[u.optionId].update({
        sharesOutstanding: u.sharesOutstanding,
        probability: u.probability,
        sharePrice: u.sharePrice,
      })
    );
    await adminDb.transact(txOps);
  }

  async addMarketActivity(marketId: string, activity: MarketActivityData): Promise<void> {
    const newActivityId = id();
    await adminDb.transact([
      adminDb.tx.market_activity[newActivityId]
        .update({
          activityType: activity.activityType,
          description: activity.description,
          relatedUserId: activity.relatedUserId,
          metadata: activity.metadata,
          createdAt: activity.createdAt,
        })
        .link({ market: marketId }),
    ]);
  }
}

// ============================================================================
// WALLET REPOSITORY
// ============================================================================

class InstantDbWalletRepository implements IWalletRepository {
  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    try {
      const result = await adminDb.query({
        wallets: {
          $: { where: { userId } },
        },
      });

      const raw = result.wallets?.[0];
      if (!raw) return null;

      return {
        id: raw.id,
        userId: raw.userId,
        availableBalance: raw.availableBalance ?? 0,
        lockedBalance: raw.lockedBalance ?? 0,
        createdAt: raw.createdAt ?? Date.now(),
        updatedAt: raw.updatedAt ?? Date.now(),
      };
    } catch {
      return null;
    }
  }

  async createWallet(userId: string): Promise<string> {
    const newWalletId = id();
    const now = Date.now();

    await adminDb.transact([
      adminDb.tx.wallets[newWalletId].update({
        userId,
        availableBalance: 0,
        lockedBalance: 0,
        lifetimeDeposits: 0,
        lifetimeWithdrawals: 0,
        lifetimeProfit: 0,
        createdAt: now,
        updatedAt: now,
      }),
    ]);

    return newWalletId;
  }

  async updateWalletBalance(userId: string, deltas: WalletBalanceDeltas): Promise<void> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for userId: ${userId}`);
    }

    const newAvailable = wallet.availableBalance + deltas.availableBalanceDelta;
    const newLocked = wallet.lockedBalance + deltas.lockedBalanceDelta;

    if (newAvailable < -0.0001) {
      throw new Error(`Available balance cannot be negative. Attempted balance: ${newAvailable}`);
    }
    if (newLocked < -0.0001) {
      throw new Error(`Locked balance cannot be negative. Attempted balance: ${newLocked}`);
    }

    await adminDb.transact([
      adminDb.tx.wallets[wallet.id].update({
        availableBalance: Math.max(0, newAvailable),
        lockedBalance: Math.max(0, newLocked),
        updatedAt: Date.now(),
      }),
    ]);
  }
}

// ============================================================================
// POSITION REPOSITORY
// ============================================================================

class InstantDbPositionRepository implements IPositionRepository {
  async getActivePositionInMarket(userId: string, marketId: string): Promise<Position | null> {
    try {
      const result = await adminDb.query({
        positions: {
          $: { where: { userId, marketId } },
        },
      });

      const active = (result.positions || []).find((p: any) =>
        ["open", "partially_sold"].includes(p.state)
      );

      if (!active) return null;

      return {
        id: active.id,
        userId: active.userId,
        marketId: active.marketId,
        optionId: active.optionId,
        sharesOwned: active.sharesOwned,
        investedAmount: active.investedAmount,
        averageEntryPrice: active.averageEntryPrice,
        state: active.state as PositionState,
        settlementStatus: active.settlementStatus as SettlementStatus,
        realizedProfitLoss: active.realizedProfitLoss,
      };
    } catch {
      return null;
    }
  }

  async getPositionByUserAndOption(userId: string, optionId: string): Promise<Position | null> {
    try {
      const result = await adminDb.query({
        positions: {
          $: { where: { userId, optionId } },
        },
      });

      const pos = result.positions?.[0];
      if (!pos) return null;

      return {
        id: pos.id,
        userId: pos.userId,
        marketId: pos.marketId,
        optionId: pos.optionId,
        sharesOwned: pos.sharesOwned,
        investedAmount: pos.investedAmount,
        averageEntryPrice: pos.averageEntryPrice,
        state: pos.state as PositionState,
        settlementStatus: pos.settlementStatus as SettlementStatus,
        realizedProfitLoss: pos.realizedProfitLoss,
      };
    } catch {
      return null;
    }
  }

  async getPositionsByMarket(marketId: string): Promise<Position[]> {
    try {
      const result = await adminDb.query({
        positions: {
          $: { where: { marketId } },
        },
      });

      return (result.positions || []).map((pos: any) => ({
        id: pos.id,
        userId: pos.userId,
        marketId: pos.marketId,
        optionId: pos.optionId,
        sharesOwned: pos.sharesOwned,
        investedAmount: pos.investedAmount,
        averageEntryPrice: pos.averageEntryPrice,
        state: pos.state as PositionState,
        settlementStatus: pos.settlementStatus as SettlementStatus,
        realizedProfitLoss: pos.realizedProfitLoss,
      }));
    } catch {
      return [];
    }
  }

  async getPositionsByUser(userId: string): Promise<Position[]> {
    try {
      const result = await adminDb.query({
        positions: {
          $: { where: { userId } },
        },
      });

      return (result.positions || []).map((pos: any) => ({
        id: pos.id,
        userId: pos.userId,
        marketId: pos.marketId,
        optionId: pos.optionId,
        sharesOwned: pos.sharesOwned,
        investedAmount: pos.investedAmount,
        averageEntryPrice: pos.averageEntryPrice,
        state: pos.state as PositionState,
        settlementStatus: pos.settlementStatus as SettlementStatus,
        realizedProfitLoss: pos.realizedProfitLoss,
      }));
    } catch {
      return [];
    }
  }

  async createPosition(data: PositionCreateData): Promise<string> {
    const newPosId = id();

    await adminDb.transact([
      adminDb.tx.positions[newPosId]
        .update({
          userId: data.userId,
          marketId: data.marketId,
          optionId: data.optionId,
          sharesOwned: data.sharesOwned,
          investedAmount: data.investedAmount,
          averageEntryPrice: data.averageEntryPrice,
          state: data.state,
          settlementStatus: data.settlementStatus,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        })
        .link({ market: data.marketId }),
    ]);

    return newPosId;
  }

  async updatePosition(positionId: string, updates: Partial<PositionUpdateData>): Promise<void> {
    await adminDb.transact([adminDb.tx.positions[positionId].update(updates)]);
  }
}

// ============================================================================
// LEDGER REPOSITORY
// ============================================================================

class InstantDbLedgerRepository implements ILedgerRepository {
  async createLedgerEntry(entry: LedgerEntryData): Promise<string> {
    const newLedgerId = id();

    await adminDb.transact([
      adminDb.tx.ledger[newLedgerId].update({
        userId: entry.userId,
        eventType: entry.eventType,
        amount: entry.amount,
        sourceAccountId: entry.sourceAccountId,
        destinationAccountId: entry.destinationAccountId,
        description: entry.description,
        idempotencyKey: entry.idempotencyKey,
        balanceAfter: entry.balanceAfter,
        referenceId: entry.referenceId,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
      }),
    ]);

    return newLedgerId;
  }

  async getLedgerEntriesByUser(userId: string): Promise<LedgerEntry[]> {
    try {
      const result = await adminDb.query({
        ledger: {
          $: { where: { userId } },
        },
      });

      return (result.ledger || [])
        .map((entry: any) => ({
          id: entry.id,
          userId: entry.userId,
          eventType: entry.eventType,
          amount: entry.amount,
          sourceAccountId: entry.sourceAccountId,
          destinationAccountId: entry.destinationAccountId,
          description: entry.description,
          idempotencyKey: entry.idempotencyKey,
          balanceAfter: entry.balanceAfter,
          referenceId: entry.referenceId,
          metadata: entry.metadata,
          createdAt: entry.createdAt,
        }))
        .sort((a: LedgerEntry, b: LedgerEntry) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }

  async idempotencyKeyExists(key: string): Promise<boolean> {
    try {
      const result = await adminDb.query({
        ledger: {
          $: { where: { idempotencyKey: key } },
        },
      });
      return (result.ledger?.length || 0) > 0;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// AUDIT LOG REPOSITORY
// ============================================================================

class InstantDbAuditLogRepository implements IAuditLogRepository {
  async createAuditLog(entry: AuditLogData): Promise<string> {
    const newLogId = id();

    await adminDb.transact([
      adminDb.tx.audit_logs[newLogId].update({
        adminUserId: entry.adminUserId,
        actionType: entry.actionType,
        targetEntityId: entry.targetEntityId,
        details: entry.details,
        createdAt: entry.createdAt,
      }),
    ]);

    return newLogId;
  }
}

// ============================================================================
// WITHDRAWAL REPOSITORY
// ============================================================================

class InstantDbWithdrawalRepository implements IWithdrawalRepository {
  async createWithdrawalRequest(data: WithdrawalRequestCreateData): Promise<string> {
    const newWithdrawalId = id();

    await adminDb.transact([
      adminDb.tx.withdrawal_requests[newWithdrawalId].update({
        userId: data.userId,
        grossAmount: data.grossAmount,
        feeAmount: data.feeAmount,
        netAmount: data.netAmount,
        bankName: data.bankName,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }),
    ]);

    return newWithdrawalId;
  }

  async getWithdrawalRequests(filter?: { status?: string }): Promise<WithdrawalRequest[]> {
    try {
      let result: any;
      if (filter?.status) {
        result = await adminDb.query({
          withdrawal_requests: {
            $: { where: { status: filter.status } },
          },
        });
      } else {
        result = await adminDb.query({
          withdrawal_requests: {},
        });
      }

      return (result.withdrawal_requests || []).map((w: any) => ({
        id: w.id,
        userId: w.userId,
        grossAmount: w.grossAmount,
        feeAmount: w.feeAmount,
        netAmount: w.netAmount,
        bankName: w.bankName,
        accountName: w.accountName,
        accountNumber: w.accountNumber,
        status: w.status,
        rejectionReason: w.rejectionReason,
        approvedBy: w.approvedBy,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }));
    } catch {
      return [];
    }
  }

  async updateWithdrawalRequest(idParam: string, updates: Partial<WithdrawalRequestUpdateData>): Promise<void> {
    await adminDb.transact([adminDb.tx.withdrawal_requests[idParam].update(updates)]);
  }
}

// ============================================================================
// MARKET SUGGESTIONS REPOSITORY
// ============================================================================

class InstantDbSuggestionRepository implements ISuggestionRepository {
  async createMarketSuggestion(data: MarketSuggestionCreateData): Promise<string> {
    const newSuggestionId = id();

    await adminDb.transact([
      adminDb.tx.market_suggestions[newSuggestionId].update({
        submittedBy: data.submittedBy,
        submitterName: data.submitterName,
        title: data.title,
        description: data.description,
        categorySlug: data.categorySlug,
        status: data.status,
        createdAt: data.createdAt,
      }),
    ]);

    return newSuggestionId;
  }

  async getMarketSuggestions(filter?: { status?: string }): Promise<MarketSuggestion[]> {
    try {
      let result: any;
      if (filter?.status) {
        result = await adminDb.query({
          market_suggestions: {
            $: { where: { status: filter.status } },
          },
        });
      } else {
        result = await adminDb.query({
          market_suggestions: {},
        });
      }

      return (result.market_suggestions || []).map((s: any) => ({
        id: s.id,
        submittedBy: s.submittedBy,
        submitterName: s.submitterName,
        title: s.title,
        description: s.description,
        categorySlug: s.categorySlug,
        status: s.status,
        reviewedBy: s.reviewedBy,
        reviewedAt: s.reviewedAt,
        rejectionReason: s.rejectionReason,
        convertedMarketId: s.convertedMarketId,
        createdAt: s.createdAt,
      }));
    } catch {
      return [];
    }
  }

  async updateMarketSuggestion(idParam: string, updates: Partial<MarketSuggestionUpdateData>): Promise<void> {
    await adminDb.transact([adminDb.tx.market_suggestions[idParam].update(updates)]);
  }
}

// ============================================================================
// COMBINED REPOSITORY EXPORT
// ============================================================================

export const instantDbRepository: IRepository = {
  markets: new InstantDbMarketRepository(),
  wallets: new InstantDbWalletRepository(),
  positions: new InstantDbPositionRepository(),
  ledger: new InstantDbLedgerRepository(),
  auditLogs: new InstantDbAuditLogRepository(),
  withdrawals: new InstantDbWithdrawalRepository(),
  suggestions: new InstantDbSuggestionRepository(),
};
