<div align="center">

# Spry Finance — Landing Page

**Turning market volatility into a source of growth.**

Spry Finance transforms impermanent loss into a benefit for liquidity providers.

[![Website](https://img.shields.io/badge/website-spry.fi-8936FF)](https://spry.fi)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## Overview

This repository contains the source code for the official Spry Finance website,
live at **[spry.fi](https://spry.fi)**. It is a [Next.js](https://nextjs.org/)
application built with the App Router, React 19, TypeScript and Tailwind CSS,
using [shadcn/ui](https://ui.shadcn.com/) and Radix primitives for the
component layer.

## Tech Stack

| Area          | Technology                                        |
| ------------- | ------------------------------------------------- |
| Framework     | [Next.js 15](https://nextjs.org/) (App Router)    |
| UI Library    | [React 19](https://react.dev/)                    |
| Language      | [TypeScript](https://www.typescriptlang.org/)     |
| Styling       | [Tailwind CSS](https://tailwindcss.com/)          |
| Components    | [shadcn/ui](https://ui.shadcn.com/) + Radix UI    |
| Animation     | [Framer Motion](https://www.framer.com/motion/)   |
| Charts        | [Recharts](https://recharts.org/)                 |
| Forms         | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (developed on v22)
- A package manager — [pnpm](https://pnpm.io/) is recommended

### Installation

```bash
# Clone the repository
git clone https://github.com/spryfinance/spry-main-landing.git
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
│   ├── layout.tsx      # Root layout & site metadata
│   ├── manifest.ts     # PWA manifest
│   └── page.tsx        # Landing page
├── components/         # Reusable UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/                # Utilities & helpers
├── public/            # Static assets (images, icons, whitepaper)
└── styles/             # Global styles
```

## Resources

- 🌐 Website: **[spry.fi](https://spry.fi)**
- 📄 Whitepaper: [`public/Spry-Whitepaper.pdf`](public/Spry-Whitepaper.pdf)

## License

This project is licensed under the **GNU General Public License v3.0**.
See the [`LICENSE`](LICENSE) file for details.