<div align="center">

# Spry Finance Landing Page

**Turn volatility into LP yield.**

Official landing page for Spry, the dynamic-fee Uniswap v4 hook that turns
arbitrage-driven impermanent loss into revenue for liquidity providers.

[![Website](https://img.shields.io/badge/website-spry.fi-8936FF)](https://spry.fi)
[![App](https://img.shields.io/badge/app-app.spry.fi-8936FF)](https://app.spry.fi)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)

</div>

---

## Overview

This repository contains the source code for the official Spry Finance
website, live at **[spry.fi](https://spry.fi)**. It is a
[Next.js](https://nextjs.org/) application built with the App Router,
React 19, TypeScript and Tailwind CSS, using
[shadcn/ui](https://ui.shadcn.com/) and Radix primitives for the component
layer, with Space Grotesk and Inter loaded through `next/font`.

The site tells the protocol story (impact-priced dynamic fees, the five fee
tiers, and how arbitrage premiums route back to liquidity providers), hosts
the whitepaper and pitch deck, and funnels visitors to the testnet app.

## The Spry Ecosystem

This landing page is one of several repositories under
[SpryFinance](https://github.com/SpryFinance):

| Repository | Description |
| ---------- | ----------- |
| [spry-contracts](https://github.com/SpryFinance/spry-contracts) | Uniswap V4 hook that turns arbitrage-driven impermanent loss into LP revenue. Large swaps pay a dynamic, tier-aware fee that accrues to liquidity providers. |
| [spry-interface](https://github.com/SpryFinance/spry-interface) | Web interface for Spry, the dynamic-fee Uniswap V4 hook. Swap, provide liquidity, and create pools across the five fee tiers; a Spry-native Uniswap-interface fork on Unichain & Base Sepolia. |
| [spry-subgraph](https://github.com/SpryFinance/spry-subgraph) | The Graph subgraph for Spry, the dynamic-fee Uniswap V4 hook. Indexes pools, per-swap tier-aware fees, and the hook's fee-curve telemetry for LP analytics. |
| spry-main-landing | This repository: the official landing page, live at [spry.fi](https://spry.fi). |

## Tech Stack

| Area          | Technology                                        |
| ------------- | ------------------------------------------------- |
| Framework     | [Next.js 15](https://nextjs.org/) (App Router)    |
| UI Library    | [React 19](https://react.dev/)                    |
| Language      | [TypeScript](https://www.typescriptlang.org/)     |
| Styling       | [Tailwind CSS](https://tailwindcss.com/)          |
| Components    | [shadcn/ui](https://ui.shadcn.com/) + Radix UI    |
| Fonts         | Space Grotesk + Inter via `next/font`             |
| Animation     | [Framer Motion](https://www.framer.com/motion/)   |
| Charts        | [Recharts](https://recharts.org/)                 |
| Forms         | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (developed on v22)
- A package manager: [pnpm](https://pnpm.io/) is recommended

### Installation

```bash
# Clone the repository
git clone https://github.com/SpryFinance/spry-main-landing.git
cd spry-main-landing

# Install dependencies
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

### Available Scripts

| Command      | Description                                       |
| ------------ | ------------------------------------------------- |
| `pnpm dev`   | Start the development server                      |
| `pnpm build` | Create an optimized production build              |
| `pnpm start` | Run the production build (serves on port `3030`)  |
| `pnpm lint`  | Run Next.js linting                               |

## Project Structure

```
spry-main-landing/
├── app/                # Next.js App Router (pages, layout, routes)
│   ├── deck/           # Route serving the pitch deck PDF
│   ├── layout.tsx      # Root layout, fonts & site metadata
│   ├── manifest.ts     # PWA manifest
│   └── page.tsx        # Landing page
├── components/         # Reusable UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/                # Utilities & helpers
├── public/             # Static assets (images, icons, whitepaper)
└── styles/             # Global styles
```

## Resources

- 🌐 Website: **[spry.fi](https://spry.fi)**
- 🚀 App (Base Sepolia testnet): **[app.spry.fi](https://app.spry.fi)**
- 📄 Whitepaper: [`public/Spry-Whitepaper.pdf`](public/Spry-Whitepaper.pdf)
- 🎞️ Pitch deck: [spry.fi/deck](https://spry.fi/deck)
- 🐙 GitHub organization: [github.com/SpryFinance](https://github.com/SpryFinance)
- 🐦 X (Twitter): [@spry_fi](https://x.com/spry_fi)
- ✉️ Contact: [support@spry.fi](mailto:support@spry.fi)

## License

This project is licensed under the **GNU General Public License v3.0**.
See the [`LICENSE`](LICENSE) file for details.
