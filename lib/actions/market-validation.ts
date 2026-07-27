/**
 * Market Lifecycle Validation Helpers (Pure Functions)
 * ====================================================
 * Pure synchronous validation functions used by both client dialogs
 * and Server Actions. Keeps validation logic consistent without forcing
 * Next.js to scan pure sync functions as Server Actions.
 */

import { calculateB } from '@/lib/prediction-engine/lmsr';
import type { DisplayVariant, OptionCreateData } from '@/lib/repositories';

export interface CreateMarketInput {
  title: string;
  description: string;
  categorySlug: string;
  marketType: 'binary' | 'multi_option';
  displayVariant: DisplayVariant;
  openingTime: number; // ms
  closingTime: number; // ms
  liquidity: number;   // Naira amount L
  optionNames: string[];
  imageUrl?: string;
  createdBy: string;
}

/**
 * Validates and calculates initial market options & LMSR parameters.
 */
export function prepareMarketCreationData(input: CreateMarketInput) {
  const {
    title,
    description,
    marketType,
    displayVariant,
    openingTime,
    closingTime,
    liquidity,
    optionNames,
    createdBy,
    imageUrl,
  } = input;

  if (!title || title.trim().length < 5) {
    throw new Error('Market title must be at least 5 characters');
  }

  if (!description || description.trim().length < 10) {
    throw new Error('Market description must be at least 10 characters');
  }

  if (closingTime <= openingTime) {
    throw new Error('Closing time must be strictly after opening time');
  }

  if (liquidity < 10000) {
    throw new Error('Minimum initial liquidity is ₦10,000');
  }

  let finalOptionNames: string[];
  let finalMarketType: 'binary' | 'multi_option';

  if (displayVariant === '1v1') {
    if (optionNames.length !== 2) {
      throw new Error('1v1 matchup requires exactly 2 contestant names');
    }
    finalOptionNames = [
      `${optionNames[0]} YES`,
      `${optionNames[0]} NO`,
      `${optionNames[1]} YES`,
      `${optionNames[1]} NO`,
    ];
    finalMarketType = 'multi_option';
  } else if (displayVariant === 'binary') {
    if (optionNames.length !== 2) {
      throw new Error('Binary markets must have exactly 2 options (e.g. YES / NO)');
    }
    finalOptionNames = optionNames;
    finalMarketType = 'binary';
  } else {
    if (optionNames.length < 3) {
      throw new Error('Multi-option markets must have at least 3 options');
    }
    finalOptionNames = optionNames;
    finalMarketType = 'multi_option';
  }

  const numOptions = finalOptionNames.length;
  const b = calculateB(liquidity, numOptions);
  const initialProbability = 1 / numOptions;
  const initialSharePrice = initialProbability;

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const optionsData: OptionCreateData[] = finalOptionNames.map((name, index) => ({
    name,
    displayOrder: index + 1,
    probability: initialProbability,
    sharePrice: initialSharePrice,
    sharesOutstanding: 0,
    isWinningOption: false,
    createdAt: Date.now(),
  }));

  return {
    marketData: {
      title,
      description,
      marketType: finalMarketType,
      displayVariant,
      state: 'draft' as const,
      openingTime,
      closingTime,
      liquidity,
      liquidityParam: b,
      tradingVolume: 0,
      totalTrades: 0,
      createdBy,
      imageUrl,
      slug,
      isFeatured: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    optionsData,
  };
}

/**
 * Validates ALL CAPS title payload for market resolution.
 */
export function validateResolutionPayload(
  marketTitle: string,
  confirmedTitleAllCaps: string
): boolean {
  const expectedAllCaps = marketTitle.trim().toUpperCase();
  const inputClean = confirmedTitleAllCaps.trim();
  return expectedAllCaps === inputClean;
}

/**
 * Validates state transition to PAUSED.
 */
export function validatePauseTransition(currentState: string): boolean {
  if (currentState !== 'open') {
    throw new Error(`Cannot pause market in state '${currentState}'. Market must be 'open'.`);
  }
  return true;
}

/**
 * Validates state transition from PAUSED to OPEN.
 */
export function validateUnpauseTransition(currentState: string): boolean {
  if (currentState !== 'paused') {
    throw new Error(`Cannot unpause market in state '${currentState}'. Market must be 'paused'.`);
  }
  return true;
}

/**
 * Validates state transition to REOPEN/EXTEND.
 */
export function validateReopenTransition(
  currentState: string,
  currentClosingTime: number,
  newClosingTime: number
): boolean {
  if (currentState !== 'open' && currentState !== 'closed' && currentState !== 'paused') {
    throw new Error(
      `Cannot extend/reopen market in state '${currentState}'. Market must be 'open', 'paused', or 'closed'.`
    );
  }

  if (newClosingTime <= Date.now()) {
    throw new Error('New closing time must be in the future');
  }

  return true;
}
