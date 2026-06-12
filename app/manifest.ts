import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    theme_color: "#1C1C1C",
    background_color: "#1C1C1C",
    icons: [
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "icon512_maskable.png",
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: "icon512_rounded.png",
        type: "image/png",
      },
    ],
    orientation: "any",
    display: "standalone",
    dir: "auto",
    lang: "en-US",
    name: "Spry Finance",
    short_name: "Spry",
    scope: "/",
    start_url: "/",
    description:
      "Dynamic-fee Uniswap v4 hooks that turn arbitrage-driven impermanent loss into yield for liquidity providers.",
  };
}
