import type { Metadata } from "next"
import { MarketsClient } from "@/components/markets/markets-client"

export const metadata: Metadata = {
  title: "Markets — Sheybi",
  description: "Browse all live BBNaija prediction markets, filter by trending categories, and trade outcomes in real-time.",
  openGraph: {
    title: "Markets — Sheybi",
    description: "Browse all live BBNaija prediction markets, filter by trending categories, and trade outcomes in real-time.",
    images: ["/sheybi-mascot.png"],
  },
}

export default function MarketsPage() {
  return <MarketsClient />
}
