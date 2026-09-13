/**
 * Sheybi Documentation Content Dictionary
 * Full markdown-formatted content for all documentation articles.
 * Includes complete variable & constant breakdowns for all formulas.
 */

export interface DocContentData {
  title: string;
  categoryTitle: string;
  lastUpdated: string;
  sections: {
    heading: string;
    content: string;
    codeSnippet?: string;
    callout?: {
      type: "note" | "tip" | "important" | "warning";
      text: string;
    };
  }[];
}

export const DOCS_CONTENT: Record<string, DocContentData> = {
  // --------------------------------------------------------------------------
  // GROUP 1: GETTING STARTED
  // --------------------------------------------------------------------------
  introduction: {
    title: "Introduction to Sheybi",
    categoryTitle: "Getting Started",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "What is Sheybi?",
        content:
          "Sheybi is Africa's premier modern prediction market app tailored specifically for entertainment, reality television (such as BBNaija), pop culture, and sports events. Unlike traditional betting apps with confusing odds and heavy banking visuals, Sheybi offers a clean, social, and instant 1-tap prediction experience designed for Gen Z and modern sports & entertainment fans.",
        callout: {
          type: "tip",
          text: "Sheybi avoids complex order books or peer-to-peer waiting times. Every prediction executes instantly against an automated mathematical liquidity pool.",
        },
      },
      {
        heading: "Core Features",
        content:
          "• Real-Time Odds: Dynamic probabilities (e.g. 64% Chance) that update continuously as trades take place.\n• 1-Tap Execution: Buy or sell shares instantly with guaranteed liquidity.\n• Flexible Formats: Trade Binary YES/NO cards, 1v1 Contestant Matchups, or Multi-Option candidate pools.\n• Instant Payouts: Winning shares automatically resolve and payout ₦1.00 per share directly to your wallet.",
      },
    ],
  },
  "how-predictions-work": {
    title: "How Predictions Work",
    categoryTitle: "Getting Started",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Market Types",
        content:
          "Sheybi supports three distinct visual market formats to make predicting simple and intuitive:\n\n1. Binary Markets: Standard YES / NO questions (e.g. 'Will Mercy win Head of House this week?').\n2. 1v1 Matchups: Direct side-by-side candidate predictions (e.g. 'Mike vs Mercy'). Pick YES or NO for either contestant.\n3. Multi-Option Markets: Candidate pools with 3 or more housemates or nominees (e.g. 'Who will be evicted this Sunday?').",
      },
      {
        heading: "Understanding Shares & Payouts",
        content:
          "When you place a prediction, you purchase 'shares' in an outcome. Each share represents a contract that pays out exactly ₦1.00 if your chosen outcome wins, and ₦0.00 if it loses. The price of one share always equals its probability (e.g., a 65% probability means a share costs ₦0.65).",
      },
    ],
  },
  "quick-start": {
    title: "Quick Start Guide",
    categoryTitle: "Getting Started",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Step 1: Sign Up",
        content:
          "Click 'Sign In' or 'Sign Up' in the top bar to create your account using your Google account or email address via Clerk authentication.",
      },
      {
        heading: "Step 2: Fund Your Wallet",
        content:
          "Navigate to the Wallet page and click 'Deposit'. Enter the amount (minimum ₦500) and complete payment using your Card, Bank Transfer, or USSD code via Paystack.",
      },
      {
        heading: "Step 3: Predict & Win",
        content:
          "Browse active markets on the homepage or markets feed. Tap YES or NO on any market, enter your trade amount, and confirm. Watch your position value update in real time in your Portfolio!",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GROUP 2: PREDICTION ENGINE & MATH
  // --------------------------------------------------------------------------
  "lmsr-engine": {
    title: "LMSR Mathematical Engine",
    categoryTitle: "Prediction Engine & Math",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Overview",
        content:
          "Sheybi operates on the Logarithmic Market Scoring Rule (LMSR) developed by Dr. Robin Hanson. LMSR is an Automated Market Maker (AMM) that provides guaranteed market liquidity, smooth price discovery, and continuous single-tap execution without needing order books.",
      },
      {
        heading: "The Liquidity Parameter (b)",
        content:
          "At market creation, an administrator seeds initial platform liquidity L (e.g. ₦50,000). The engine calculates the liquidity parameter b based on the number of market options N:\n\nFormula: b = L / (N * ln(N))",
        codeSnippet: "b = L / (N * ln(N))",
      },
      {
        heading: "Meaning of LMSR System Variables & Constants",
        content:
          "Here is the exact mathematical meaning of every variable used in the LMSR liquidity formula:\n\n" +
          "• L (Naira Liquidity): Seed capital allocated by Sheybi to open the market (e.g., ₦50,000 or ₦200,000).\n" +
          "• N (Number of Options): Total outcome choices available in the market (e.g., N = 2 for Binary/1v1 markets, N ≥ 3 for Multi-option candidate pools).\n" +
          "• ln(N) (Natural Logarithm): The natural logarithm of N, providing smooth logarithmic scaling.\n" +
          "• b (Liquidity Parameter): The resulting LMSR scaling factor. Higher b values result in lower price slippage for large trade orders.",
      },
      {
        heading: "The LMSR Cost Function C(q)",
        content:
          "The state of the market is tracked by vector q = [q_1, q_2, ..., q_N], representing total shares outstanding for each option. The cost function C(q) determines the total value of shares minted in the market:\n\nFormula: C(q) = b * ln( sum( e^(q_i / b) ) )",
        codeSnippet: "C(q) = b * ln( sum( e^(q_i / b) ) )",
      },
      {
        heading: "Variables in the Cost Function C(q)",
        content:
          "• q = [q_1, q_2, ..., q_N]: The vector of total shares minted across all options in the market.\n" +
          "• q_i: Total outstanding shares minted for option i.\n" +
          "• e^(q_i / b): The exponential function of option i's scaled share quantity, used to compute softmax probabilities.\n" +
          "• C(q): The total cost function value in Naira. The difference between C(q_new) and C(q_old) equals the exact cost of purchasing new shares.",
      },
    ],
  },
  "prices-and-probabilities": {
    title: "Prices & Probabilities",
    categoryTitle: "Prediction Engine & Math",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Instantaneous Price Formula",
        content:
          "In LMSR, the instantaneous share price p_i of option i equals its winning probability:\n\nFormula: p_i = e^(q_i / b) / sum( e^(q_j / b) )",
        codeSnippet: "p_i = e^(q_i / b) / sum( e^(q_j / b) )",
      },
      {
        heading: "Meaning of Price Formula Variables",
        content:
          "• p_i (Share Price / Probability): The price of 1 share of option i (ranging between ₦0.01 and ₦0.99). Expressed as a percentage, p_i is the market's current probability (e.g. 0.65 = 65% Chance).\n" +
          "• e^(q_i / b): The exponent of option i's share quantity divided by b.\n" +
          "• sum( e^(q_j / b) ): The sum of exponentials across all N options in the market, ensuring probabilities sum to 100%.",
      },
      {
        heading: "System Constants & Bounding Rules",
        content:
          "Sheybi enforces strict mathematical bounds to protect traders:\n\n" +
          "• MIN_PROBABILITY = 0.01 (1.0%): Lower bound limit for option probabilities.\n" +
          "• MAX_PROBABILITY = 0.99 (99.0%): Upper bound limit for option probabilities.\n" +
          "• Normalization (100% Sum): The sum of all option probabilities is normalized after every trade so that sum(p_i) === 1.0000 (100.00%).",
        callout: {
          type: "note",
          text: "Because sum(p_i) = 100%, buying option A increases its price while automatically decreasing the prices of all other options proportionally.",
        },
      },
    ],
  },
  "single-outcome-rule": {
    title: "Single-Outcome Rule",
    categoryTitle: "Prediction Engine & Math",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Single-Outcome Exposure Invariant",
        content:
          "To maintain fair risk exposure and clear market signals, Sheybi enforces the Single-Outcome Exposure Invariant:\n\nA user may only hold an active position in ONE outcome of a given market at any time. For example, if you hold YES shares in a market, you cannot purchase NO shares in the same market without selling your YES shares first.",
      },
    ],
  },
  "market-lifecycle": {
    title: "Market Lifecycle",
    categoryTitle: "Prediction Engine & Math",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Lifecycle States",
        content:
          "A prediction market progresses through 6 immutable lifecycle states:\n\n1. Draft: Created by admin, hidden from public view.\n2. Scheduled: Visible on feeds, but trading is not yet open.\n3. Open: Active trading is enabled. Users can buy and sell freely.\n4. Paused: Temporarily suspended by admin for exceptional events. No trades accepted.\n5. Closed: Trading has ended. Waiting for official event outcome resolution.\n6. Resolved: Outcome declared. Winnings distributed. Market becomes immutable.\n7. Cancelled: Market voided. 100% of user investments refunded.",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GROUP 3: TRADING & ORDERS
  // --------------------------------------------------------------------------
  "buying-positions": {
    title: "Buying Positions",
    categoryTitle: "Trading & Orders",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Buy Order Execution Flow",
        content:
          "When you place a Buy order, your gross trade amount is processed in 4 distinct steps:\n\n1. Fee Deduction: TRADING_FEE_RATE = 2.5% (0.025).\n   fee = tradeAmount * 0.025\n   netAmount = tradeAmount - fee\n\n2. Closed-Form Share Calculation:\n   Formula: Δ = b * ln( (S * e^(netAmount / b) - R) / E_i )",
        codeSnippet: "Δ = b * ln( (S * e^(netAmount / b) - R) / E_i )",
      },
      {
        heading: "Meaning of Buy Formula Constants & Variables",
        content:
          "Here is the exact meaning of every symbol in the Buy Share formula:\n\n" +
          "• tradeAmount: Gross Naira amount entered by the user (e.g. ₦1,000).\n" +
          "• TRADING_FEE_RATE = 0.025 (2.5%): Platform fee deducted on trade execution.\n" +
          "• fee: Trading fee amount in Naira (e.g., ₦25 for a ₦1,000 trade).\n" +
          "• netAmount: Net Naira capital deployed into the market curve (tradeAmount - fee).\n" +
          "• Δ (Delta / Shares Received): Total quantity of outcome shares minted and awarded to the user.\n" +
          "• b (Liquidity Parameter): LMSR scaling parameter (b = L / (N * ln N)).\n" +
          "• S (Sum of Exponentials): Intermediate sum of all e^(q_j / b) terms across options.\n" +
          "• E_i (Option Exponential): Exponential value e^(q_i / b) for the chosen option i.\n" +
          "• R (Residual Sum): R = S - E_i, the sum of exponentials for all OTHER options in the market.\n" +
          "• MIN_TRADE_AMOUNT = ₦500: Minimum trade amount required per buy order.\n" +
          "• MAX_TRADE_LIQUIDITY_RATIO = 0.20 (20%): Maximum single buy trade cap (capped at 20% of initial liquidity L).",
      },
    ],
  },
  "selling-positions": {
    title: "Selling Positions",
    categoryTitle: "Trading & Orders",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Sell Order Execution Flow",
        content:
          "You can sell all or a portion of your owned shares at any time while a market is Open.\n\n1. Gross Proceeds Calculation:\n   Formula: grossProceeds = C(q) - C(q - Δ * e_i)\n\n2. Fee Deduction:\n   fee = grossProceeds * 0.025\n   netProceeds = grossProceeds - fee",
        codeSnippet: "grossProceeds = C(q) - C(q - Δ * e_i)",
      },
      {
        heading: "Meaning of Sell Formula Constants & Variables",
        content:
          "Here is the exact meaning of every symbol in the Sell Proceeds formula:\n\n" +
          "• Δ (Shares Sold): Number of shares the user chooses to sell back to the market.\n" +
          "• C(q): Market cost function value before the sale.\n" +
          "• C(q - Δ * e_i): Market cost function value after burning Δ shares of option i.\n" +
          "• grossProceeds: Total un-adjusted Naira value of the burned shares before fee deduction.\n" +
          "• fee: Trading fee (2.5% of grossProceeds).\n" +
          "• netProceeds: Final cash amount credited to the user's available balance (grossProceeds - fee).\n" +
          "• costBasis: Original capital invested in the shares being sold (sharesSold * averageEntryPrice).\n" +
          "• realizedPL: Realized Profit or Loss on the transaction (netProceeds - costBasis).",
      },
    ],
  },
  "settlement-and-payouts": {
    title: "Settlement & Payouts",
    categoryTitle: "Trading & Orders",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Winning & Losing Payout Rules",
        content:
          "When a market resolves, each share of the winning option pays out exactly ₦1.00 directly to your available balance.\n\n" +
          "• WINNING_SHARE_PAYOUT = ₦1.00 per share: Payout = sharesOwned * ₦1.00.\n" +
          "• LOSING_SHARE_PAYOUT = ₦0.00 per share: Shares become permanently worth ₦0.00.\n" +
          "• CANCELLATION_REFUND = 100%: If a market is cancelled, all active positions receive a 100% refund of their invested capital (refund = investedAmount).",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GROUP 4: WALLET & FINANCIAL MECHANICS
  // --------------------------------------------------------------------------
  "wallet-balances": {
    title: "Wallet Balance Breakdown",
    categoryTitle: "Wallet & Financial Mechanics",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Balance Types & Meaning",
        content:
          "Your Sheybi wallet tracks three balance fields:\n\n1. Available Balance: Uncommitted funds immediately available for placing trades or withdrawing to your bank account.\n2. Locked Balance: Funds currently committed to open prediction positions.\n3. Playable Bonus Balance: Non-withdrawable promotional credits that are consumed first when placing predictions.",
      },
    ],
  },
  "deposits-paystack": {
    title: "Deposits & Paystack",
    categoryTitle: "Wallet & Financial Mechanics",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Instant Deposit Methods",
        content:
          "Deposits are processed securely via Paystack inline payments. Supported channels include:\n\n• Debit / Credit Cards (Mastercard, Visa, Verve)\n• Instant Bank Transfer\n• USSD Code\n\nAll successful deposits immediately credit your Available Balance.",
      },
    ],
  },
  "withdrawals-and-kyc": {
    title: "Withdrawals & KYC Rules",
    categoryTitle: "Wallet & Financial Mechanics",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Withdrawal Formula & System Constants",
        content:
          "Withdrawals are transferred directly to your verified Nigerian bank account.\n\n" +
          "• WITHDRAWAL_FEE_RATE = 0.030 (3.0%): Platform withdrawal fee rate.\n" +
          "• MIN_WITHDRAWAL_FEE = ₦150: Minimum fee charged on any withdrawal.\n" +
          "• Fee Formula: fee = max(MIN_WITHDRAWAL_FEE, amount * WITHDRAWAL_FEE_RATE)\n" +
          "• Maximum Withdrawable Formula: maxWithdrawable = availableBalance - bonusBalance\n" +
          "• Identity Verification (KYC): Required before your first withdrawal (11-digit NIN verification or ID document upload).",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GROUP 5: PROMOTERS & REFERRALS
  // --------------------------------------------------------------------------
  "promoter-program": {
    title: "Promoter Referral Program",
    categoryTitle: "Promoters & Referrals",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "How Referral Links Work",
        content:
          "Promoters receive custom short links (e.g. sheybi.app/f/[slug]). When visitors click a link, a 30-day tracking cookie (sheybi_ref) is set. When the visitor signs up, their account is automatically attributed to the promoter.",
      },
    ],
  },
  "signup-bonuses": {
    title: "Signup Bonus Rules",
    categoryTitle: "Promoters & Referrals",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Playable Bonus Credits",
        content:
          "Promoter links may offer new users a signup bonus (e.g., ₦300). This bonus is credited as a Playable Bonus Balance. It cannot be withdrawn directly to a bank account, but can be used to place predictions and win real withdrawable cash!",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GROUP 6: TECHNICAL ARCHITECTURE
  // --------------------------------------------------------------------------
  "tech-stack": {
    title: "Technology Stack",
    categoryTitle: "Technical Architecture",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Core Infrastructure",
        content:
          "Sheybi is built using state-of-the-art Web technologies:\n\n• Next.js 15: App Router server components & Server Actions.\n• InstantDB: Graph-based real-time database with instant client reactivity.\n• Clerk: Multi-factor authentication & user management.\n• Tailwind CSS v4: Custom design system tokens and responsive layouts.",
      },
    ],
  },
  "security-and-permissions": {
    title: "Security & CEL Permissions",
    categoryTitle: "Technical Architecture",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Database Permissions",
        content:
          "Database access is secured using Common Expression Language (CEL) rules on InstantDB. Users can only query and mutate their own position, wallet, and ledger records. Admin actions require authenticated admin role verification.",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // GROUP 7: FAIR PLAY & FAQ
  // --------------------------------------------------------------------------
  "resolution-sources": {
    title: "Resolution Criteria & Sources",
    categoryTitle: "Fair Play & FAQ",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Source of Truth",
        content:
          "Markets are resolved strictly based on verified official outcome sources specified at creation (e.g. official BBNaija live broadcasts, verified organizer announcements, official sporting results).\n\nResolutions require double administrative confirmation with ALL CAPS title matching safeguards.",
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    categoryTitle: "Fair Play & FAQ",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Is Sheybi safe and secure?",
        content:
          "Yes! Sheybi uses bank-grade Paystack payment processing, encrypted auth via Clerk, and real-time ledger accounting for every transaction.",
      },
      {
        heading: "What happens if a market is cancelled?",
        content:
          "If an event is called off or cancelled by organizers, Sheybi refunds 100% of your invested capital back to your wallet.",
      },
      {
        heading: "How quickly are winning payouts processed?",
        content:
          "Payouts are processed automatically the instant an administrator resolves the market.",
      },
    ],
  },
};
