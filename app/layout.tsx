import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";


export const metadata: Metadata = {
  title: "Spry Finance",
  description:
    "Spry Finance transforms market volatility into a source of growth, turning impermanent loss into a benefit for liquidity providers.",
  // openGraph: {
  //   title: "Spry Finance",
  //   description:
  //     "Spry Finance transforms market volatility into a source of growth, turning impermanent loss into a benefit for liquidity providers.",
  //   url: "https://spry.fi", 
  //   siteName: "Spry Finance",
  //   images: [
  //     {
  //       url: "https://spry.fi/spry-finance-logo.png",
  //       width: 1200,
  //       height: 630,
  //       alt: "Spry Finance OG Image",
  //     },
  //   ],
  //   type: "website",
  // },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
          <link rel="manifest" href="manifest.json" />

      </Head>
      <body>{children}</body>
    </html>
  );
}
