declare const describe: any;
declare const test: any;
declare const expect: any;

import {
  calculateB,
  calculateBuyShares,
  calculateBuyTrade,
  calculateProbabilities,
  calculateRefunds,
  calculateSellProceeds,
  calculateSellTrade,
  calculateSettlement,
  costFunction,
  logSumExp,
  MIN_PROBABILITY,
  MAX_PROBABILITY,
  TRADING_FEE_RATE,
  WITHDRAWAL_FEE_RATE,
} from './lmsr';
import { Market, Position } from './types';

describe('LMSR Prediction Engine Tests', () => {
  // Test 1: Liquidity parameter calculation
  test('calculateB should accurately compute parameter b for binary and multi-option markets', () => {
    // Binary market (2 options) with ₦50,000 liquidity
    const bBinary = calculateB(50000, 2);
    expect(Math.round(bBinary)).toBe(36067); // 50,000 / (2 * ln(2)) ≈ 36067.38

    // 4-option market with ₦100,000 liquidity
    const bMulti = calculateB(100000, 4);
    expect(Math.round(bMulti)).toBe(18034); // 100,000 / (4 * ln(4)) ≈ 18033.69
  });

  // Test 2: Log-Sum-Exp numerical stabilization
  test('logSumExp should compute stable log-sum-exp without numerical overflow', () => {
    const values = [0, 0];
    expect(logSumExp(values)).toBeCloseTo(Math.log(2), 5);
  });

  // Test 3: Initial probabilities
  test('calculateProbabilities should return equal probabilities sum to 1.0000 at start', () => {
    const b = calculateB(50000, 2);
    const q = [0, 0];
    const probs = calculateProbabilities(b, q);
    expect(probs).toEqual([0.5, 0.5]);
    expect(probs.reduce((a, b) => a + b, 0)).toBe(1.0);
  });

  // Test 4: Worked Example 1 (Buy trade on Binary Market)
  test('Worked Example 1: Buy ₦1,000 worth of YES shares on ₦50,000 binary market', () => {
    const b = calculateB(50000, 2);
    const mockMarket: Market = {
      id: 'market-1',
      title: 'BBNaija Winner',
      description: 'Will Housemate X win?',
      marketType: 'binary',
      state: 'open',
      openingTime: Date.now() - 10000,
      closingTime: Date.now() + 86400000,
      liquidity: 50000,
      liquidityParam: b,
      tradingVolume: 0,
      totalTrades: 0,
      createdBy: 'admin-1',
      options: [
        { id: 'opt-yes', name: 'YES', displayOrder: 1, sharesOutstanding: 0, probability: 50, sharePrice: 0.5 },
        { id: 'opt-no', name: 'NO', displayOrder: 2, sharesOutstanding: 0, probability: 50, sharePrice: 0.5 },
      ],
    };

    const tradeInput = {
      userId: 'user-1',
      market: mockMarket,
      optionId: 'opt-yes',
      tradeAmount: 1000,
      userAvailableBalance: 10000,
      userExistingPositionsInMarket: [],
    };

    const result = calculateBuyTrade(tradeInput);

    expect(result.fee).toBe(25); // 2.5% of 1000 = 25
    expect(result.netAmount).toBe(975);
    expect(Math.round(result.sharesReceived)).toBe(1924); // ≈ 1923.81 shares
    expect(result.updatedProbabilities[0]).toBeGreaterThan(0.51); // Odds increased to ~51.3%
    expect(result.updatedProbabilities.reduce((a, b) => a + b, 0)).toBe(1.0);
  });

  // Test 5: Single-Outcome Exposure Invariant
  test('Single-Outcome Exposure Invariant should reject buying NO if user holds YES', () => {
    const b = calculateB(50000, 2);
    const mockMarket: Market = {
      id: 'market-1',
      title: 'BBNaija Winner',
      description: 'Will Housemate X win?',
      marketType: 'binary',
      state: 'open',
      openingTime: Date.now() - 10000,
      closingTime: Date.now() + 86400000,
      liquidity: 50000,
      liquidityParam: b,
      tradingVolume: 1000,
      totalTrades: 1,
      createdBy: 'admin-1',
      options: [
        { id: 'opt-yes', name: 'YES', displayOrder: 1, sharesOutstanding: 1923.81, probability: 51.3, sharePrice: 0.513 },
        { id: 'opt-no', name: 'NO', displayOrder: 2, sharesOutstanding: 0, probability: 48.7, sharePrice: 0.487 },
      ],
    };

    const existingYesPosition: Position = {
      id: 'pos-1',
      userId: 'user-1',
      marketId: 'market-1',
      optionId: 'opt-yes',
      sharesOwned: 1923.81,
      investedAmount: 1000,
      averageEntryPrice: 0.5068,
      state: 'open',
      settlementStatus: 'unsettled',
    };

    // User tries to buy NO while holding active YES shares
    expect(() =>
      calculateBuyTrade({
        userId: 'user-1',
        market: mockMarket,
        optionId: 'opt-no', // Trying to buy NO
        tradeAmount: 1000,
        userAvailableBalance: 10000,
        userExistingPositionsInMarket: [existingYesPosition],
      })
    ).toThrow(/Single-Outcome Exposure Invariant/);
  });

  // Test 6: Settlement calculations
  test('calculateSettlement should pay winners ₦1.00 per share and losers ₦0.00', () => {
    const positions: Position[] = [
      {
        id: 'pos-1',
        userId: 'user-winner',
        marketId: 'm-1',
        optionId: 'opt-yes',
        sharesOwned: 1000,
        investedAmount: 500,
        averageEntryPrice: 0.5,
        state: 'open',
        settlementStatus: 'unsettled',
      },
      {
        id: 'pos-2',
        userId: 'user-loser',
        marketId: 'm-1',
        optionId: 'opt-no',
        sharesOwned: 800,
        investedAmount: 400,
        averageEntryPrice: 0.5,
        state: 'open',
        settlementStatus: 'unsettled',
      },
    ];

    const results = calculateSettlement(positions, 'opt-yes');

    expect(results[0]).toEqual({
      positionId: 'pos-1',
      userId: 'user-winner',
      state: 'won',
      payout: 1000, // 1000 shares * ₦1.00 = ₦1000
      realizedPL: 500, // 1000 payout - 500 invested = +500
    });

    expect(results[1]).toEqual({
      positionId: 'pos-2',
      userId: 'user-loser',
      state: 'lost',
      payout: 0,
      realizedPL: -400, // 0 payout - 400 invested = -400
    });
  });

  // Test 7: Cancellation refunds
  test('calculateRefunds should return 100% of invested capital', () => {
    const positions: Position[] = [
      {
        id: 'pos-1',
        userId: 'user-1',
        marketId: 'm-1',
        optionId: 'opt-yes',
        sharesOwned: 1000,
        investedAmount: 1250,
        averageEntryPrice: 0.5,
        state: 'open',
        settlementStatus: 'unsettled',
      },
    ];

    const refunds = calculateRefunds(positions);
    expect(refunds[0].refundAmount).toBe(1250);
  });
});
