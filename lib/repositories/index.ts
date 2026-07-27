/**
 * Repository Barrel Export
 * =========================
 * This is the SINGLE SWAP POINT for changing data backends.
 *
 * CURRENT: Exports the in-memory mock repository (no external DB required).
 * FUTURE:  Change this one line to export the InstantDB repository instead.
 *
 * Example swap:
 *   - import { mockRepository as repository } from './mock-repository';
 *   + import { instantDbRepository as repository } from './instantdb-repository';
 *
 * All Server Actions import from '@/lib/repositories' and will automatically
 * use whichever implementation is exported here.
 *
 * @see context/feature-specs/12-prediction-engine-integration.md §"How to Swap"
 */

export { mockRepository as repository } from './mock-repository';

// Re-export all types so consumers only need one import path
export type {
  // Repository interfaces
  IRepository,
  IMarketRepository,
  IWalletRepository,
  IPositionRepository,
  ILedgerRepository,
  IAuditLogRepository,
  // Data types
  DisplayVariant,
  MarketCreateData,
  OptionCreateData,
  MarketUpdateData,
  OptionUpdateData,
  OptionBatchUpdate,
  MarketActivityData,
  Wallet,
  WalletBalanceDeltas,
  PositionCreateData,
  PositionUpdateData,
  LedgerEventType,
  LedgerEntryData,
  LedgerEntry,
  AuditActionType,
  AuditLogData,
  AuditLogEntry,
  // Re-exported engine types
  Market,
  MarketOption,
  MarketState,
  MarketType,
  Position,
  PositionState,
  SettlementStatus,
} from './types';
