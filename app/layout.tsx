import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Capacity Estimating Dashboard | O'Donnell Metal Deck & Bar Joist",
  description: "Four-week view of estimating capacity by region, from the Ragic bid calendar.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} bg-background antialiased`}>
      <body className="min-h-dvh font-sans" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
