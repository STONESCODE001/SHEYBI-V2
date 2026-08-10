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
function cleanContestantName(name: string = ''): string {
  return name.replace(/\s+(YES|NO)$/i, '').trim();
}

/**
 * Transforms InstantDB market entity objects into MarketCardProps for UI rendering.
 */
export function adaptMarketToCardProps(market: any): MarketCardProps {
  const options = market.options || [];

  let variant: 'binary' | '1v1' | 'multi_option' = 'binary';
  if (market.displayVariant === '1v1') {
    variant = '1v1';
  } else if (market.marketType === 'multi_option') {
    variant = 'multi_option';
  } else if (options.length === 2 && options[0]?.imageUrl && options[1]?.imageUrl) {
    variant = '1v1';
  }

  let contestants: ContestantOption[] = [];
  let yesProbability = 50;
  let noProbability = 50;

  if (variant === '1v1') {
    const sorted = [...options].sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    if (sorted.length === 4) {
      // 4-option 1v1 matchup: [A YES, A NO, B YES, B NO]
      const p1Yes = sorted[0];
      const p2Yes = sorted[2];

      const prob1 = normalizeProbability(p1Yes?.probability, 50);
      const prob2 = normalizeProbability(p2Yes?.probability, 50);

      contestants = [
        {
          id: p1Yes?.id || p1Yes?.name || 'c1',
          name: cleanContestantName(p1Yes?.name || 'Contestant 1'),
          avatarUrl: p1Yes?.imageUrl,
          probability: prob1,
          odds: formatOddsFromProbability(prob1),
        },
        {
          id: p2Yes?.id || p2Yes?.name || 'c2',
          name: cleanContestantName(p2Yes?.name || 'Contestant 2'),
          avatarUrl: p2Yes?.imageUrl,
          probability: prob2,
          odds: formatOddsFromProbability(prob2),
        },
      ];
      yesProbability = prob1;
      noProbability = prob2;
    } else {
      // 2-option 1v1 matchup fallback
      const p1 = sorted[0];
      const p2 = sorted[1];
      const prob1 = normalizeProbability(p1?.probability, 50);
      const prob2 = normalizeProbability(p2?.probability, 50);

      contestants = [
        {
          id: p1?.id || p1?.name || 'c1',
          name: cleanContestantName(p1?.name || 'Contestant 1'),
          avatarUrl: p1?.imageUrl,
          probability: prob1,
          odds: formatOddsFromProbability(prob1),
        },
        {
          id: p2?.id || p2?.name || 'c2',
          name: cleanContestantName(p2?.name || 'Contestant 2'),
          avatarUrl: p2?.imageUrl,
          probability: prob2,
          odds: formatOddsFromProbability(prob2),
        },
      ];
      yesProbability = prob1;
      noProbability = prob2;
    }
  } else {
    contestants = options.map((opt: any) => {
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

    yesProbability = normalizeProbability(yesOption?.probability, 50);
    noProbability = normalizeProbability(noOption?.probability, 100 - yesProbability);
  }

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

  let player1: PlayerData;
  let player2: PlayerData;

  if (sorted.length === 4) {
    // 4-option 1v1 matchup: [A YES, A NO, B YES, B NO]
    const p1Yes = sorted[0];
    const p1No = sorted[1];
    const p2Yes = sorted[2];
    const p2No = sorted[3];

    const prob1Yes = normalizeProbability(p1Yes?.probability, 50);
    const prob1No = normalizeProbability(p1No?.probability, 50);
    const prob2Yes = normalizeProbability(p2Yes?.probability, 50);
    const prob2No = normalizeProbability(p2No?.probability, 50);

    player1 = {
      id: p1Yes?.id ?? 'p1_yes',
      name: cleanContestantName(p1Yes?.name ?? 'Player 1'),
      avatarUrl: p1Yes?.imageUrl,
      probability: prob1Yes,
      yesOptionId: p1Yes?.id,
      noOptionId: p1No?.id,
      yesOddsText: formatOddsFromProbability(prob1Yes),
      noOddsText: formatOddsFromProbability(prob1No),
      yesPrice: p1Yes?.sharePrice ?? prob1Yes / 100,
      noPrice: p1No?.sharePrice ?? prob1No / 100,
    };

    player2 = {
      id: p2Yes?.id ?? 'p2_yes',
      name: cleanContestantName(p2Yes?.name ?? 'Player 2'),
      avatarUrl: p2Yes?.imageUrl,
      probability: prob2Yes,
      yesOptionId: p2Yes?.id,
      noOptionId: p2No?.id,
      yesOddsText: formatOddsFromProbability(prob2Yes),
      noOddsText: formatOddsFromProbability(prob2No),
      yesPrice: p2Yes?.sharePrice ?? prob2Yes / 100,
      noPrice: p2No?.sharePrice ?? prob2No / 100,
    };
  } else {
    // Fallback for 2-option 1v1
    const p1 = sorted[0];
    const p2 = sorted[1];

    function toPlayer(opt: any): PlayerData {
      const prob = normalizeProbability(opt?.probability, 50);
      return {
        id: opt?.id ?? 'unknown',
        name: cleanContestantName(opt?.name ?? 'Unknown'),
        avatarUrl: opt?.imageUrl,
        probability: prob,
        yesOptionId: opt?.id,
        noOptionId: opt?.id,
        yesOddsText: formatOddsFromProbability(prob),
        noOddsText: formatOddsFromProbability(100 - prob),
        yesPrice: opt?.sharePrice ?? prob / 100,
        noPrice: 1 - (opt?.sharePrice ?? prob / 100),
      };
    }

    player1 = toPlayer(p1);
    player2 = toPlayer(p2);
  }

  return {
    id: market.id,
    title: market.title,
    category: market.category?.name,
    rules: market.description,
    player1,
    player2,
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

  const candidateCount = Math.max(1, sorted.length);
  const totalMarketVolume = Number(market.tradingVolume || market.liquidity || 0);
  const candidateSeedVolume = Math.round((market.liquidity || totalMarketVolume) / candidateCount);

  const candidates: CandidateData[] = sorted.map((opt: any) => {
    const prob = normalizeProbability(opt.probability, 0);
    const candidateVolume = candidateSeedVolume + Number(opt.tradeVolume || 0);
    return {
      id: opt.id,
      name: opt.name,
      avatarUrl: opt.imageUrl,
      tradesVolume: `₦${candidateVolume.toLocaleString()}`,
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
    totalTradesVolume: `₦ ${totalMarketVolume.toLocaleString()}`,
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
  let variant = (market.displayVariant as 'binary' | '1v1' | 'standard');
  if (!variant) {
    if (market.marketType === 'multi_option' && market.options?.length === 4) {
      variant = '1v1';
    } else if (market.marketType === 'multi_option') {
      variant = 'standard';
    } else {
      variant = 'binary';
    }
  }

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
