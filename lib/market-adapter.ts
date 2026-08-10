/**
 * Market Data UI Adapter
 * =======================
 * Transforms raw InstantDB graph database market entities into clean UI-compatible
 * structures for frontend presentation components.
 *
 * ARCHITECTURAL ROLE:
 * - Decouples UI components from database schema shapes.
 * - Formats probabilities into display odds strings (e.g. `₦500`).
 * - Determines visual variant (`binary`, `1v1`, `multi_option`) based on option count and images.
 * - Provides detail-page adapters for BinaryMarketView, VersusMarketView, MultiOptionMarketView.
 */

import { MarketCardProps, ContestantOption, formatOddsFromProbability } from '@/components/parent/market-card';
import type { BinaryMarketData } from '@/components/parent/market-details/binary-market-view';
import type { VersusMarketData, PlayerData } from '@/components/parent/market-details/versus-market-view';
import type { MultiOptionMarketData, CandidateData } from '@/components/parent/market-details/multi-option-market-view';

/**
 * Normalizes probability input values. If value is between 0 and 1, scales to percentage (0 - 100).
 */
export function normalizeProbability(prob?: number, defaultVal = 50): number {
  if (prob === undefined || prob === null) return defaultVal;
  if (prob > 0 && prob <= 1) return prob * 100;
  return prob;
}

/**
 * Helper to extract and format live trade history from InstantDB market_activity items.
 */
function extractTradeHistory(market: any): Array<{
  id: string;
  shares: number;
  outcome: "yes" | "no";
  timestamp: string;
}> {
  const activities = market.activity || [];
  const tradeActivities = activities.filter(
    (a: any) => a.activityType === 'trade' || a.activityType === 'TRADE'
  );

  return tradeActivities
    .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
    .map((a: any, idx: number) => {
      const shares = a.metadata?.sharesReceived || a.metadata?.sharesSold || 0;
      const side = a.metadata?.side === 'sell' ? 'sell' : 'buy';
      const outcome = (a.metadata?.outcome || a.metadata?.optionName || (side === 'sell' ? 'no' : 'yes')).toLowerCase();

      let timestamp = 'Recently';
      if (a.createdAt) {
        const diffSec = Math.floor((Date.now() - a.createdAt) / 1000);
        if (diffSec < 60) timestamp = 'Just now';
        else if (diffSec < 3600) timestamp = `${Math.floor(diffSec / 60)} mins ago`;
        else if (diffSec < 86400) timestamp = `${Math.floor(diffSec / 3600)} hours ago`;
        else timestamp = `${Math.floor(diffSec / 86400)} days ago`;
      }

      return {
        id: a.id || `trade_${idx}`,
        shares: Number((shares || 0).toFixed(2)),
        outcome: outcome === 'no' ? 'no' : 'yes',
        timestamp,
      };
    });
}

/**
 * Transforms InstantDB market entity objects into MarketCardProps for UI rendering.
 */
export function adaptMarketToCardProps(market: any): MarketCardProps {
  const options = market.options || [];

  let variant: 'binary' | '1v1' | 'multi_option' = 'binary';
  if (market.marketType === 'multi_option') {
    variant = 'multi_option';
  } else if (options.length === 2 && options[0]?.imageUrl && options[1]?.imageUrl) {
    variant = '1v1';
  }

  const contestants: ContestantOption[] = options.map((opt: any) => {
    const prob = normalizeProbability(opt.probability, 50);
    return {
      id: opt.id || opt.name,
      name: opt.name,
      avatarUrl: opt.imageUrl,
      probability: prob,
      odds: formatOddsFromProbability(prob),
    };
  });

  const yesOption = options.find((o: any) => o.name.toUpperCase() === 'YES') || options[0];
  const noOption = options.find((o: any) => o.name.toUpperCase() === 'NO') || options[1];

  const yesProbability = normalizeProbability(yesOption?.probability, 50);
  const noProbability = normalizeProbability(noOption?.probability, 100 - yesProbability);

  return {
    id: market.id || market.slug,
    title: market.title,
    variant,
    categoryLabel: market.category?.name || 'Entertainment',
    volume: `₦${(market.tradingVolume || 0).toLocaleString()}`,
    yesProbability,
    noProbability,
    yesOdds: formatOddsFromProbability(yesProbability),
    noOdds: formatOddsFromProbability(noProbability),
    contestants,
  };
}

