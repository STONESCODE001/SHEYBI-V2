import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DialogProvider } from "@/components/dialog";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sheybi",
  description: "Premium prediction market platform",
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
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
        <DialogProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </DialogProvider>
      </body>
    </html>
  );
}
