"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/* -------------------------------------------------------------------------- */
/*  Fee model: a faithful port of the Spry contract's per-tier fee curve.     */
/*                                                                            */
/*  Source of truth: spry-contracts SpryHook._tierParams + SmartFeeLib.       */
/*  Each tier has its OWN zone boundaries and OWN cap (0.50% to 9.90%), so    */
/*  the five curves are genuinely different, not one shared shape.            */
/*                                                                            */
/*  Units: `delta` is per-mille of pool reserves (the contract's unit). The   */
/*  x-axis here is cumulative price impact in percent, where impact% =         */
/*  delta / 10. Fees are V4 pips (1_000_000 = 100%); fee% = pips / 10_000.     */
/* -------------------------------------------------------------------------- */

type ZoneId = "safe" | "alert" | "danger" | "cap";

interface Tier {
  id: string;
  name: string;
  tick: number;
  dot: string;
  /** safe-zone (base) fee, percent */
  base: number;
  /** cap fee, percent */
  cap: number;
  // Contract zone boundaries, in per-mille reserve delta (positive side).
  safeHigh: number;
  alertHigh: number;
  dangerHigh: number;
  // Linear (alert) coefficients: fee_pips = (aRight * delta + 1000 * bRight) / 1e6
  aRight: number;
  bRight: number;
  // Exponential (danger) coefficients, 1e18-scaled:
  //   fee_pips = (aRightExp / 1e18) * exp((bRightExp / 1e18) * delta / 1000)
  aRightExp: number;
  bRightExp: number;
}

const FEE_CAP_MAX = 9.9; // global y-axis ceiling (Exotic's cap), percent
// x-axis ceiling. The contract's danger zone runs to 500% cumulative impact
// (dangerHigh = 5000 per-mille), where the fee steps up to the flat cap.
// Showing 0-600% lets each curve climb its full four-zone path and then
// plateau at its own cap.
const MAX_IMPACT = 600;
const DEFAULT_TIER_ID = "blue";

// Brand escalation: mint -> violet -> plum -> grape, plus a light grape for the
// fifth tier so all five remain distinguishable.
const TIERS: Tier[] = [
  {
    id: "stable",
    name: "Stable",
    tick: 1,
    dot: "#86EFAC",
    base: 0.01,
    cap: 0.5,
    safeHigh: 500,
    alertHigh: 1500,
    dangerHigh: 5000,
    aRight: 400000,
    bRight: -100000,
    aRightExp: 250848455340571262976,
    bRightExp: 459839403552600128,
  },
  {
    id: "like",
    name: "Like-Asset",
    tick: 10,
    dot: "#8936FF",
    base: 0.05,
    cap: 1.0,
    safeHigh: 400,
    alertHigh: 1200,
    dangerHigh: 5000,
    aRight: 1875000,
    bRight: -250000,
    aRightExp: 1497492754575049359360,
    bRightExp: 241129139966882912,
  },
  {
    id: "blue",
    name: "Blue-Chip",
    tick: 60,
    dot: "#6B21D8",
    base: 0.3,
    cap: 5.5,
    safeHigh: 334,
    alertHigh: 1000,
    dangerHigh: 5000,
    aRight: 25525525,
    bRight: -5525525,
    aRightExp: 15905414575956300922880,
    bRightExp: 229072682968538784,
  },
  {
    id: "volatile",
    name: "Volatile",
    tick: 200,
    dot: "#A900FF",
    base: 0.5,
    cap: 9.0,
    safeHigh: 200,
    alertHigh: 600,
    dangerHigh: 5000,
    aRight: 62500000,
    bRight: -7500000,
    aRightExp: 26476264318162022957056,
    bRightExp: 208247893607762528,
  },
  {
    id: "exotic",
    name: "Exotic",
    tick: 1000,
    dot: "#C77DFF",
    base: 1.0,
    cap: 9.9,
    safeHigh: 100,
    alertHigh: 400,
    dangerHigh: 5000,
    aRight: 133333330,
    bRight: -3333332,
    aRightExp: 47285780377453805436928,
    bRightExp: 139533453515737984,
  },
];

const ZONE_COLOR: Record<ZoneId, string> = {
  safe: "#86EFAC",
  alert: "#8936FF",
  danger: "#A900FF",
  cap: "#C77DFF",
};

