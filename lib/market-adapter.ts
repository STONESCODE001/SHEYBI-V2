import { MarketCardProps, ContestantOption, formatOddsFromProbability } from '@/components/parent/market-card';

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

  const contestants: ContestantOption[] = options.map((opt: any) => ({
    id: opt.id || opt.name,
    name: opt.name,
    avatarUrl: opt.imageUrl,
    probability: opt.probability,
    odds: formatOddsFromProbability(opt.probability),
  }));

  const yesOption = options.find((o: any) => o.name.toUpperCase() === 'YES') || options[0];
  const noOption = options.find((o: any) => o.name.toUpperCase() === 'NO') || options[1];

  const yesProbability = yesOption?.probability ?? 50;
  const noProbability = noOption?.probability ?? (100 - yesProbability);

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
