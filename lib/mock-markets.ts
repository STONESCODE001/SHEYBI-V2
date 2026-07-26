import type { MarketCardProps } from "@/components/parent/market-card"

/**
 * 8 Mock Market Cards organized into matching variant rows for clean grid alignment.
 * Demonstrates Binary (Row 1), 1v1 Matchups (Row 2), and Multi-Option (Row 3) cards.
 */
export const MOCK_8_MARKETS: readonly MarketCardProps[] = [
  // --- ROW 1: BINARY CARDS ---
  {
    id: "1",
    variant: "binary",
    title: "Will a Female Housemate win HoH this week?",
    yesProbability: 33.3,
    noProbability: 66.7,
    yesOdds: "1k -> 3k",
    noOdds: "1k -> 5k",
  },
  {
    id: "2",
    variant: "binary",
    title: "Will the Head of House use their Veto Power today?",
    yesProbability: 60,
    noProbability: 40,
    yesOdds: "1k -> 1.6k",
    noOdds: "1k -> 2.5k",
  },
  {
    id: "3",
    variant: "binary",
    title: "Will there be a surprise fake housemate eviction tonight?",
    yesProbability: 25,
    noProbability: 75,
    yesOdds: "1k -> 4k",
    noOdds: "1k -> 1.3k",
  },

  // --- ROW 2: 1V1 MATCHUP CARDS ---
  {
    id: "4",
    variant: "1v1",
    title: "Would Mercy Slap Joy ??",
    yesProbability: 33.3,
    noProbability: 66.7,
    yesOdds: "1k -> 3k",
    noOdds: "1k -> 5k",
    contestants: [
      {
        id: "mercy",
        name: "Mercy Eke",
        avatarUrl: "/testimg.png",
      },
      {
        id: "joy",
        name: "Joy",
        avatarUrl: "/testimg.png",
      },
    ],
  },
  {
    id: "5",
    variant: "1v1",
    title: "Pere vs CeeC: Who will survive the Arena Games?",
    yesProbability: 50,
    noProbability: 50,
    yesOdds: "1k -> 2k",
    noOdds: "1k -> 2k",
    contestants: [
      {
        id: "pere",
        name: "Pere Egbi",
        avatarUrl: "/testimg.png",
      },
      {
        id: "ceec",
        name: "CeeC Nwadiora",
        avatarUrl: "/testimg.png",
      },
    ],
  },
  {
    id: "6",
    variant: "1v1",
    title: "Cross vs Adekunle: Who gets more votes in the finals?",
    yesProbability: 45,
    noProbability: 55,
    yesOdds: "1k -> 2.2k",
    noOdds: "1k -> 1.8k",
    contestants: [
      {
        id: "cross",
        name: "Cross Okonkwo",
        avatarUrl: "/testimg.png",
      },
      {
        id: "adekunle",
        name: "Adekunle Olopade",
        avatarUrl: "/testimg.png",
      },
    ],
  },

  // --- ROW 3: MULTI-OPTION CARDS ---
  {
    id: "7",
    variant: "multi_option",
    title: "Who will be evicted from the BBNaija House on Sunday?",
    contestants: [
      {
        id: "c1",
        name: "Seyi Awolowo",
        avatarUrl: "/testimg.png",
        odds: "1k -> 2.5k",
        probability: 40,
      },
      {
        id: "c2",
        name: "Venita Akpofure",
        avatarUrl: "/testimg.png",
        odds: "1k -> 4k",
        probability: 25,
      },
    ],
  },
  {
    id: "8",
    variant: "multi_option",
    title: "Which Housemate will win the Immunity Challenge?",
    contestants: [
      {
        id: "m1",
        name: "Ilebaye Odiniya",
        avatarUrl: "/testimg.png",
        odds: "1k -> 3k",
        probability: 33,
      },
      {
        id: "m2",
        name: "Alex Asogwa",
        avatarUrl: "/testimg.png",
        odds: "1k -> 4.5k",
        probability: 22,
      },
    ],
  },
]
