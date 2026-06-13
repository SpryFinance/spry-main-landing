"use client";

import type React from "react";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Leaf,
  Layers,
  Activity,
  ShieldCheck,
  Github,
  FileText,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import BlackHole from "@/components/blackhole";
import GooShader from "@/components/goo-shader";
import { useIsMobile } from "@/hooks/use-mobile";

// Animation variants for staggering children
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#philosophy", label: "Philosophy" },
];

const STATS = [
  { value: "5", label: "Fee tiers, one per pool profile" },
  { value: "0.01-1%", label: "Base fees for routine swaps" },
  { value: "9.9%", label: "Fee cap on arbitrage-sized trades" },
  { value: "264", label: "Tests passing, open source" },
];

const TIERS = [
  { name: "Stable", tick: "tick spacing 1", dot: "#86EFAC" },
  { name: "Like-Asset", tick: "tick spacing 10", dot: "#5EEAD4" },
  { name: "Blue-Chip", tick: "tick spacing 60", dot: "#7DD3FC" },
  { name: "Volatile", tick: "tick spacing 200", dot: "#C084FC" },
  { name: "Exotic", tick: "tick spacing 1000", dot: "#A900FF" },
];

const STEPS = [
  {
    number: "01",
    title: "A swap arrives",
    description:
      "Trades route through the Spry hook on top of unmodified Uniswap v4 core contracts. Routine swaps simply pay their tier's base fee.",
  },
  {
    number: "02",
    title: "Impact is measured",
    description:
      "The hook tracks cumulative price impact inside a rolling block window, so splitting one large trade into many small ones reads exactly the same.",
  },
  {
    number: "03",
    title: "LPs collect the premium",
    description:
      "As impact grows, the fee climbs a four-zone curve up to 9.9%. That arbitrage premium flows back to liquidity providers through v4's fee channel.",
  },
];

