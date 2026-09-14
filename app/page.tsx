import type { Metadata } from "next"
import { HomeClient } from "@/components/home/home-client"

export const metadata: Metadata = {
  description: "Predict Big Brother Naija outcomes in real-time. Trade positions, win Naira payouts, and turn your opinion into profit on Sheybi.",
  openGraph: {
    title: "Sheybi — Live Prediction Markets",
    description: "Predict Big Brother Naija outcomes in real-time. Trade positions, win Naira payouts, and turn your opinion into profit on Sheybi.",
    images: ["/sheybi-mascot.png"],
  },
}

export default function LandingPage() {
  return <HomeClient />
}
