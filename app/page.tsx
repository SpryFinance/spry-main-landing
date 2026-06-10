"use client";

import type React from "react";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Droplets, Sun, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import BlackHole from "@/components/blackhole";
import GooShader from "@/components/goo-shader";
import { useIsMobile } from "@/hooks/use-mobile";

// Animation variants for staggering children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function LandingPageV6() {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);
  const [blackholeSpeed, setBlackholeSpeed] = useState(1);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
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

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  let isMobile = useIsMobile();

  return (
    <div className="w-full min-h-screen bg-[#1C1C1C] text-[#F5F5F5] font-sans relative overflow-x-hidden">
      {/* Subtle background glass orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F5F5F5]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#F5F5F5]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-300/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-6 transition-all duration-300">
        <div className="container mx-auto">
          <div className="bg-[#1C1C1C]/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-2xl shadow-[#F5F5F5]/5">
            <div className="flex items-center justify-between">
              <Link
                href="#"
                className="flex items-center gap-3"
                prefetch={false}
              >
                <div className="p-2 bg-[#F5F5F5]/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                  <Image
                    src="/spry-finance-logo.png"
                    alt="Spry Finance Logo"
                    width={28}
                    height={28}
                    className="rounded-2xl"
                  />
                </div>
                <span className="text-xl font-medium text-white drop-shadow-lg">
                  Spry Finance
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm text-[#F5F5F5]/80">
                <Link
                  href="#features"
                  className="hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(245,245,245,0.6)]"
                  prefetch={false}
                >
                  Features
                </Link>
                <Link
                  href="#philosophy"
                  className="hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(245,245,245,0.6)]"
                  prefetch={false}
                >
                  Philosophy
                </Link>
                <a
                  href="/Spry-Whitepaper.pdf"
                  className="hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(245,245,245,0.6)]"
                  download
                >
                  Whitepaper
                </a>
              </nav>
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-[#F5F5F5] text-[#F5F5F5] hover:bg-[#F5F5F5] hover:text-[#1C1C1C] transition-all duration-300 backdrop-blur-sm shadow-lg shadow-[#F5F5F5]/10 hover:shadow-[#F5F5F5]/20 hover:scale-105"
              >
                <a
                  href="https://app.spry.fi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Launch App
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with BlackHole */}
        <section className="relative w-full h-[120vh] flex items-center justify-center overflow-hidden text-center">
          {/* BlackHole Animation Background */}
          <Suspense fallback={<>loading</>}>
            {isMobile == false ? (
              <div className="absolute  inset-0 z-0">
                <BlackHole speedMultiplier={blackholeSpeed} />
              </div>
            ) : (
              <div className="absolute  inset-0 z-0">
                <Image
                  src={"/bgmobile1.jpg"}
                  alt="background"
                  width={300}
                  height={550}
                  className="w-full h-full"
                ></Image>
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
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1C1C1C] z-20" />

          {/* Additional fade overlay at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1C1C1C] to-transparent z-25" />

          <div
            className="relative z-30 container px-4 md:px-6"
            style={{ transform: `translateY(${offsetY * 0.1}px)` }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white drop-shadow-2xl"
              style={{
                filter: "drop-shadow(0 0 20px rgba(245, 245, 245, 0.3))",
              }}
            >
              Cultivating Sustainable Yield.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-[#F5F5F5]/90 drop-shadow-lg"
            >
              Spry Finance transforms market volatility into a source of growth,
              turning impermanent loss into a benefit for liquidity providers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              <div className="mt-8 flex flex-col items-center gap-2">
                <Button
                  size="lg"
                  ref={buttonRef}
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 transition-all duration-300 scale-100 hover:scale-105 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 backdrop-blur-sm border border-purple-400/20"
                  // onMouseEnter={() => setBlackholeSpeed(3)}
                  // onMouseLeave={() => setBlackholeSpeed(1)}
                >
                  <a
                    href="https://app.spry.fi"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Enter the DeFi Rabbithole
                  </a>
                </Button>
                <p className="text-sm text-[#F5F5F5]/60 mt-1">
                  Start Providing Liquidity
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-[#1C1C1C] relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={itemVariants}
            >
              <h2 className="text-3xl md:text-4xl font-medium text-white drop-shadow-lg">
                An Ecosystem for Growth
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-[#F5F5F5]/70">
                Our protocol is designed from the ground up to nurture and
                protect your capital.
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
                icon={<Leaf className="w-7 h-7 text-green-300/80" />}
                title="IL as a Benefit"
                description="Our core innovation turns a classic DeFi risk into a unique advantage for LPs."
              />
              <FeatureCard
                icon={<Droplets className="w-7 h-7 text-green-300/80" />}
                title="Uniform Liquidity"
                description="Experience deep, consistent liquidity across all trading pairs for optimal pricing."
              />
              <FeatureCard
                icon={<Sun className="w-7 h-7 text-green-300/80" />}
                title="Variable LP Fees"
                description="Dynamic fees that adapt to market conditions, maximizing your earnings."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-7 h-7 text-green-300/80" />}
                title="Secure & Decentralized"
                description="Built on a secure, trustless framework to protect your assets."
              />
            </motion.div>
          </div>
        </section>

        {/* Philosophy Section with Goo Shader */}
        <section
          id="philosophy"
          className="py-20 md:py-32 bg-[#222222] overflow-hidden relative"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="bg-[#F5F5F5]/3 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#F5F5F5]/5 relative overflow-hidden group">
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
                    <div className="absolute inset-0 bg-[#F5F5F5]/10 rounded-full blur-2xl opacity-50 animate-pulse transition-all duration-500 group-hover:opacity-80 group-hover:blur-xl"></div>
                    <div className="relative z-10 p-4 bg-[#F5F5F5]/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-500 hover:bg-[#F5F5F5]/10 hover:border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-[#F5F5F5]/20">
                      <Image
                        src="/spry-finance-logo.png"
                        alt="Spry Finance Logo"
                        width={250}
                        height={250}
                        className="drop-shadow-2xl rounded-2xl transition-all duration-500 hover:drop-shadow-[0_0_30px_rgba(245,245,245,0.4)]"
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
                  <h2 className="text-3xl md:text-4xl font-medium text-white mb-6 drop-shadow-lg transition-all duration-500 hover:text-[#F5F5F5] hover:drop-shadow-[0_0_20px_rgba(245,245,245,0.6)]">
                    Our Philosophy
                  </h2>
                  <p className="text-lg text-[#F5F5F5]/90 leading-relaxed drop-shadow-sm transition-all duration-500 hover:text-[#F5F5F5] hover:drop-shadow-[0_0_15px_rgba(245,245,245,0.3)]">
                    We believe decentralized finance should be symbiotic.
                    Instead of fighting against market forces like impermanent
                    loss, we embrace them. Spry reimagines the relationship
                    between traders and liquidity providers, creating a balanced
                    ecosystem where volatility benefits those who provide
                    foundational liquidity. It's not just about returns; it's
                    about creating a more resilient and sustainable financial
                    future.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-[#1C1C1C] relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center bg-[#F5F5F5]/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl shadow-[#F5F5F5]/10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={itemVariants}
            >
              <h2 className="text-3xl md:text-5xl font-medium text-white mb-6 drop-shadow-lg">
                Ready to Grow with Spry?
              </h2>
              <p className="max-w-xl mx-auto text-[#F5F5F5]/70 mb-8">
                Join our ecosystem and experience a new, more sustainable
                approach to decentralized finance.
              </p>
              <div className="flex flex-col items-center gap-2">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 transition-all duration-300 scale-100 hover:scale-105 px-10 py-6 text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 border border-purple-400/20"
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
                <p className="text-sm text-[#F5F5F5]/50 mt-1">
                  Start Providing Liquidity
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1C1C1C] border-t border-white/10 py-8 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-[#F5F5F5]/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl shadow-[#F5F5F5]/5">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-[#F5F5F5]/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Image
                    src="/spry-finance-logo.png"
                    alt="Spry Finance Logo"
                    width={20}
                    height={20}
                    className="rounded-2xl"
                  />
                </div>
                <p className="text-sm text-[#F5F5F5]/60">
                  &copy; {new Date().getFullYear()} Spry Finance. All rights
                  reserved.
                </p>
              </div>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link
                  href="#"
                  className="text-sm text-[#F5F5F5]/60 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(245,245,245,0.6)]"
                  prefetch={false}
                >
                  Terms
                </Link>
                <Link
                  href="#"
                  className="text-sm text-[#F5F5F5]/60 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(245,245,245,0.6)]"
                  prefetch={false}
                >
                  Privacy
                </Link>
                <Link
                  href="https://spry.fi/deck"
                  className="text-sm text-[#F5F5F5]/60 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(245,245,245,0.6)]"
                  prefetch={false}
                >
                  Deck
                </Link>
              </div>
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
    className="bg-[#F5F5F5]/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:bg-[#F5F5F5]/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 shadow-xl shadow-[#F5F5F5]/5 hover:shadow-[#F5F5F5]/10 group"
    variants={itemVariants}
    whileHover={{ scale: 1.02 }}
  >
    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-medium text-white mb-2 drop-shadow-sm">
      {title}
    </h3>
    <p className="text-[#F5F5F5]/70 leading-relaxed">{description}</p>
  </motion.div>
);
