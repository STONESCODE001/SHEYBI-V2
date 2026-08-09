import type { Metadata } from "next"
import { WalletClient } from "@/components/wallet/wallet-client"

export const metadata: Metadata = {
  title: "Wallet — Sheybi",
  description: "Fund your wallet, request instant Naira payouts, and view full transaction history.",
  openGraph: {
    title: "Wallet — Sheybi",
    description: "Fund your wallet, request instant Naira payouts, and view full transaction history.",
    images: ["/sheybi-mascot.png"],
  },
}

export default function WalletPage() {
  return <WalletClient />
}
