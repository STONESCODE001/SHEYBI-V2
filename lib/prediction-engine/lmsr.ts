/**
 * Logarithmic Market Scoring Rule (LMSR) Mathematical Engine
 * Single source of truth for all prediction market calculations.
 * Implements exact formulas specified in 10-prediction-algorithm.md.
 */

import {
  BuyTradeInput,
  BuyTradeResult,
  Market,
  Position,
  RefundPositionResult,
  SellTradeInput,
  SellTradeResult,
  SettlementPositionResult,
} from './types';

// System Constants
export const TRADING_FEE_RATE = 0.025;   // 2.5%
export const WITHDRAWAL_FEE_RATE = 0.030; // 3.0%
export const MIN_WITHDRAWAL_FEE = 150;     // ₦150
export const MIN_TRADE_AMOUNT = 500;       // ₦500
export const MAX_TRADE_LIQUIDITY_RATIO = 0.20; // Max 20% of liquidity
export const MIN_PROBABILITY = 0.01;      // 1%
export const MAX_PROBABILITY = 0.99;      // 99%

/**
 * Log-Sum-Exp trick for numerical stabilization.
 * Prevents floating-point overflow when calculating exponentials e^(q_i / b).
 */
export function logSumExp(values: number[]): number {
  const max = Math.max(...values);
  return max + Math.log(values.reduce((sum, v) => sum + Math.exp(v - max), 0));
}

/**
 * Calculates the LMSR liquidity parameter `b` from Naira liquidity `L` and number of options `N`.
 * Formula: b = L / (N * ln(N))
 */
export function calculateB(liquidity: number, numOptions: number): number {
  if (numOptions < 2) {
    throw new Error('Market must contain at least 2 options');
  }
  if (liquidity <= 0) {
    throw new Error('Liquidity must be a positive number');
  }
  return liquidity / (numOptions * Math.log(numOptions));
}

/**
 * LMSR Cost Function C(q).
 * Formula: C(q) = b * ln(sum(e^(q_i / b)))
 */
export function costFunction(b: number, q: number[]): number {
  const scaledQ = q.map((shares) => shares / b);
  return b * logSumExp(scaledQ);
}

/**
 * Calculates instantaneous prices (which equal probabilities) for each option vector q.
 * Formula: p(i) = e^(q_i / b) / sum(e^(q_j / b))
 * Sum of probabilities always equals 1.0000.
 */
export function calculateProbabilities(b: number, q: number[]): number[] {
  const scaledQ = q.map((shares) => shares / b);
  const lse = logSumExp(scaledQ);
  const rawProbs = scaledQ.map((v) => Math.exp(v - lse));

  // Round to 4 decimal places
  const roundedProbs = rawProbs.map((p) => Math.round(p * 10000) / 10000);

  // Normalize to guarantee sum === 1.0000
  const sum = roundedProbs.reduce((acc, curr) => acc + curr, 0);
  const diff = Math.round((1.0 - sum) * 10000) / 10000;

  if (diff !== 0) {
    // Add residual diff to highest probability option to restore invariant
    let maxIdx = 0;
    for (let i = 1; i < roundedProbs.length; i++) {
      if (roundedProbs[i] > roundedProbs[maxIdx]) {
        maxIdx = i;
      }
    }
    roundedProbs[maxIdx] = Math.round((roundedProbs[maxIdx] + diff) * 10000) / 10000;
  }

  return roundedProbs;
}

/**
 * Validates that all probabilities remain within strict bounds [0.01, 0.99].
 */
export function validateProbabilityBounds(probabilities: number[]): boolean {
  return probabilities.every((p) => p >= MIN_PROBABILITY && p <= MAX_PROBABILITY);
}

/**
 * Closed-form solution to calculate shares received Δ for a buy trade with net amount Naira.
 * Formula: Δ = b * ln((S * e^(netAmount / b) - R) / E_i)
 */
export function calculateBuyShares(
  b: number,
  q: number[],
  optionIndex: number,
  netAmount: number
): number {
  const scaledQ = q.map((shares) => shares / b);
  const maxQ = Math.max(...scaledQ);
  const exponentials = scaledQ.map((v) => Math.exp(v - maxQ));

  const S_scaled = exponentials.reduce((sum, e) => sum + e, 0);
  const E_i_scaled = exponentials[optionIndex];
  const R_scaled = S_scaled - E_i_scaled;

  const expNet = Math.exp(netAmount / b);
  const numerator = S_scaled * expNet - R_scaled;

  if (numerator <= 0) {
    throw new Error('Invalid trade calculation: numerator non-positive');
  }

  const delta = b * Math.log(numerator / E_i_scaled);

  if (isNaN(delta) || delta <= 0) {
    throw new Error('Invalid share calculation result');
  }

  return delta;
}

/**
 * Closed-form solution to calculate gross sale proceeds for selling sharesToSell Δ.
 * Formula: grossProceeds = C(q) - C(q - Δe_i)
 */
export function calculateSellProceeds(
  b: number,
  q: number[],
  optionIndex: number,
  sharesToSell: number
): number {
  if (sharesToSell <= 0 || sharesToSell > q[optionIndex]) {
    throw new Error('Invalid shares to sell quantity');
  }

  const costBefore = costFunction(b, q);
  const qNew = [...q];
  qNew[optionIndex] = qNew[optionIndex] - sharesToSell;
  const costAfter = costFunction(b, qNew);

  const grossProceeds = costBefore - costAfter;
  return Math.max(0, grossProceeds);
}

/**
 * Complete Buy Trade Execution Calculator.
 */
