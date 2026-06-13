import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spry.fi"),
  title: {
    default: "Spry Finance | Turn Volatility into LP Yield",
    template: "%s | Spry Finance",
  },
  description:
    "Spry is a dynamic-fee Uniswap v4 hook that scales swap fees with price impact, turning arbitrage-driven impermanent loss into yield for liquidity providers. Live on Unichain & Base Sepolia.",
  keywords: [
    "Spry Finance",
    "DeFi",
    "Uniswap v4",
    "hooks",
    "dynamic fees",
    "impermanent loss",
    "liquidity provider",
    "MEV protection",
    "Base",
  ],
  applicationName: "Spry Finance",
  authors: [{ name: "Spry Finance", url: "https://spry.fi" }],
  openGraph: {
    title: "Spry Finance | Turn Volatility into LP Yield",
    description:
      "Dynamic-fee Uniswap v4 hooks that protect liquidity providers from arbitrage-driven impermanent loss.",
    url: "https://spry.fi",
    siteName: "Spry Finance",
    images: [
      {
        url: "/spry-finance-logo.png",
        width: 512,
        height: 512,
        alt: "Spry Finance logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@spry_fi",
    creator: "@spry_fi",
    title: "Spry Finance | Turn Volatility into LP Yield",
    description:
      "Dynamic-fee Uniswap v4 hooks that protect liquidity providers from arbitrage-driven impermanent loss.",
    images: ["/spry-finance-logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon512_rounded.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon512_maskable.png", sizes: "512x512", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1C1C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
