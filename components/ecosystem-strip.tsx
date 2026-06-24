"use client";

import { motion } from "framer-motion";
import { ShieldCheck, FlaskConical, ScrollText } from "lucide-react";

const BUILT_ON = ["Uniswap v4", "Unichain", "Base", "Ethereum", "Goldsky"];

const BADGES = [
  { icon: ScrollText, label: "GPL-3.0" },
  { icon: FlaskConical, label: "264 tests passing" },
  { icon: ShieldCheck, label: "Pre-audit" },
];

/**
 * Low-key "Built on" trust strip: technology wordmarks at low opacity that
 * brighten on hover, framed by masked hairline dividers, plus credibility
 * badges. Design treatment adapted from a 21st.dev logo-cloud pattern.
 */
export default function EcosystemStrip() {
  return (
    <section className="relative bg-spry-ink py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-spry-fog/40">
            Built on open infrastructure
          </p>

          {/* Masked hairline + wordmarks */}
          <div className="mx-auto h-px max-w-sm bg-white/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-7 sm:gap-x-12">
            {BUILT_ON.map((name) => (
              <span
                key={name}
                className="font-display text-lg font-medium tracking-tight text-spry-fog/35 transition-colors duration-300 hover:text-spry-fog/90 md:text-xl"
              >
                {name}
              </span>
            ))}
          </div>
          <div className="mx-auto h-px max-w-sm bg-white/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

          {/* Trust badges */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {BADGES.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-spry-fog/5 px-3.5 py-1.5 text-xs text-spry-fog/70"
              >
                <badge.icon className="h-3.5 w-3.5 text-spry-mint/80" />
                {badge.label}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm text-spry-fog/45">
            Deployed and verified on Unichain Sepolia and Base Sepolia.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