const ZONE_LABEL: Record<ZoneId, string> = {
  safe: "Safe",
  alert: "Alert",
  danger: "Danger",
  cap: "Cap",
};

/**
 * Marginal fee (percent) at a cumulative price impact (percent) for a tier.
 * Exact piecewise port of SmartFeeLib._feeForDelta on the positive side.
 */
function feePct(impactPct: number, t: Tier): number {
  const delta = Math.max(0, impactPct) * 10; // back to the contract's per-mille
  let pips: number;
  if (delta <= t.safeHigh) {
    pips = t.base * 10000;
  } else if (delta <= t.alertHigh) {
    pips = (t.aRight * delta + 1000 * t.bRight) / 1_000_000;
  } else if (delta <= t.dangerHigh) {
    pips = (t.aRightExp / 1e18) * Math.exp((t.bRightExp / 1e18) * (delta / 1000));
  } else {
    pips = t.cap * 10000;
  }
  return pips / 10000;
}

/**
 * Effective (average) fee paid = integral of the marginal curve from 0 to
 * impact, divided by impact. Basis for the LP premium; keeps the
 * path-independence story honest. Trapezoid over a fixed grid.
 */
function effectiveFee(impactPct: number, t: Tier): number {
  const x = clampImpact(impactPct);
  if (x <= t.safeHigh / 10) return t.base;
  const steps = 64;
  const dx = x / steps;
  let area = 0;
  let prev = feePct(0, t);
  for (let i = 1; i <= steps; i++) {
    const cur = feePct(i * dx, t);
    area += ((prev + cur) / 2) * dx;
    prev = cur;
  }
  return area / x;
}

function zoneIdAt(impactPct: number, t: Tier): ZoneId {
  const x = clampImpact(impactPct);
  if (x <= t.safeHigh / 10) return "safe";
  if (x <= t.alertHigh / 10) return "alert";
  if (x <= t.dangerHigh / 10) return "danger";
  return "cap";
}

const fmtPct = (v: number, dp = 2) => `${v.toFixed(dp)}%`;
const fmtImpact = (v: number) => `${v.toFixed(0)}%`;
const clampImpact = (v: number) => Math.max(0, Math.min(MAX_IMPACT, v));

// Recharts hands back its (inset-aware) chart state on mouse events. We only
// read the active x value; typed loosely since recharts doesn't export it.
interface ChartMouseState {
  activeLabel?: number | string;
  isTooltipActive?: boolean;
}

interface CurveRow {
  x: number;
  [tierId: string]: number;
}

