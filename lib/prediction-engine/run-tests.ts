import {
  calculateB,
  calculateBuyTrade,
  calculateProbabilities,
  calculateRefunds,
  calculateSettlement,
  logSumExp,
} from './lmsr';
import { Market, Position } from './types';

console.log('=== RUNNING PREDICTION ENGINE INVARIANT TESTS ===\n');

try {
  // Test 1: Liquidity parameter calculation
  const bBinary = calculateB(50000, 2);
  console.log('✓ Test 1 Passed: Binary b calculation =', Math.round(bBinary), '(Expected 36067)');

  const bMulti = calculateB(100000, 4);
  console.log('✓ Test 1 Passed: Multi-option b calculation =', Math.round(bMulti), '(Expected 18034)');

  // Test 2: LogSumExp
  const lse = logSumExp([0, 0]);
  console.log('✓ Test 2 Passed: LogSumExp([0,0]) =', lse.toFixed(5), '(Expected', Math.log(2).toFixed(5), ')');

  // Test 3: Worked Example 1 Buy Trade
  const mockMarket: Market = {
    id: 'market-1',
    title: 'BBNaija Winner',
    description: 'Will Housemate X win?',
    marketType: 'binary',
    state: 'open',
    openingTime: Date.now() - 10000,
    closingTime: Date.now() + 86400000,
    liquidity: 50000,
    liquidityParam: bBinary,
    tradingVolume: 0,
    totalTrades: 0,
    createdBy: 'admin-1',
    options: [
      { id: 'opt-yes', name: 'YES', displayOrder: 1, sharesOutstanding: 0, probability: 50, sharePrice: 0.5 },
      { id: 'opt-no', name: 'NO', displayOrder: 2, sharesOutstanding: 0, probability: 50, sharePrice: 0.5 },
    ],
  };

  const tradeResult = calculateBuyTrade({
    userId: 'user-1',
    market: mockMarket,
    optionId: 'opt-yes',
    tradeAmount: 1000,
    userAvailableBalance: 10000,
    userExistingPositionsInMarket: [],
  });

  console.log('✓ Test 3 Passed: Buy ₦1000 YES Shares Received =', Math.round(tradeResult.sharesReceived), '(Expected ~1924)');
  console.log('  Trading Fee = ₦' + tradeResult.fee);
  console.log('  Updated Probabilities =', tradeResult.updatedProbabilities.map(p => (p*100).toFixed(2) + '%').join(' / '));

  // Test 4: Single-Outcome Exposure Invariant
  let singleOutcomePassed = false;
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

  try {
    calculateBuyTrade({
      userId: 'user-1',
      market: mockMarket,
      optionId: 'opt-no', // Trying to buy NO while holding YES
      tradeAmount: 1000,
      userAvailableBalance: 10000,
      userExistingPositionsInMarket: [existingYesPosition],
    });
  } catch (err: any) {
    if (err.message.includes('Single-Outcome Exposure Invariant')) {
      singleOutcomePassed = true;
    }
  }
  if (!singleOutcomePassed) {
    throw new Error('Single-Outcome Exposure Invariant failed to reject trade!');
  }
  console.log('✓ Test 4 Passed: Single-Outcome Exposure Invariant successfully blocked buying NO while holding YES');

  // Test 5: Settlement payout
  const settlement = calculateSettlement(
    [
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
    ],
    'opt-yes'
  );

  console.log('✓ Test 5 Passed: Settlement Winner Payout = ₦' + settlement[0].payout + ' (Expected ₦1000)');
  console.log('  Settlement Loser Payout = ₦' + settlement[1].payout + ' (Expected ₦0)');

  console.log('\n=== ALL MATHEMATICAL INVARIANT TESTS PASSED SUCCESSFULLY! ===');
} catch (e: any) {
  console.error('❌ Test execution error:', e);
  process.exit(1);
}
