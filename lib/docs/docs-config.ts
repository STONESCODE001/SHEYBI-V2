/**
 * Documentation Hub Configuration & Navigation Tree
 * Publicly accessible at /docs
 */

export interface DocArticle {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
}

export interface DocCategory {
  id: string;
  title: string;
  iconName: string; // Lucide icon identifier
  articles: DocArticle[];
}

export const DOCS_CONFIG: DocCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    iconName: "Rocket",
    articles: [
      {
        slug: "introduction",
        title: "Introduction to Sheybi",
        description: "Learn about Sheybi, Africa's modern prediction market for entertainment & pop culture.",
        keywords: ["sheybi", "overview", "prediction market", "entertainment", "bbnaija"],
      },
      {
        slug: "how-predictions-work",
        title: "How Predictions Work",
        description: "Understand Binary YES/NO cards, 1v1 Matchups, and Multi-Option candidate pools.",
        keywords: ["binary", "1v1", "multi-option", "outcomes", "prediction types"],
      },
      {
        slug: "quick-start",
        title: "Quick Start Guide",
        description: "Step-by-step guide to signing up, funding your wallet, and placing your first trade.",
        keywords: ["quick start", "signup", "wallet funding", "first trade"],
      },
    ],
  },
  {
    id: "prediction-engine",
    title: "Prediction Engine & Math",
    iconName: "Calculator",
    articles: [
      {
        slug: "lmsr-engine",
        title: "LMSR Mathematical Engine",
        description: "Detailed explanation of Logarithmic Market Scoring Rule pricing & liquidity formulas.",
        keywords: ["lmsr", "math", "b parameter", "cost function", "softmax"],
      },
      {
        slug: "prices-and-probabilities",
        title: "Prices & Probabilities",
        description: "How probabilities drive share prices, 1%-99% bounds, and 100% sum normalization.",
        keywords: ["probabilities", "share prices", "bounds", "normalization", "odds"],
      },
      {
        slug: "single-outcome-rule",
        title: "Single-Outcome Rule",
        description: "Why users hold active positions in only one outcome per market at a time.",
        keywords: ["single outcome", "exposure", "invariant", "trading rules"],
      },
      {
        slug: "market-lifecycle",
        title: "Market Lifecycle",
        description: "Understanding Draft, Open, Paused, Closed, Resolved, and Cancelled market states.",
        keywords: ["lifecycle", "draft", "open", "paused", "closed", "resolved", "cancelled"],
      },
    ],
  },
  {
    id: "trading-and-orders",
    title: "Trading & Orders",
    iconName: "TrendingUp",
    articles: [
      {
        slug: "buying-positions",
        title: "Buying Positions",
        description: "Execution flow for buy orders, trade caps, and the 2.5% platform trading fee.",
        keywords: ["buy", "buying", "trading fee", "net amount", "trade caps"],
      },
      {
        slug: "selling-positions",
        title: "Selling Positions",
        description: "How partial selling works, calculating gross proceeds, and realized profit/loss.",
        keywords: ["sell", "selling", "proceeds", "realized pl", "partial sell"],
      },
      {
        slug: "settlement-and-payouts",
        title: "Settlement & Payouts",
        description: "Winning ₦1.00 payouts per share, losing positions, and 100% cancellation refunds.",
        keywords: ["settlement", "payouts", "winning", "losing", "cancellation refund"],
      },
    ],
  },
  {
    id: "wallet-and-fees",
    title: "Wallet & Financial Mechanics",
    iconName: "Wallet",
    articles: [
      {
        slug: "wallet-balances",
        title: "Wallet Balance Breakdown",
        description: "Understanding Available Balance, Locked Balance, and Playable Bonus Balance.",
        keywords: ["wallet", "available balance", "locked balance", "bonus balance"],
      },
      {
        slug: "deposits-paystack",
        title: "Deposits & Paystack",
        description: "Instant deposits via Card, Bank Transfer, and USSD powered by Paystack.",
        keywords: ["deposit", "paystack", "card", "bank transfer", "ussd"],
      },
      {
        slug: "withdrawals-and-kyc",
        title: "Withdrawals & KYC Rules",
        description: "Withdrawal processing, Identity Verification (KYC), and 3.0% withdrawal fee.",
        keywords: ["withdrawal", "kyc", "identity verification", "nin", "withdrawal fee"],
      },
    ],
  },
  {
    id: "promoters",
    title: "Promoters & Referrals",
    iconName: "Users",
    articles: [
      {
        slug: "promoter-program",
        title: "Promoter Referral Program",
        description: "Short links (sheybi.app/f/[slug]), 30-day tracking cookies, and performance metrics.",
        keywords: ["promoter", "referral", "short link", "cookies", "analytics"],
      },
      {
        slug: "signup-bonuses",
        title: "Signup Bonus Rules",
        description: "Capped playable bonus credits, non-withdrawable balance, and trading play-through.",
        keywords: ["bonus", "signup bonus", "playable balance", "play through"],
      },
    ],
  },
  {
    id: "architecture",
    title: "Technical Architecture",
    iconName: "Cpu",
    articles: [
      {
        slug: "tech-stack",
        title: "Technology Stack",
        description: "Next.js 15 App Router, InstantDB Graph Database, Clerk Auth, and Tailwind CSS v4.",
        keywords: ["next.js", "instantdb", "clerk", "tailwind", "tech stack"],
      },
      {
        slug: "security-and-permissions",
        title: "Security & CEL Permissions",
        description: "InstantDB client permission rules, admin role verification, and audit logging.",
        keywords: ["security", "cel permissions", "instantdb perms", "audit log"],
      },
    ],
  },
  {
    id: "fair-play",
    title: "Fair Play & FAQ",
    iconName: "HelpCircle",
    articles: [
      {
        slug: "resolution-sources",
        title: "Resolution Criteria & Sources",
        description: "Official resolution authorities, broadcast evidence, and admin confirmation safety.",
        keywords: ["resolution source", "fair play", "confirmation", "disputes"],
      },
      {
        slug: "faq",
        title: "Frequently Asked Questions",
        description: "Answers to common questions about trading, payouts, accounts, and market rules.",
        keywords: ["faq", "frequently asked questions", "help", "support"],
      },
    ],
  },
];

/**
 * Helper to get article by slug
 */
export function getArticleBySlug(slug: string): { article: DocArticle; category: DocCategory } | null {
  for (const category of DOCS_CONFIG) {
    const article = category.articles.find((a) => a.slug === slug);
    if (article) {
      return { article, category };
    }
  }
  return null;
}
