/**
 * Sheybi Documentation Content Dictionary
 * Full markdown-formatted content for all documentation articles.
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
        heading: "Understanding Shares",
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
          "Sheybi operates on the Logarithmic Market Scoring Rule (LMSR) developed by Dr. Robin Hanson. LMSR is an Automated Market Maker (AMM) that provides guaranteed market liquidity, smooth price discovery, and continuous single-tap execution.",
      },
      {
        heading: "The Liquidity Parameter (b)",
        content:
          "At market creation, an administrator seeds initial platform liquidity L (e.g. ₦50,000). The engine calculates the parameter b based on the number of market options N:",
        codeSnippet: "b = L / (N * ln(N))",
      },
      {
        heading: "The Cost Function C(q)",
        content:
          "The state of the market is tracked by vector q = [q_1, q_2, ..., q_N], representing total shares outstanding for each option. The cost function C(q) determines market value:",
        codeSnippet: "C(q) = b * ln( sum( e^(q_i / b) ) )",
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
          "The price of a share equals the instantaneous probability p_i of that outcome:",
        codeSnippet: "p_i = e^(q_i / b) / sum( e^(q_j / b) )",
      },
      {
        heading: "Strict Bounds & Normalization",
        content:
          "To protect against extreme price distortions, option probabilities are strictly bounded between 1% (0.01) and 99% (0.99). The sum of probabilities across all options in any market is mathematically normalized to equal exactly 100% (1.0000).",
        callout: {
          type: "note",
          text: "When buying shares, increasing one option's probability automatically decreases the probabilities of all other options proportionally.",
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
          "To maintain fair risk exposure, Sheybi enforces a Single-Outcome Rule: a user may only hold an active position in ONE outcome of a given market at any time. For example, if you hold YES shares in a market, you cannot purchase NO shares in the same market without selling your YES shares first.",
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
        heading: "Buy Order Execution",
        content:
          "When you buy shares, your gross trade amount is processed as follows:\n\n1. 2.5% Trading Fee Deduction: fee = tradeAmount * 0.025.\n2. Net Amount: netAmount = tradeAmount - fee.\n3. Closed-Form Share Calculation: The LMSR engine calculates exact shares received based on net amount spent.\n4. Balance Update: Your available balance decreases by tradeAmount, and locked balance increases.",
        codeSnippet: "Δ = b * ln( (S * e^(netAmount / b) - R) / E_i )",
      },
    ],
  },
  "selling-positions": {
    title: "Selling Positions",
    categoryTitle: "Trading & Orders",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Selling & Cashout",
        content:
          "You can sell all or a portion of your owned shares at any time while a market is Open.\n\n1. Gross Proceeds: Calculated via cost function reduction C(q) - C(q - Δ).\n2. 2.5% Trading Fee Deduction: fee = grossProceeds * 0.025.\n3. Credit Available Balance: Net proceeds (grossProceeds - fee) are credited immediately to your available balance.",
      },
    ],
  },
  "settlement-and-payouts": {
    title: "Settlement & Payouts",
    categoryTitle: "Trading & Orders",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "Winning Payouts",
        content:
          "When a market resolves, each share of the winning option pays out exactly ₦1.00 directly to your available balance.\n\n• Winning Position: Payout = sharesOwned * ₦1.00.\n• Losing Position: Shares become worth ₦0.00.\n• Cancelled Market: All active positions receive a 100% refund of their original invested amount.",
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
        heading: "Balance Types",
        content:
          "Your Sheybi wallet displays three balance indicators:\n\n1. Available Balance: Funds ready for placing predictions or withdrawing to your bank account.\n2. Locked Balance: Funds currently tied up in open prediction positions.\n3. Playable Bonus Balance: Non-withdrawable promotional credits that are consumed first when placing predictions.",
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
        heading: "Withdrawal Processing & Fees",
        content:
          "Withdrawals are transferred directly to your verified Nigerian bank account.\n\n• Fee: 3.0% of withdrawal amount (minimum fee ₦150).\n• Max Withdrawable: Available Balance minus any active Playable Bonus Balance.\n• Identity Verification (KYC): Required before your first withdrawal (11-digit NIN verification or ID document upload).",
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
