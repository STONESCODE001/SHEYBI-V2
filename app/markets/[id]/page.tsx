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
      const title = (market.title || "Prediction Market").slice(0, 100)
      const description = (
        market.description || `Predict the outcome of "${title}". Win Naira payouts on Sheybi.`
      ).slice(0, 200)

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: [market.imageUrl || "/sheybi-mascot.png"],
        },
      }
    }
  } catch (err) {
    console.error("[generateMetadata] Error fetching market metadata:", err)
  }

  return {
    title: "Prediction Market",
    description: "Predict Big Brother Naija outcomes in real-time on Sheybi.",
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <MarketDetailClient marketId={id} />
}
