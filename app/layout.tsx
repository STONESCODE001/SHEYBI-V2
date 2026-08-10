import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DialogProvider } from "@/components/dialog";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

import { InstantClerkBridge } from "@/components/auth/instant-clerk-bridge";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sheybi.com"),
  title: {
    default: "Sheybi — Live Prediction Markets",
    template: "%s — Sheybi",
  },
  description: "Predict Big Brother Naija outcomes in real-time. Trade positions, win Naira payouts, and prove your predictions on Sheybi. Predict. Play. Win.",
  openGraph: {
    title: "Sheybi — Live Prediction Markets",
    description: "Predict Big Brother Naija outcomes in real-time. Trade positions, win Naira payouts, and prove your predictions on Sheybi. Predict. Play. Win.",
    images: ["/sheybi-mascot.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" style={{ fontFamily: 'Inter, sans-serif' }} suppressHydrationWarning>
        <Analytics />
        <ClerkProvider
          appearance={{
            theme: dark,
          }}
        >
          <InstantClerkBridge />
          <DialogProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </DialogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