// One dataset carrying every tier's curve, so we can draw the full fan with the
// selected tier highlighted. Static: depends on nothing.
const CURVE_DATA: CurveRow[] = (() => {
  const steps = 140;
  const rows: CurveRow[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * MAX_IMPACT;
    const row: CurveRow = { x };
    for (const t of TIERS) row[t.id] = feePct(x, t);
    rows.push(row);
  }
  return rows;
})();

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function SpryFeeCurve() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  const uid = useId().replace(/:/g, "");
  const fillId = `spryFeeFill-${uid}`;
  const strokeId = `spryFeeStroke-${uid}`;

  const [tierId, setTierId] = useState<string>(DEFAULT_TIER_ID);
  const [impact, setImpact] = useState<number>(180);
  const [dragging, setDragging] = useState(false);

  const tier = useMemo(
    () => TIERS.find((t) => t.id === tierId) ?? TIERS[0],
    [tierId],
  );

  // Per-tier zone definitions (x-boundaries in % impact) plus the fee at each
  // zone edge, so the legend doubles as the tier's fee breakdown.
  const zones = useMemo(() => {
    const safeHighPct = tier.safeHigh / 10;
    const alertHighPct = tier.alertHigh / 10;
    return [
      { id: "safe" as ZoneId, from: 0, to: safeHighPct, fee: tier.base },
      {
        id: "alert" as ZoneId,
        from: safeHighPct,
        to: alertHighPct,
        fee: feePct(alertHighPct, tier),
      },
      {
        id: "danger" as ZoneId,
        from: alertHighPct,
        to: tier.dangerHigh / 10,
        fee: feePct(tier.dangerHigh / 10, tier),
      },
      {
        id: "cap" as ZoneId,
        from: tier.dangerHigh / 10,
        to: MAX_IMPACT,
        fee: tier.cap,
      },
    ];
  }, [tier]);

  const currentFee = useMemo(() => feePct(impact, tier), [impact, tier]);
  const effective = useMemo(() => effectiveFee(impact, tier), [impact, tier]);
  const activeZoneId = useMemo(() => zoneIdAt(impact, tier), [impact, tier]);
  const activeColor = ZONE_COLOR[activeZoneId];
  const lpPremium = Math.max(0, effective - tier.base);

  const handleChartMove = useCallback(
    (state: ChartMouseState | null | undefined, captured: boolean) => {
      if (!state || !captured) return;
      const raw = state.activeLabel;
      const x = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(x)) return;
      setImpact(clampImpact(x));
    },
    [],
  );

  const onChartKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const big = 10;
      const small = 2;
      let next: number | null = null;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = impact + (e.shiftKey ? big : small);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = impact - (e.shiftKey ? big : small);
          break;
        case "PageUp":
          next = impact + big;
          break;
        case "PageDown":
          next = impact - big;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = MAX_IMPACT;
          break;
        default:
          return;
      }
      e.preventDefault();
      setImpact(clampImpact(next));
    },
    [impact],
  );

  const onTierKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const idx = TIERS.findIndex((t) => t.id === tierId);
      if (idx < 0) return;
      let nextIdx: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIdx = (idx + 1) % TIERS.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextIdx = (idx - 1 + TIERS.length) % TIERS.length;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = TIERS.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      setTierId(TIERS[nextIdx].id);
    },
    [tierId],
  );

  const valueText = `${fmtImpact(impact)} cumulative impact, ${fmtPct(
    currentFee,
  )} marginal fee on ${tier.name}, ${ZONE_LABEL[activeZoneId]} zone`;

  const cssVars = { "--zone-active": activeColor } as CSSProperties;

  return (
    <section
      id="fee-curve"
      ref={sectionRef}
      className="relative scroll-mt-24 bg-spry-ink py-20 md:py-28"
      style={cssVars}
      aria-label="Spry dynamic-fee curve"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Heading */}
        <motion.div
          className="mb-12 text-center"
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={inView || !animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-spry-mint/90">
            The Fee Curve
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white drop-shadow-lg md:text-4xl">
            Fees that scale with{" "}
            <span className="bg-gradient-to-r from-spry-mint via-spry-violet to-spry-grape bg-clip-text text-transparent">
              price impact
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-spry-fog/70">
            Every pool tier prices impact differently. Pick a tier, then drag the
            terminal or slider to watch the marginal fee climb a four-zone curve
            from the tier&apos;s base fee toward its own cap, from 0.50% on
            Stable pools up to 9.90% on Exotic ones.
          </p>
        </motion.div>

        {/* Terminal panel */}
        <motion.div
          className="overflow-hidden rounded-3xl border border-white/10 bg-spry-fog/5 shadow-xl shadow-spry-violet/5 backdrop-blur-xl"
          initial={animate ? { opacity: 0, y: 24 } : false}
          animate={inView || !animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          {/* Terminal title bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-spry-coal/60 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-spry-mint/70" />
              </span>
              <span className="spry-mono text-xs tracking-wider text-spry-fog/60">
                spry@hook:~/fee-engine
              </span>
            </div>
            <div className="spry-mono flex items-center gap-2 text-[11px] uppercase tracking-wider text-spry-fog/50">
              <span className="relative flex h-2 w-2">
                {animate && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spry-mint opacity-60" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-spry-mint" />
              </span>
              interactive model
            </div>
          </div>

          {/* Tier selector row (real radiogroup with roving focus) */}
          <div
            className="flex items-stretch gap-2 overflow-x-auto border-b border-white/10 px-4 py-3"
            role="radiogroup"
            aria-label="Fee tier"
            onKeyDown={onTierKeyDown}
          >
            {TIERS.map((t) => {
              const active = t.id === tier.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setTierId(t.id)}
                  className={[
                    "group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-spry-mint/60",
                    active
                      ? "border-white/25 bg-spry-fog/10"
                      : "border-white/10 bg-spry-ink/40 hover:border-white/20 hover:bg-spry-fog/5",
                  ].join(" ")}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: t.dot,
                      boxShadow: active ? `0 0 10px ${t.dot}` : "none",
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span
                      className={[
                        "block text-xs font-medium leading-tight",
                        active ? "text-white" : "text-spry-fog/80",
                      ].join(" ")}
                    >
                      {t.name}
                    </span>
                    <span className="spry-mono block text-[10px] leading-tight text-spry-fog/40">
                      tick {t.tick} · {fmtPct(t.cap, t.cap < 1 ? 2 : 1)} cap
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Body: chart + readout */}
          <div className="grid gap-0 lg:grid-cols-[1.6fr_1fr]">
            {/* Chart */}
            <div className="border-b border-white/10 p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div
                role="slider"
                tabIndex={0}
                aria-label="Cumulative in-block price impact"
                aria-valuemin={0}
                aria-valuemax={MAX_IMPACT}
                aria-valuenow={Number(impact.toFixed(0))}
                aria-valuetext={valueText}
                onKeyDown={onChartKeyDown}
                onPointerUp={() => setDragging(false)}
                onPointerLeave={() => setDragging(false)}
                className="relative cursor-crosshair select-none rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-spry-mint/60"
                style={{ touchAction: "pan-y" }}
              >
                <ResponsiveContainer width="100%" height={340}>
                  <ComposedChart
                    data={CURVE_DATA}
                    margin={{ top: 16, right: 12, bottom: 8, left: -8 }}
                    onMouseMove={(state: ChartMouseState) =>
                      handleChartMove(state, dragging)
                    }
                    onMouseDown={(state: ChartMouseState) => {
                      setDragging(true);
                      handleChartMove(state, true);
                    }}
                    onMouseUp={() => setDragging(false)}
                  >
                    <defs>
                      <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#86EFAC" stopOpacity={0.26} />
                        <stop offset="45%" stopColor="#8936FF" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#A900FF" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#86EFAC" />
                        <stop offset="45%" stopColor="#8936FF" />
                        <stop offset="100%" stopColor="#A900FF" />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#ffffff"
                      strokeOpacity={0.06}
                      vertical={false}
                    />

                    {/* Zone shading for the selected tier */}
                    {zones.map((z) => (
                      <ReferenceArea
                        key={z.id}
                        x1={z.from}
                        x2={z.to}
                        fill={ZONE_COLOR[z.id]}
                        fillOpacity={z.id === activeZoneId ? 0.12 : 0.05}
                        stroke="none"
                        ifOverflow="extendDomain"
                      />
                    ))}

                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={[0, MAX_IMPACT]}
                      ticks={[0, 150, 300, 450, 600]}
                      tickFormatter={(v: number) => `${v}%`}
                      tick={{ fill: "#F5F5F5", fillOpacity: 0.45, fontSize: 11 }}
                      stroke="#ffffff"
                      strokeOpacity={0.12}
                      tickLine={false}
                      label={{
                        value: "cumulative in-block price impact",
                        position: "insideBottom",
                        offset: -4,
                        fill: "#F5F5F5",
                        fillOpacity: 0.35,
                        fontSize: 10,
                      }}
                    />
                    <YAxis
                      type="number"
                      domain={[0, FEE_CAP_MAX]}
                      ticks={[0, 2.5, 5, 7.5, FEE_CAP_MAX]}
                      tickFormatter={(v: number) => `${v}%`}
                      tick={{ fill: "#F5F5F5", fillOpacity: 0.45, fontSize: 11 }}
                      stroke="#ffffff"
                      strokeOpacity={0.12}
                      tickLine={false}
                      width={44}
                    />

                    {/* Faint fan: every other tier's curve for context */}
                    {TIERS.filter((t) => t.id !== tier.id).map((t) => (
                      <Line
                        key={t.id}
                        type="monotone"
                        dataKey={t.id}
                        stroke={t.dot}
                        strokeWidth={1.25}
                        strokeOpacity={0.22}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                      />
                    ))}

                    {/* Selected tier's cap line */}
                    <ReferenceLine
                      y={tier.cap}
                      stroke={tier.dot}
                      strokeDasharray="4 4"
                      strokeOpacity={0.55}
                      label={{
                        value: `${fmtPct(tier.cap, tier.cap < 1 ? 2 : 1)} cap`,
                        position: "insideTopRight",
                        fill: tier.dot,
                        fontSize: 10,
                        opacity: 0.9,
                      }}
                    />
                    {/* Selected tier's base line */}
                    <ReferenceLine
                      y={tier.base}
                      stroke="#86EFAC"
                      strokeDasharray="2 4"
                      strokeOpacity={0.4}
                    />

                    {/* Selected tier's curve, highlighted */}
                    <Area
                      type="monotone"
                      dataKey={tier.id}
                      stroke={`url(#${strokeId})`}
                      strokeWidth={2.75}
                      fill={`url(#${fillId})`}
                      isAnimationActive={animate && inView}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      dot={false}
                      activeDot={false}
                    />

                    {/* Current-impact crosshair + marker */}
                    <ReferenceLine
                      x={impact}
                      stroke={activeColor}
                      strokeWidth={1.5}
                      strokeOpacity={0.85}
                    />
                    <ReferenceDot
                      x={impact}
                      y={currentFee}
                      r={5}
                      fill={activeColor}
                      stroke="#1C1C1C"
                      strokeWidth={2}
                      isFront
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                {/* Zone legend = the selected tier's four fee levels */}
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {zones.map((z) => {
                    const active = z.id === activeZoneId;
                    return (
                      <div
                        key={z.id}
                        className={[
                          "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 transition-colors duration-300",
                          active
                            ? "border-white/25 bg-spry-fog/10"
                            : "border-white/5 bg-transparent",
                        ].join(" ")}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: ZONE_COLOR[z.id] }}
                            aria-hidden
                          />
                          <span
                            className={[
                              "spry-mono text-[11px] uppercase tracking-wide",
                              active ? "text-white" : "text-spry-fog/50",
                            ].join(" ")}
                          >
                            {ZONE_LABEL[z.id]}
                          </span>
                        </span>
                        <span
                          className={[
                            "spry-mono text-[11px] tabular-nums",
                            active ? "text-white" : "text-spry-fog/40",
                          ].join(" ")}
                        >
                          {fmtPct(z.fee, z.fee < 1 ? 2 : 1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Readout panel */}
            <div
              className="flex flex-col gap-5 p-5 sm:p-6"
              aria-live="polite"
              aria-atomic="true"
            >
              {/* Marginal fee big readout */}
              <div className="rounded-2xl border border-white/10 bg-spry-ink/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="spry-mono text-[11px] uppercase tracking-wider text-spry-fog/50">
                    {tier.name} marginal fee
                  </span>
                  <span
                    className="spry-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider"
                    style={{
                      color: activeColor,
                      borderColor: `${activeColor}66`,
                      backgroundColor: `${activeColor}14`,
                    }}
                  >
                    <Activity className="h-3 w-3" />
                    {ZONE_LABEL[activeZoneId]} zone
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className="font-display text-5xl font-semibold tabular-nums tracking-tight text-white transition-colors duration-200"
                    style={{ textShadow: `0 0 24px ${activeColor}55` }}
                  >
                    {fmtPct(currentFee)}
                  </span>
                  <span className="spry-mono text-xs text-spry-fog/40">
                    of {fmtPct(tier.cap, tier.cap < 1 ? 2 : 1)} cap
                  </span>
                </div>

                {/* Fill bar toward this tier's cap */}
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-[width] duration-200 ease-out"
                    style={{
                      width: `${Math.min(100, (currentFee / tier.cap) * 100)}%`,
                      background: `linear-gradient(90deg, #86EFAC, ${activeColor})`,
                    }}
                  />
                </div>
              </div>

              {/* Slider (mirrors the chart) */}
              <div>
                <div className="spry-mono mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-spry-fog/50">
                  <span>cumulative impact</span>
                  <span className="tabular-nums text-spry-fog/80">
                    {fmtImpact(impact)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={MAX_IMPACT}
                  step={1}
                  value={impact}
                  onChange={(e) => setImpact(clampImpact(Number(e.target.value)))}
                  aria-label="Cumulative in-block price impact"
                  aria-valuetext={valueText}
                  className="spry-fee-range w-full"
                  style={
                    {
                      "--fill": `${(impact / MAX_IMPACT) * 100}%`,
                      "--thumb": activeColor,
                    } as CSSProperties
                  }
                />
                <div className="spry-mono mt-1.5 flex justify-between text-[10px] text-spry-fog/35">
                  <span>small swap</span>
                  <span>arbitrage-sized</span>
                </div>
              </div>

              {/* Stat rows */}
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="tier base"
                  value={fmtPct(tier.base, tier.base < 1 ? 2 : 1)}
                  hint={`tick ${tier.tick}`}
                />
                <Stat
                  label="effective fee"
                  value={fmtPct(effective)}
                  hint="integral / impact"
                  accent
                />
              </div>

              {/* LP premium callout */}
              <div className="rounded-2xl border border-spry-mint/20 bg-spry-mint/5 p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-spry-mint/15">
                    <ShieldCheck className="h-4 w-4 text-spry-mint" />
                  </span>
                  <span className="spry-mono text-[11px] uppercase tracking-wider text-spry-mint/90">
                    to liquidity providers
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-spry-fog/70">
                  {lpPremium <= 0.0005 ? (
                    <>
                      This swap sits in the safe zone, so it pays the flat base
                      fee. Routine flow trades cheaply.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold tabular-nums text-white">
                        +{fmtPct(lpPremium)}
                      </span>{" "}
                      above the tier base is the impact premium this swap pays.
                      The excess accrues to LPs through the v4 fee channel,
                      offsetting impermanent loss.
                    </>
                  )}
                </p>
              </div>

              <p className="spry-mono flex items-start gap-2 text-[11px] leading-relaxed text-spry-fog/40">
                <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-spry-violet/70" />
                The fee paid is the integral of this curve over the block&apos;s
                impact path, so splitting one big swap into many small ones never
                costs less. Path-independent and MEV-resistant.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          initial={animate ? { opacity: 0, y: 16 } : false}
          animate={inView || !animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
        >
          <Button
            asChild
            size="lg"
            className="border border-white/10 bg-gradient-to-r from-spry-violet to-spry-plum text-white shadow-2xl shadow-spry-violet/30 transition-all duration-300 hover:from-spry-grape hover:to-spry-violet hover:shadow-spry-violet/50"
          >
            <a href="https://app.spry.fi" target="_blank" rel="noopener noreferrer">
              Try a Spry pool on testnet
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <span className="spry-mono text-xs text-spry-fog/40">
            testnet-only · 264 tests · GPL-3.0 · pre-audit
          </span>
        </motion.div>
      </div>

      {/* Scoped styles: monospace stack + themed range input. */}
      <style>{`
        #fee-curve .spry-mono {
          font-family: var(--font-mono, ui-monospace, "SFMono-Regular",
            "JetBrains Mono", "Space Mono", Menlo, Consolas, monospace);
          font-feature-settings: "tnum" 1;
        }
        #fee-curve .spry-fee-range {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 9999px;
          outline: none;
          background: linear-gradient(
            90deg,
            var(--thumb) 0%,
            var(--thumb) var(--fill),
            rgba(245, 245, 245, 0.1) var(--fill),
            rgba(245, 245, 245, 0.1) 100%
          );
        }
        #fee-curve .spry-fee-range:focus-visible {
          box-shadow: 0 0 0 2px rgba(134, 239, 172, 0.5);
        }
        #fee-curve .spry-fee-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: var(--thumb);
          border: 3px solid #1c1c1c;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 14px var(--thumb);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        #fee-curve .spry-fee-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        #fee-curve .spry-fee-range::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: var(--thumb);
          border: 3px solid #1c1c1c;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 14px var(--thumb);
          cursor: pointer;
        }
        #fee-curve .spry-fee-range::-moz-range-track {
          height: 6px;
          border-radius: 9999px;
          background: transparent;
        }
        @media (prefers-reduced-motion: reduce) {
          #fee-curve .spry-fee-range::-webkit-slider-thumb { transition: none; }
        }
      `}</style>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-spry-ink/40 px-3 py-2.5">
      <p className="spry-mono text-[10px] uppercase tracking-wider text-spry-fog/40">
        {label}
      </p>
      <p
        className={[
          "mt-0.5 font-display text-lg font-semibold tabular-nums",
          accent ? "text-spry-mint" : "text-white",
        ].join(" ")}
      >
        {value}
      </p>
      {hint ? (
        <p className="spry-mono text-[10px] text-spry-fog/35">{hint}</p>
      ) : null}
    </div>
  );
}
