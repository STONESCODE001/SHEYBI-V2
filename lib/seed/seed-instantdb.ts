/**
 * InstantDB Database Seed Script
 * ================================
 * Populates initial Categories, Prediction Markets, Market Options, and initial LMSR probabilities
 * into InstantDB using the Admin SDK (adminDb).
 *
 * RUN VIA TERMINAL:
 *   npx tsx lib/seed/seed-instantdb.ts
 */

import { id } from "@instantdb/admin";
import { adminDb } from "../instant-admin";
import { calculateB } from "../prediction-engine/lmsr";

async function seedInstantDB() {
  console.log("🌱 Starting InstantDB database seed for Sheybi...");

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const initialLiquidity = 50000; // ₦50,000 initial liquidity L
  const binaryB = calculateB(initialLiquidity, 2); // b = 36067
  const multiB = calculateB(initialLiquidity, 4); // b = 18034

  // ============================================================================
  // 1. CATEGORIES
  // ============================================================================
  console.log("📦 Creating categories...");

  const catBbnaijaId = id();
  const catHohId = id();
  const catEvictionsId = id();

  const categoriesTx = [
    adminDb.tx.categories[catBbnaijaId].update({
      name: "BBNaija Season 9",
      slug: "bbnaija",
      description: "Big Brother Naija Season 9 overall winner predictions",
      icon: "trophy",
      displayOrder: 1,
      isActive: true,
      createdAt: now,
    }),
    adminDb.tx.categories[catHohId].update({
      name: "Head of House",
      slug: "hoh",
      description: "Weekly Arena Games & HOH title winners",
      icon: "crown",
      displayOrder: 2,
      isActive: true,
      createdAt: now,
    }),
    adminDb.tx.categories[catEvictionsId].update({
      name: "Eviction Predictions",
      slug: "evictions",
      description: "Sunday live eviction night outcomes",
      icon: "user-minus",
      displayOrder: 3,
      isActive: true,
      createdAt: now,
    }),
  ];

  await adminDb.transact(categoriesTx);
  console.log("✅ Categories seeded successfully.");

  // ============================================================================
  // 2. MARKETS & OPTIONS
  // ============================================================================
  console.log("🔥 Creating prediction markets and options...");

  const txOps: any[] = [];

  // ----------------------------------------------------------------------------
  // Market 1: Binary (Will Kellyrae win BBNaija Season 9?)
  // ----------------------------------------------------------------------------
  const market1Id = id();
  const opt1YesId = id();
  const opt1NoId = id();

  txOps.push(
    adminDb.tx.markets[market1Id]
      .update({
        title: "Will Kellyrae win BBNaija Season 9?",
        description: "Resolves YES if Kellyrae is officially crowned the winner of BBNaija Season 9 at the grand finale. Source of truth: MultiChoice / DSTV official broadcast.",
        marketType: "binary",
        displayVariant: "binary",
        state: "open",
        openingTime: now - dayMs,
        closingTime: now + 30 * dayMs,
        liquidity: initialLiquidity,
        liquidityParam: binaryB,
        tradingVolume: 125000,
        totalTrades: 42,
        createdBy: "admin_system",
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
        slug: "will-kellyrae-win-bbnaija-season-9",
        isFeatured: true,
        createdAt: now - dayMs,
        updatedAt: now,
      })
      .link({ category: catBbnaijaId }),

    adminDb.tx.market_options[opt1YesId]
      .update({
        name: "YES",
        displayOrder: 1,
        probability: 65,
        sharePrice: 0.65,
        sharesOutstanding: 1200,
        isWinningOption: false,
        createdAt: now - dayMs,
      })
      .link({ market: market1Id }),

    adminDb.tx.market_options[opt1NoId]
      .update({
        name: "NO",
        displayOrder: 2,
        probability: 35,
        sharePrice: 0.35,
        sharesOutstanding: 800,
        isWinningOption: false,
        createdAt: now - dayMs,
      })
      .link({ market: market1Id })
  );

  // ----------------------------------------------------------------------------
  // Market 2: 1v1 (Who wins Sunday Head of House Game: Wanni vs Anita?)
  // ----------------------------------------------------------------------------
  const market2Id = id();
  const opt2WanniId = id();
  const opt2AnitaId = id();

  txOps.push(
    adminDb.tx.markets[market2Id]
      .update({
        title: "Who wins Sunday Head of House Game: Wanni vs Anita?",
        description: "1v1 Head-to-Head arena game outcome between Wanni and Anita. Resolves to whoever places higher or secures HOH title.",
        marketType: "binary",
        displayVariant: "1v1",
        state: "open",
        openingTime: now - dayMs,
        closingTime: now + 5 * dayMs,
        liquidity: initialLiquidity,
        liquidityParam: binaryB,
        tradingVolume: 85000,
        totalTrades: 28,
        createdBy: "admin_system",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
        slug: "hoh-game-wanni-vs-anita",
        isFeatured: true,
        createdAt: now - dayMs,
        updatedAt: now,
      })
      .link({ category: catHohId }),

    adminDb.tx.market_options[opt2WanniId]
      .update({
        name: "Wanni",
        displayOrder: 1,
        probability: 58,
        sharePrice: 0.58,
        sharesOutstanding: 950,
        isWinningOption: false,
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        createdAt: now - dayMs,
      })
      .link({ market: market2Id }),

    adminDb.tx.market_options[opt2AnitaId]
      .update({
        name: "Anita",
        displayOrder: 2,
        probability: 42,
        sharePrice: 0.42,
        sharesOutstanding: 700,
        isWinningOption: false,
        imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        createdAt: now - dayMs,
      })
      .link({ market: market2Id })
  );

  // ----------------------------------------------------------------------------
  // Market 3: Multi-Option (Who will be evicted first in Week 5?)
  // ----------------------------------------------------------------------------
  const market3Id = id();
  const opt3KassiaId = id();
  const opt3OzeeId = id();
  const opt3ShaunId = id();
  const opt3VictoriaId = id();

  txOps.push(
    adminDb.tx.markets[market3Id]
      .update({
        title: "Who would be Evicted First ??",
        description: "Multi-candidate eviction market. Resolves to the housemate announced first by Ebuka during the Sunday live eviction show.",
        marketType: "multi_option",
        displayVariant: "standard",
        state: "open",
        openingTime: now - 2 * dayMs,
        closingTime: now + 3 * dayMs,
        liquidity: initialLiquidity,
        liquidityParam: multiB,
        tradingVolume: 210000,
        totalTrades: 65,
        createdBy: "admin_system",
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
        slug: "who-would-be-evicted-first",
        isFeatured: false,
        createdAt: now - 2 * dayMs,
        updatedAt: now,
      })
      .link({ category: catEvictionsId }),

    adminDb.tx.market_options[opt3KassiaId]
      .update({
        name: "Kassia",
        displayOrder: 1,
        probability: 32,
        sharePrice: 0.32,
        sharesOutstanding: 1500,
        isWinningOption: false,
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
        createdAt: now - 2 * dayMs,
      })
      .link({ market: market3Id }),

    adminDb.tx.market_options[opt3OzeeId]
      .update({
        name: "Ozee",
        displayOrder: 2,
        probability: 28,
        sharePrice: 0.28,
        sharesOutstanding: 1300,
        isWinningOption: false,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        createdAt: now - 2 * dayMs,
      })
      .link({ market: market3Id }),

    adminDb.tx.market_options[opt3ShaunId]
      .update({
        name: "Shaun",
        displayOrder: 3,
        probability: 22,
        sharePrice: 0.22,
        sharesOutstanding: 1000,
        isWinningOption: false,
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        createdAt: now - 2 * dayMs,
      })
      .link({ market: market3Id }),

    adminDb.tx.market_options[opt3VictoriaId]
      .update({
        name: "Victoria",
        displayOrder: 4,
        probability: 18,
        sharePrice: 0.18,
        sharesOutstanding: 800,
        isWinningOption: false,
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        createdAt: now - 2 * dayMs,
      })
      .link({ market: market3Id })
  );

  await adminDb.transact(txOps);

  console.log("✨ ALL SEED DATA SUCCESSFULLY PUSHED TO INSTANTDB!");
  console.log(`   - App ID: ${process.env.NEXT_PUBLIC_INSTANT_APP_ID}`);
  console.log("   - Markets Created: 3");
  console.log("   - Categories Created: 3");
  console.log("   - Options Created: 8");
}

seedInstantDB().catch((err) => {
  console.error("❌ Error seeding InstantDB:", err);
  process.exit(1);
});
