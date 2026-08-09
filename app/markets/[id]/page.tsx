import type { Metadata } from "next"
import { MarketDetailClient } from "@/components/parent/market-details/market-detail-client"
import { adminDb } from "@/lib/instant-admin"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const res = await adminDb.query({
      markets: {
        $: {
          where: {
            or: [{ id }, { slug: id }],
          },
        },
      },
    })
    const market = (res as any)?.markets?.[0]
    if (market) {
      return {
        title: `${market.title} — Sheybi`,
        description: market.description || `Predict the outcome of "${market.title}". Win Naira payouts on Sheybi.`,
        openGraph: {
          title: `${market.title} — Sheybi`,
          description: market.description || `Predict the outcome of "${market.title}".`,
          images: [market.imageUrl || "/sheybi-mascot.png"],
        },
      }
    }
  } catch {
    // Fallback
  }

  return {
    title: "Prediction Market — Sheybi",
    description: "Predict Big Brother Naija outcomes in real-time on Sheybi.",
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <MarketDetailClient marketId={id} />
}