export default function LandingPageV6() {
  const [offsetY, setOffsetY] = useState(0);
  const [blackholeSpeed, setBlackholeSpeed] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const buttonX = rect.left + rect.width / 2;
      const buttonY = rect.top + rect.height / 2;

      const dx = e.clientX - buttonX;
      const dy = e.clientY - buttonY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let speed = 1;

      if (distance < 100) {
        speed = 3;
      } else if (distance < 300) {
        speed = 2.5;
      } else if (distance < 400) {
        speed = 2;
      } else if (distance < 500) {
        speed = 1.5;
      } else {
        speed = 1;
      }

      setBlackholeSpeed(speed);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]);

  return (
    <div className="w-full min-h-screen bg-spry-ink text-spry-fog font-sans relative overflow-x-hidden">
      {/* Subtle background glass orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-spry-violet/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-spry-fog/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-spry-mint/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-6 transition-all duration-300">
        <div className="container mx-auto">
          <div className="bg-spry-ink/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 md:px-6 py-3 shadow-2xl shadow-spry-violet/5">
            <div className="flex items-center justify-between">
              <Link
                href="#"
                className="flex items-center gap-2 md:gap-3"
                prefetch={false}
                aria-label="Spry Finance home"
              >
                <div className="p-1.5 md:p-2 bg-spry-fog/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                  <Image
                    src="/spry-finance-logo.png"
                    alt="Spry Finance logo: a sprout growing over water"
                    width={28}
                    height={28}
                    className="rounded-2xl"
                  />
                </div>
                <span className="text-base md:text-xl font-display font-semibold tracking-tight text-white drop-shadow-lg whitespace-nowrap">
                  Spry Finance
                </span>
              </Link>
              <nav
                className="hidden md:flex items-center gap-6 text-sm text-spry-fog/80"
                aria-label="Main navigation"
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(137,54,255,0.6)]"
                    prefetch={false}
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://github.com/SpryFinance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(137,54,255,0.6)]"
                  aria-label="Spry Finance on GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </nav>
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  className="bg-gradient-to-r from-spry-violet to-spry-plum text-white hover:from-spry-grape hover:to-spry-violet transition-all duration-300 shadow-lg shadow-spry-violet/25 hover:shadow-spry-violet/40 hover:scale-105 border border-white/10 px-3 md:px-4 whitespace-nowrap"
                >
                  <a
                    href="https://app.spry.fi"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Launch App
                  </a>
                </Button>
                <button
                  type="button"
                  className="md:hidden p-2 text-spry-fog/80 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-expanded={mobileMenuOpen}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {/* Mobile navigation */}
            {mobileMenuOpen && (
              <nav
                className="md:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-1 text-sm"
                aria-label="Mobile navigation"
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-2 py-2 rounded-lg text-spry-fog/80 hover:text-white hover:bg-white/5 transition-colors"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://github.com/SpryFinance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-2 rounded-lg text-spry-fog/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              </nav>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with BlackHole */}
        <section className="relative w-full h-[100svh] md:h-[120vh] flex items-center justify-center overflow-hidden text-center">
          {/* BlackHole Animation Background */}
          <Suspense fallback={<div className="absolute inset-0 bg-spry-ink" />}>
            {isMobile === false ? (
              <div className="absolute inset-0 z-0">
                <BlackHole speedMultiplier={blackholeSpeed} />
              </div>
            ) : (
              <div className="absolute inset-0 z-0">
                {/* On-brand mobile backdrop: violet energy above, mint growth below */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(137,54,255,0.3),transparent_55%),radial-gradient(ellipse_at_70%_85%,rgba(134,239,172,0.14),transparent_55%)]" />
                <Image
                  src="/hero-background-v2.png"
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover opacity-40"
                />
              </div>
            )}
          </Suspense>
          {/* Original background image with reduced opacity */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center z-10 opacity-10"
            style={{
              backgroundImage: `url(/hero-background-v2.png)`,
              y: offsetY * 0.4,
              scale: 1.1,
            }}
          />

          {/* Gradient overlay for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-spry-ink z-20" />

          {/* Additional fade overlay at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-spry-ink to-transparent z-25" />

          <div
            className="relative z-30 container px-4 md:px-6"
            style={{ transform: `translateY(${offsetY * 0.1}px)` }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6 flex justify-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs md:text-sm text-spry-fog/80">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spry-mint opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-spry-mint"></span>
                </span>
                Live on Unichain Sepolia & Base Sepolia · Built on Uniswap v4
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-white drop-shadow-2xl"
              style={{
                filter: "drop-shadow(0 0 20px rgba(137, 54, 255, 0.25))",
              }}
            >
              Turn volatility into{" "}
              <span className="bg-gradient-to-r from-spry-mint via-[#9F7AEA] to-spry-grape bg-clip-text text-transparent">
                LP yield.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-spry-fog/90 drop-shadow-lg"
            >
              Spry is a dynamic-fee Uniswap v4 hook that prices every swap by
              its impact, turning arbitrage-driven impermanent loss into
              revenue for liquidity providers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    size="lg"
                    ref={buttonRef}
                    asChild
                    className="bg-gradient-to-r from-spry-violet to-spry-plum text-white hover:from-spry-grape hover:to-spry-violet transition-all duration-300 scale-100 hover:scale-105 shadow-2xl shadow-spry-violet/30 hover:shadow-spry-violet/50 backdrop-blur-sm border border-white/10"
                  >
                    <a
                      href="https://app.spry.fi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Enter the DeFi Rabbithole
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    asChild
                    variant="outline"
                    className="bg-transparent border-white/20 text-spry-fog hover:bg-spry-fog hover:text-spry-ink transition-all duration-300 backdrop-blur-sm"
                  >
                    <a href="/Spry-Whitepaper.pdf" download>
                      <FileText className="mr-2 h-4 w-4" /> Read the Whitepaper
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-spry-fog/60">
                  Start providing liquidity in dynamic-fee v4 pools
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="relative z-30 -mt-6 pb-4 md:pb-8">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {STATS.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="bg-spry-fog/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 text-center shadow-xl shadow-spry-violet/5"
                >
                  <p className="text-2xl md:text-3xl font-display font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs md:text-sm text-spry-fog/60">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-spry-ink relative scroll-mt-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={itemVariants}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-spry-mint/90 mb-3">
                Why Spry
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white drop-shadow-lg">
                An Ecosystem for Growth
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-spry-fog/70">
                Every mechanism in the protocol is designed to nurture and
                protect the capital that keeps markets liquid.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <FeatureCard
                icon={<Leaf className="w-7 h-7 text-spry-mint/90" />}
                title="IL Becomes Income"
                description="The arbitrage flow that causes impermanent loss pays escalating fees, and that excess is routed straight back to LPs."
              />
              <FeatureCard
                icon={<Activity className="w-7 h-7 text-spry-mint/90" />}
                title="Fees That Read the Market"
                description="No flat rates. Each swap is priced by size and cumulative price impact, from the tier's base fee up to a 9.9% cap."
              />
              <FeatureCard
                icon={<Layers className="w-7 h-7 text-spry-mint/90" />}
                title="Five Pool Tiers"
                description="Stable, Like-Asset, Blue-Chip, Volatile and Exotic curves, dispatched automatically by tick spacing with base fees from 0.01% to 1.00%."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-7 h-7 text-spry-mint/90" />}
                title="Path-Independent by Design"
                description="Marginal integral pricing makes fees path-independent within a block window: no discounts for splitting, no loopholes for MEV."
              />
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-20 md:py-28 bg-spry-ink relative scroll-mt-24"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={itemVariants}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-spry-mint/90 mb-3">
                How It Works
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white drop-shadow-lg">
                From Price Impact to LP Revenue
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-spry-fog/70">
                One hook, three moves: observe the swap, measure its impact,
                and reprice it so the pool wins.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {STEPS.map((step) => (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  className="relative bg-spry-fog/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-spry-violet/40 transition-all duration-500 shadow-xl shadow-spry-violet/5 overflow-hidden group"
                >
                  <span className="absolute -top-3 right-4 text-7xl font-display font-bold text-white/5 select-none group-hover:text-spry-violet/10 transition-colors duration-500">
                    {step.number}
                  </span>
                  <p className="text-sm font-display font-semibold text-spry-mint mb-3">
                    {step.number}
                  </p>
                  <h3 className="text-xl font-display font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-spry-fog/70 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Fee tiers */}
            <motion.div
              className="mt-12 bg-spry-fog/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl shadow-spry-violet/5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={itemVariants}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h3 className="text-lg font-display font-semibold text-white">
                  Five tier-aware fee curves
                </h3>
                <p className="text-sm text-spry-fog/60">
                  Dispatched by pool tick spacing, from calm to wild
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-spry-ink/40 px-4 py-3 hover:border-white/25 transition-colors duration-300"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tier.dot }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {tier.name}
                      </p>
                      <p className="text-xs text-spry-fog/50">{tier.tick}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Philosophy Section with Goo Shader */}
        <section
          id="philosophy"
          className="py-20 md:py-32 bg-spry-coal overflow-hidden relative scroll-mt-24"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="bg-spry-fog/3 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl shadow-spry-violet/5 relative overflow-hidden group">
              {/* Goo Shader Background - clipped by the glassmorphism div */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <GooShader />
              </div>

              {/* Blur overlay for focus effect */}
              <div className="absolute inset-0 rounded-3xl bg-black/20 backdrop-blur-sm opacity-0 transition-all duration-500 group-hover:opacity-100 pointer-events-none z-5" />

              {/* Content overlay */}
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="relative transition-all duration-500 group-hover:scale-110 group-hover:z-20">
                    <div className="absolute inset-0 bg-spry-violet/10 rounded-full blur-2xl opacity-50 animate-pulse transition-all duration-500 group-hover:opacity-80 group-hover:blur-xl"></div>
                    <div className="relative z-10 p-4 bg-spry-fog/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-500 hover:bg-spry-fog/10 hover:border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-spry-violet/20">
                      <Image
                        src="/spry-finance-logo.png"
                        alt="Spry Finance logo: a sprout growing over water"
                        width={250}
                        height={250}
                        className="drop-shadow-2xl rounded-2xl transition-all duration-500 hover:drop-shadow-[0_0_30px_rgba(137,54,255,0.4)]"
                      />
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="text-left transition-all duration-500 group-hover:scale-105 group-hover:z-20"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-spry-mint/90 mb-3">
                    Our Philosophy
                  </p>
                  <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mb-6 drop-shadow-lg">
                    Volatility, Made Symbiotic
                  </h2>
                  <p className="text-lg text-spry-fog/90 leading-relaxed drop-shadow-sm">
                    We believe decentralized finance should be symbiotic.
                    Instead of fighting market forces like impermanent loss, we
                    price them. Spry reimagines the relationship between
                    traders and liquidity providers: the more aggressively the
                    market moves against a pool, the more that pool earns for
                    the people who keep it liquid. It's not just about returns;
                    it's about a more resilient and sustainable financial
                    future.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-spry-ink relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center bg-spry-fog/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl shadow-spry-violet/10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={itemVariants}
            >
              <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white mb-6 drop-shadow-lg">
                Ready to Grow with Spry?
              </h2>
              <p className="max-w-xl mx-auto text-spry-fog/70 mb-8">
                Swap and provide liquidity in dynamic-fee Uniswap v4 pools on
                Unichain Sepolia & Base Sepolia. Fully open source under GPL-3.0 and
                headed to audit before mainnet.
              </p>
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    size="lg"
                    asChild
                    className="bg-gradient-to-r from-spry-violet to-spry-plum text-white hover:from-spry-grape hover:to-spry-violet transition-all duration-300 scale-100 hover:scale-105 px-10 py-6 text-lg shadow-2xl shadow-spry-violet/30 hover:shadow-spry-violet/50 border border-white/10"
                    onMouseEnter={() => setBlackholeSpeed(3)}
                    onMouseLeave={() => setBlackholeSpeed(1)}
                  >
                    <a
                      href="https://app.spry.fi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Enter the DeFi Rabbithole{" "}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    asChild
                    variant="outline"
                    className="bg-transparent border-white/20 text-spry-fog hover:bg-spry-fog hover:text-spry-ink transition-all duration-300 px-8 py-6 text-lg"
                  >
                    <a
                      href="https://github.com/SpryFinance"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-5 w-5" /> View on GitHub
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-spry-fog/50">
                  Testnet only for now. Bring curiosity, not your life savings.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-spry-ink border-t border-white/10 py-10 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-spry-fog/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl shadow-spry-violet/5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-spry-fog/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <Image
                      src="/spry-finance-logo.png"
                      alt="Spry Finance logo: a sprout growing over water"
                      width={24}
                      height={24}
                      className="rounded-xl"
                    />
                  </div>
                  <span className="font-display font-semibold text-white">
                    Spry Finance
                  </span>
                </div>
                <p className="mt-3 max-w-sm text-sm text-spry-fog/60 leading-relaxed">
                  Dynamic-fee Uniswap v4 hooks that protect liquidity providers
                  from arbitrage-driven impermanent loss.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href="https://github.com/SpryFinance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-white/10 text-spry-fog/70 hover:text-white hover:border-white/30 transition-colors"
                    aria-label="Spry Finance on GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href="https://x.com/spry_fi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-white/10 text-spry-fog/70 hover:text-white hover:border-white/30 transition-colors"
                    aria-label="Spry Finance on X"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-current"
                      aria-hidden
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="mailto:support@spry.fi"
                    className="p-2 rounded-lg border border-white/10 text-spry-fog/70 hover:text-white hover:border-white/30 transition-colors"
                    aria-label="Email Spry Finance support"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-white mb-3">
                  Protocol
                </p>
                <ul className="space-y-2 text-sm text-spry-fog/60">
                  <li>
                    <Link
                      href="#features"
                      className="hover:text-white transition-colors"
                      prefetch={false}
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#how-it-works"
                      className="hover:text-white transition-colors"
                      prefetch={false}
                    >
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#philosophy"
                      className="hover:text-white transition-colors"
                      prefetch={false}
                    >
                      Philosophy
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://app.spry.fi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      Launch App
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-white mb-3">
                  Resources
                </p>
                <ul className="space-y-2 text-sm text-spry-fog/60">
                  <li>
                    <a
                      href="/Spry-Whitepaper.pdf"
                      className="hover:text-white transition-colors"
                      download
                    >
                      Whitepaper
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/deck"
                      className="hover:text-white transition-colors"
                      prefetch={false}
                    >
                      Pitch Deck
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://github.com/SpryFinance/spry-contracts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      Contracts
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/SpryFinance/spry-interface"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      Interface
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-sm text-spry-fog/50">
                &copy; {new Date().getFullYear()} Spry Finance. Open source
                under GPL-3.0.
              </p>
              <p className="text-sm text-spry-fog/50">
                Built on Uniswap v4 · Live on Unichain Sepolia & Base Sepolia
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <motion.div
    className="bg-spry-fog/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:bg-spry-fog/10 hover:border-spry-violet/40 transition-all duration-500 transform hover:-translate-y-2 shadow-xl shadow-spry-violet/5 hover:shadow-spry-violet/10 group"
    variants={itemVariants}
    whileHover={{ scale: 1.02 }}
  >
    <div className="mb-4 inline-flex p-3 rounded-xl bg-spry-mint/10 border border-spry-mint/20 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-display font-semibold text-white mb-2 drop-shadow-sm">
      {title}
    </h3>
    <p className="text-spry-fog/70 leading-relaxed">{description}</p>
  </motion.div>
);