// ---------------------------------------------------------------------------
// Market Detail Page Adapters
// ---------------------------------------------------------------------------

/**
 * Adapts a raw InstantDB market with `displayVariant === "binary"` into `BinaryMarketData`.
 */
export function adaptToBinaryMarketData(market: any): BinaryMarketData {
  const options = market.options || [];
  const yesOption = options.find((o: any) => o.name.toUpperCase() === 'YES') || options[0];
  const noOption = options.find((o: any) => o.name.toUpperCase() === 'NO') || options[1];

  const yesProbability = normalizeProbability(yesOption?.probability, 50);
  const noProbability = normalizeProbability(noOption?.probability, 100 - yesProbability);

  return {
    id: market.id,
    title: market.title,
    category: market.category?.name,
    rules: market.description,
    yesOptionId: yesOption?.id,
    noOptionId: noOption?.id,
    yesProbability,
    noProbability,
    yesOddsText: formatOddsFromProbability(yesProbability),
    noOddsText: formatOddsFromProbability(noProbability),
    yesPrice: yesOption?.sharePrice ?? yesProbability / 100,
    noPrice: noOption?.sharePrice ?? noProbability / 100,
    tradeHistory: extractTradeHistory(market),
    userPosition: null,
  };
}

/**
 * Adapts a raw InstantDB market with `displayVariant === "1v1"` into `VersusMarketData`.
 */
export function adaptToVersusMarketData(market: any): VersusMarketData {
  const options = market.options || [];
  const sorted = [...options].sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const p1 = sorted[0];
  const p2 = sorted[1];

  function toPlayer(opt: any): PlayerData {
    const prob = normalizeProbability(opt?.probability, 50);
    return {
      id: opt?.id ?? 'unknown',
      name: opt?.name ?? 'Unknown',
      avatarUrl: opt?.imageUrl,
      probability: prob,
      yesOddsText: formatOddsFromProbability(prob),
      noOddsText: formatOddsFromProbability(100 - prob),
      yesPrice: opt?.sharePrice ?? prob / 100,
      noPrice: 1 - (opt?.sharePrice ?? prob / 100),
    };
  }

  return {
    id: market.id,
    title: market.title,
    category: market.category?.name,
    rules: market.description,
    player1: toPlayer(p1),
    player2: toPlayer(p2),
    tradeHistory: extractTradeHistory(market),
    userPosition: null,
  };
}

/**
 * Adapts a raw InstantDB market with `displayVariant === "standard"` (multi-option) into `MultiOptionMarketData`.
 */
export function adaptToMultiOptionMarketData(market: any): MultiOptionMarketData {
  const options = market.options || [];
  const sorted = [...options].sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const candidates: CandidateData[] = sorted.map((opt: any) => {
    const prob = normalizeProbability(opt.probability, 0);
    return {
      id: opt.id,
      name: opt.name,
      avatarUrl: opt.imageUrl,
      tradesVolume: `₦${(market.tradingVolume || 0).toLocaleString()}`,
      yesOddsText: formatOddsFromProbability(prob),
      noOddsText: formatOddsFromProbability(100 - prob),
      yesPrice: opt.sharePrice ?? prob / 100,
      noPrice: 1 - (opt.sharePrice ?? prob / 100),
      probability: prob,
      isPaused: Boolean(opt.isPaused),
    };
  });

  return {
    id: market.id,
    title: market.title,
    category: market.category?.name,
    totalTradesVolume: `₦ ${(market.tradingVolume || 0).toLocaleString()}`,
    rules: market.description,
    candidates,
    tradeHistory: extractTradeHistory(market),
    userPosition: null,
  };
}

/**
 * Dispatches to the correct detail adapter based on `displayVariant`.
 * Returns the adapted data and the variant string for conditional rendering.
 */
export function adaptMarketToDetailData(market: any): {
  variant: 'binary' | '1v1' | 'standard';
  data: BinaryMarketData | VersusMarketData | MultiOptionMarketData;
} {
  const variant = (market.displayVariant as 'binary' | '1v1' | 'standard') || 'binary';

  switch (variant) {
    case '1v1':
      return { variant, data: adaptToVersusMarketData(market) };
    case 'standard':
      return { variant, data: adaptToMultiOptionMarketData(market) };
    case 'binary':
    default:
      return { variant: 'binary', data: adaptToBinaryMarketData(market) };
  }
}
