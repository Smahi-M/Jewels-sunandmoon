"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const map = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

// Deterministic PRNG (Park-Miller) so server and client render the same particles.
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r = (a: number, b: number) => +(a + rnd() * (b - a)).toFixed(2);
// Position + size + animation vars (--o base opacity, --d duration, --delay) for one particle.
const particle = (x: number, y: number, size: number, o: number, d: [number, number], delay: number) =>
  ({
    left: `${x}%`,
    top: `${y}%`,
    width: size,
    height: size,
    "--o": o,
    "--d": `${r(...d)}s`,
    "--delay": `${r(0, delay)}s`,
  }) as CSSProperties;

const STARS = Array.from({ length: 46 }, (_, i) => {
  const big = i % 9 === 0;
  return {
    big,
    style: particle(r(0, 100), r(0, 100), big ? 2.4 : r(0.8, 1.8), big ? 0.95 : r(0.22, 0.85), [2.5, 6], 5),
  };
});
const NIGHT_SPARKS = Array.from({ length: 5 }, () => particle(r(6, 90), r(6, 92), Math.round(r(10, 16)), r(0.7, 1), [6, 8], 5));

// Day side: thin out the frontier (sun zone) and the area under "Soleil" to keep air around them.
const airy = (x: number, y: number) => (x < 25 && y > 22 && y < 78) || (x > 22 && x < 78 && y < 26);
const spot = (): [number, number] => {
  for (;;) {
    const x = r(2, 98), y = r(2, 98);
    if (!airy(x, y) || rnd() < 0.3) return [x, y];
  }
};
const DUST = Array.from({ length: 40 }, () => ({
  ...particle(...spot(), r(1.5, 3.5), r(0.45, 0.9), [6, 11], 6),
  "--dx": `${r(-4, 4)}px`,
}) as CSSProperties);
const DAY_SPARKS = Array.from({ length: 5 }, () => particle(...spot(), Math.round(r(10, 16)), r(0.75, 1), [6, 8], 5));

const PARTICLE = "absolute opacity-(--o) will-change-[transform,opacity]";

function Spark({ style, gold }: { style: CSSProperties; gold?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      style={style}
      className={`${PARTICLE} motion-safe:animate-sparkle ${
        gold
          ? "fill-[url(#orlea-gold)] drop-shadow-[0_0_3px_rgba(232,176,72,.75)]"
          : "fill-white drop-shadow-[0_0_3px_rgba(185,205,255,.85)]"
      }`}
    >
      <path d="M8 0L8.6 8 8 16 7.4 8Z" />
      <path d="M0 8L8 7.4 16 8 8 8.6Z" />
    </svg>
  );
}

const SKY: CSSProperties = { background: "radial-gradient(ellipse at 100% 50%, #15161B 0%, #0B0B0C 60%)" };
const CHAMPAGNE: CSSProperties = {
  background:
    "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,.12), transparent 50%, rgba(0,0,0,.12)), #C8AB74",
};
const WORD = "absolute left-1/2 top-[max(48px,11svh)] -translate-x-1/2 whitespace-nowrap px-[.2em] font-script text-[clamp(40px,6vw,84px)] leading-[1.3]";
// Blurred solid copy behind the word; only its opacity breathes (--o → --to over --d).
const GLOW = `${WORD} blur-[14px] opacity-(--o) will-change-[opacity] motion-safe:animate-breathe`;
const SUN_SIZES = "(min-width: 1024px) 480px, 85vw";
const MOON_SIZES = "(min-width: 1024px) 400px, 70vw";

type LogoMotion = {
  wrap?: { opacity: MotionValue<number>; transform: MotionValue<string> };
  rule?: MotionValue<string>;
  tagline?: MotionValue<number>;
};

function Logo({ wrap, rule, tagline }: LogoMotion) {
  return (
    <motion.div
      style={wrap}
      className="flex flex-col items-center gap-[18px] text-center [--logo:clamp(40px,9.5vw,120px)]"
    >
      <h1 className="flex flex-col items-center gap-[18px]">
        <span className="pl-[.34em] font-serif text-(length:--logo) leading-none font-light tracking-[.34em] text-[#1A1712] uppercase">
          Orléa
        </span>{" "}
        <span className="font-sans text-[10px] leading-none font-medium tracking-[.7em] text-[#5A4422] uppercase">
          Jewels
        </span>
      </h1>
      <motion.div style={{ transform: rule }} className="h-px w-[72px] bg-[#5A4422]" />
      <motion.p
        style={{ opacity: tagline }}
        className="font-serif text-[max(17px,calc(var(--logo)*0.26))] font-light text-[#1A1712] italic"
      >
        Collection Lune &amp; Soleil
      </motion.p>
    </motion.div>
  );
}

