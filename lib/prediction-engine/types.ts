/**
 * Prediction Engine Core Types
 * Single source of truth for types consumed by the prediction algorithm,
 * market lifecycle, trading engine, and settlement engine.
 */

export type MarketType = 'binary' | 'multi_option';

export type MarketState =
  | 'draft'
  | 'scheduled'
  | 'open'
  | 'paused'
  | 'closed'
  | 'resolved'
  | 'cancelled';

export type PositionState =
  | 'open'
  | 'partially_sold'
  | 'closed'
  | 'won'
  | 'lost'
  | 'cancelled';

export type SettlementStatus = 'unsettled' | 'settled';

export interface MarketOption {
  id: string;
  name: string;
  displayOrder: number;
  sharesOutstanding: number; // LMSR q_i
  probability: number;       // Percentage (0.01 - 0.99 / 1% - 99%)
  sharePrice: number;        // Price in Naira (0.01 - 0.99)
  isWinningOption?: boolean;
  isPaused?: boolean;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  marketType: MarketType;
  state: MarketState;
  openingTime: number; // Unix ms
  closingTime: number; // Unix ms
  resolutionTime?: number; // Unix ms
  liquidity: number;   // Admin-assigned Naira liquidity L
  liquidityParam: number; // LMSR b parameter
  tradingVolume: number;
  totalTrades: number;
  winningOptionId?: string;
  createdBy: string;
  options: MarketOption[];
}

export interface Position {
  id: string;
  userId: string;
  marketId: string;
  optionId: string;
  sharesOwned: number;
  investedAmount: number;     // Total gross amount spent (including fees)
  averageEntryPrice: number;  // Weighted avg price
  state: PositionState;
  settlementStatus: SettlementStatus;
  realizedProfitLoss?: number;
}

export interface BuyTradeInput {
  userId: string;
  market: Market;
  optionId: string;
  tradeAmount: number; // Gross Naira amount user wants to spend
  userAvailableBalance: number;
  userExistingPositionsInMarket: Position[];
}

export interface BuyTradeResult {
  optionId: string;
  tradeAmount: number;        // Gross amount spent
  fee: number;                // 2.5% trading fee
  netAmount: number;          // Amount used to purchase shares
  sharesReceived: number;     // Delta shares bought
  averagePricePerShare: number;
  newProbability: number;
  estimatedPayout: number;    // Shares * ₦1.00
  estimatedProfit: number;    // Payout - Trade Amount
  updatedSharesVector: number[]; // Updated q vector
  updatedProbabilities: number[]; // Updated options probabilities
}

export interface SellTradeInput {
  userId: string;
  market: Market;
  optionId: string;
  sharesToSell: number;
  userPosition: Position;
}

export interface SellTradeResult {
  optionId: string;
  sharesSold: number;
  grossProceeds: number;
  fee: number;                // 2.5% trading fee
  netProceeds: number;        // Amount credited to wallet
  newProbability: number;
  costBasis: number;          // SharesSold * avgEntryPrice
  realizedPL: number;         // Net proceeds - Cost basis
  updatedSharesVector: number[];
  updatedProbabilities: number[];
  positionClosed: boolean;
}

export interface SettlementPositionResult {
  positionId: string;
  userId: string;
  state: 'won' | 'lost';
  payout: number;
  realizedPL: number;
}

export interface RefundPositionResult {
  positionId: string;
  userId: string;
  refundAmount: number;
}