export function calculateBuyTrade(input: BuyTradeInput): BuyTradeResult {
  const { market, optionId, tradeAmount, userAvailableBalance, userExistingPositionsInMarket } = input;

  // 1. Validation Checks
  if (market.state !== 'open') {
    throw new Error('Market is not open for trading');
  }

  if (tradeAmount < MIN_TRADE_AMOUNT) {
    throw new Error(`Trade amount must be at least ₦${MIN_TRADE_AMOUNT}`);
  }

  if (tradeAmount > userAvailableBalance) {
    throw new Error('Insufficient wallet balance');
  }

  const maxTradeCap = market.liquidity * MAX_TRADE_LIQUIDITY_RATIO;
  if (tradeAmount > maxTradeCap) {
    throw new Error(`Trade amount exceeds maximum single-trade cap of ₦${maxTradeCap.toLocaleString()}`);
  }

  const optionIndex = market.options.findIndex((o) => o.id === optionId);
  if (optionIndex === -1) {
    throw new Error('Selected market option does not exist');
  }

  // Single-Outcome Exposure Invariant check
  const existingOtherPosition = userExistingPositionsInMarket.find(
    (p) => p.optionId !== optionId && p.sharesOwned > 0 && p.state === 'open'
  );
  if (existingOtherPosition) {
    throw new Error('Single-Outcome Exposure Invariant: You must sell your active position in other outcomes before purchasing this option.');
  }

  // 2. Fee & Net Amount
  const fee = Math.round(tradeAmount * TRADING_FEE_RATE * 10000) / 10000;
  const netAmount = tradeAmount - fee;

  // 3. Compute Shares Received
  const b = market.liquidityParam;
  const q = market.options.map((o) => o.sharesOutstanding);
  const sharesReceived = calculateBuyShares(b, q, optionIndex, netAmount);

  // 4. Update Vector & Compute New Probabilities
  const updatedQ = [...q];
  updatedQ[optionIndex] += sharesReceived;
  const updatedProbabilities = calculateProbabilities(b, updatedQ);

  // 5. Probability Bounds Validation
  if (!validateProbabilityBounds(updatedProbabilities)) {
    throw new Error('Trade rejected: trade would cause option probability to exceed bounds [1%, 99%].');
  }

  const averagePricePerShare = netAmount / sharesReceived;
  const estimatedPayout = sharesReceived * 1.0; // Winning share pays ₦1.00
  const estimatedProfit = estimatedPayout - tradeAmount;

  return {
    optionId,
    tradeAmount,
    fee,
    netAmount,
    sharesReceived,
    averagePricePerShare,
    newProbability: updatedProbabilities[optionIndex],
    estimatedPayout,
    estimatedProfit,
    updatedSharesVector: updatedQ,
    updatedProbabilities,
  };
}

/**
 * Complete Sell Trade Execution Calculator.
 */
export function calculateSellTrade(input: SellTradeInput): SellTradeResult {
  const { market, optionId, sharesToSell, userPosition } = input;

  if (market.state !== 'open') {
    throw new Error('Market is not open for trading');
  }

  if (!userPosition || userPosition.sharesOwned < sharesToSell || sharesToSell <= 0) {
    throw new Error('Insufficient shares owned to complete sell order');
  }

  const optionIndex = market.options.findIndex((o) => o.id === optionId);
  if (optionIndex === -1) {
    throw new Error('Selected market option does not exist');
  }

  const b = market.liquidityParam;
  const q = market.options.map((o) => o.sharesOutstanding);

  // 1. Calculate Gross Proceeds
  const grossProceeds = calculateSellProceeds(b, q, optionIndex, sharesToSell);

  // 2. Deduct Fee
  const fee = Math.round(grossProceeds * TRADING_FEE_RATE * 10000) / 10000;
  const netProceeds = Math.max(0, grossProceeds - fee);

  // 3. Update Shares Vector & Recalculate Probabilities
  const updatedQ = [...q];
  updatedQ[optionIndex] = Math.max(0, updatedQ[optionIndex] - sharesToSell);
  const updatedProbabilities = calculateProbabilities(b, updatedQ);

  if (!validateProbabilityBounds(updatedProbabilities)) {
    throw new Error('Trade rejected: sale would breach probability bounds.');
  }

  const costBasis = sharesToSell * userPosition.averageEntryPrice;
  const realizedPL = netProceeds - costBasis;
  const positionClosed = userPosition.sharesOwned === sharesToSell;

  return {
    optionId,
    sharesSold: sharesToSell,
    grossProceeds,
    fee,
    netProceeds,
    newProbability: updatedProbabilities[optionIndex],
    costBasis,
    realizedPL,
    updatedSharesVector: updatedQ,
    updatedProbabilities,
    positionClosed,
  };
}

/**
 * Settlement Payout Calculator.
 * Winning shares pay ₦1.00 each. Losing shares pay ₦0.00.
 */
export function calculateSettlement(
  positions: Position[],
  winningOptionId: string
): SettlementPositionResult[] {
  return positions.map((p) => {
    const isWinner = p.optionId === winningOptionId;
    if (isWinner) {
      const payout = p.sharesOwned * 1.0;
      const realizedPL = payout - p.investedAmount;
      return {
        positionId: p.id,
        userId: p.userId,
        state: 'won',
        payout,
        realizedPL,
      };
    } else {
      return {
        positionId: p.id,
        userId: p.userId,
        state: 'lost',
        payout: 0,
        realizedPL: 0 - p.investedAmount,
      };
    }
  });
}

/**
 * Market Cancellation Refund Calculator.
 * Refunds 100% of user's invested capital.
 */
export function calculateRefunds(positions: Position[]): RefundPositionResult[] {
  return positions.map((p) => ({
    positionId: p.id,
    userId: p.userId,
    refundAmount: p.investedAmount,
  }));
}