export default function HeroScene() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const e = (v: number) => ease(map(v, 0.05, 0.6));
  const t3 = (v: number) => ease(map(v, 0.3, 0.7));

  const leftPanel = useTransform(p, (v) => `translateX(${-100 * e(v)}%)`);
  const rightPanel = useTransform(p, (v) => `translateX(${100 * e(v)}%)`);
  const moon = useTransform(
    p,
    (v) => `translateX(calc(${-e(v)} * (50vw + var(--M) * 0.7))) rotate(${-10 * e(v)}deg)`,
  );
  const sun = useTransform(
    p,
    (v) => `translateX(calc(${e(v)} * (50vw + var(--M) * 0.75))) rotate(${35 * e(v)}deg)`,
  );
  const logoOpacity = useTransform(p, t3);
  const logoTransform = useTransform(p, (v) => `translateY(${(1 - t3(v)) * 14}px) scale(${1.05 - 0.05 * t3(v)})`);
  const rule = useTransform(p, (v) => `scaleX(${ease(map(v, 0.48, 0.8))})`);
  const tagline = useTransform(p, (v) => map(v, 0.58, 0.86));
  const hint = useTransform(p, (v) => 1 - map(v, 0, 0.05));

  return (
    <>
      <section ref={ref} data-hero className="relative h-[300svh] motion-reduce:hidden">
        <div
          style={CHAMPAGNE}
          className="sticky top-0 grid h-svh place-items-center overflow-hidden [--M:clamp(240px,min(66vw,40svh),400px)]"
        >
          <Logo wrap={{ opacity: logoOpacity, transform: logoTransform }} rule={rule} tagline={tagline} />

          <motion.div
            style={{ ...SKY, transform: leftPanel }}
            className="absolute inset-y-0 left-0 w-1/2 border-r border-[rgba(196,202,212,.35)] will-change-transform"
          >
            {STARS.map((s, i) => (
              <span
                key={i}
                className={`${PARTICLE} rounded-full bg-[#EEF2FF] motion-safe:animate-twinkle ${
                  s.big ? "shadow-[0_0_9px_2px_rgba(210,225,255,.6)]" : "shadow-[0_0_4px_1px_rgba(200,215,255,.45)]"
                }`}
                style={s.style}
              />
            ))}
            {NIGHT_SPARKS.map((s, i) => (
              <Spark key={i} style={s} />
            ))}
            <span aria-hidden className={`${GLOW} text-[#DCE6FF]`} style={{ "--o": 0.3, "--to": 0.65, "--d": "5s" } as CSSProperties}>
              Lune
            </span>
            <span
              aria-hidden
              className={`${WORD} bg-[linear-gradient(180deg,#FFFFFF,#D5DAE2_45%,#8F97A4)] bg-clip-text text-transparent [filter:drop-shadow(0_0_2px_rgba(255,255,255,.55))_drop-shadow(0_0_12px_rgba(185,205,255,.35))]`}
            >
              Lune
            </span>
          </motion.div>

          <motion.div
            style={{ transform: rightPanel }}
            className="absolute inset-y-0 right-0 w-1/2 border-l border-[rgba(201,174,120,.6)] bg-[#EFEBE2] will-change-transform"
          >
            <svg aria-hidden className="absolute size-0">
              <linearGradient id="orlea-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#C9922B" />
                <stop offset="1" stopColor="#F2C35E" />
              </linearGradient>
            </svg>
            {DUST.map((s, i) => (
              <span
                key={i}
                className={`${PARTICLE} rounded-full bg-[radial-gradient(circle,#FFE9B0_0%,#D9A441_55%,transparent_72%)] shadow-[0_0_6px_1px_rgba(214,160,52,.4)] motion-safe:animate-drift`}
                style={s}
              />
            ))}
            {DAY_SPARKS.map((s, i) => (
              <Spark key={i} style={s} gold />
            ))}
            <span aria-hidden className={`${GLOW} text-[#F2C35E]`} style={{ "--o": 0.3, "--to": 0.6, "--d": "4s" } as CSSProperties}>
              Soleil
            </span>
            <span
              aria-hidden
              className={`${WORD} bg-[linear-gradient(180deg,#E9C46A,#C1953F_50%,#8E651C)] bg-clip-text text-transparent [filter:drop-shadow(0_0_1px_rgba(255,236,190,.8))_drop-shadow(0_0_12px_rgba(232,176,72,.45))]`}
            >
              Soleil
            </span>
          </motion.div>

          <div className="absolute top-1/2 left-1/2 size-[calc(var(--M)*1.19)] -translate-1/2">
            <motion.div
              style={{ transform: sun }}
              className="relative size-full drop-shadow-[0_10px_24px_rgba(90,60,10,.28)] will-change-transform"
            >
              <Image src="/images/sun.webp" alt="" aria-hidden fill priority quality={90} sizes={SUN_SIZES} className="object-contain" />
            </motion.div>
          </div>

          <div className="absolute top-[calc(50%+var(--M)*0.008)] left-[calc(50%-var(--M)*0.096)] size-[calc(var(--M)*0.979)] -translate-1/2">
            <motion.div
              style={{ transform: moon }}
              className="relative size-full drop-shadow-[0_12px_28px_rgba(0,0,0,.45)] will-change-transform"
            >
              <Image src="/images/moon.webp" alt="" aria-hidden fill priority quality={90} sizes={MOON_SIZES} className="object-contain" />
            </motion.div>
          </div>

          <motion.div
            style={{ opacity: hint }}
            className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[10px] tracking-[.4em] text-white uppercase mix-blend-difference"
          >
            <span className="pl-[.4em]">Faire défiler</span>
            <span className="h-10 w-px bg-white" />
          </motion.div>
        </div>
      </section>

      {/* Reduced motion: final state, static moon/sun duo above the logo. */}
      <section data-hero
        style={CHAMPAGNE}
        className="hidden min-h-svh flex-col items-center justify-center gap-10 px-4 py-16 [--M:clamp(180px,min(50vw,34svh),340px)] motion-reduce:flex"
      >
        <div className="relative size-[calc(var(--M)*1.19)]">
          <Image src="/images/sun.webp" alt="" aria-hidden fill quality={90} sizes={SUN_SIZES} className="object-contain drop-shadow-[0_10px_24px_rgba(90,60,10,.28)]" />
          <div className="absolute top-[calc(50%+var(--M)*0.008)] left-[calc(50%-var(--M)*0.096)] size-[calc(var(--M)*0.979)] -translate-1/2">
            <Image src="/images/moon.webp" alt="" aria-hidden fill quality={90} sizes={MOON_SIZES} className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,.45)]" />
          </div>
        </div>
        <Logo />
      </section>
    </>
  );
}
