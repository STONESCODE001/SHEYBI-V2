import type { Metadata } from "next"
import { PortfolioClient } from "@/components/portfolio/portfolio-client"

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "Track your active BBNaija prediction positions, current returns, and trade history.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "My Portfolio",
    description: "Track your active BBNaija prediction positions, current returns, and trade history.",
    images: ["/sheybi-mascot.png"],
  },
}

export default function PortfolioPage() {
  return <PortfolioClient />
}
