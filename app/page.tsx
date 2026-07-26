"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import GlitchOverlay from "@/components/GlitchOverlay";
import ScrambleText from "@/components/ScrambleText";
import HudFrame from "@/components/HudFrame";

const ArcadeScene = dynamic(() => import("@/components/ArcadeScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0610] flex items-center justify-center">
      <div
        className="text-[8px] text-[#ffe644] tracking-[0.4em] uppercase animate-pulse"
        style={{ fontFamily: "var(--font-press-start)" }}
      >
        Loading...
      </div>
    </div>
  ),
});

function TickingScore({ target, delay }: { target: number; delay: number }) {
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setScore((s) => {
        if (s >= target) {
          clearInterval(interval);
          return target;
        }
        return s + Math.ceil(Math.random() * 137);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [started, target]);

  return <>{String(Math.min(score, target)).padStart(6, "0")}</>;
}

function AnimatedBar({ color, delay }: { color: string; delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setWidth((w) => {
          if (w >= 100) { clearInterval(interval); return 100; }
          return w + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="w-16 sm:w-20 md:w-28 h-[4px] bg-[#1a0f2e] border border-[#2a1848]/50 overflow-hidden">
      <div
        className="h-full transition-all duration-75"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative h-[100dvh] min-h-[500px] overflow-hidden bg-[#0a0610]">
      {/* === 3D ARCADE SCENE === */}
      <div className="absolute inset-0 z-0">
        <ArcadeScene />
      </div>

      {/* === HUD OVERLAY === */}
      <div className="relative z-10 h-full flex flex-col pointer-events-none">
        {/* TOP — Title */}
        <div className="flex flex-col items-center pt-[3vh] sm:pt-[3vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <motion.div
              animate={{
                scale: [1, 1.06, 0.97, 1.03, 1],
                rotate: [0, 0.5, -0.4, 0.3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Glitch jitter layer */}
              <motion.div
                animate={{
                  x: [0, -2, 3, -1, 0, 2, -3, 0],
                  y: [0, 1, -1, 0, 1, -1, 0, 0],
                  skewX: [0, -0.5, 0.8, 0, -0.3, 0.5, 0, 0],
                }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                  ease: "easeInOut",
                }}
              >
                {/* Power flash layer */}
                <motion.div
                  animate={{
                    filter: [
                      "brightness(1) saturate(1)",
                      "brightness(1.8) saturate(1.5)",
                      "brightness(0.9) saturate(1.2)",
                      "brightness(1.4) saturate(1.3)",
                      "brightness(1) saturate(1)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/title.png"
                    alt="ZEREBLAST"
                    className="title-glow-intense w-[140px] sm:w-[240px] md:w-[320px] lg:w-[380px] select-none"
                    draggable={false}
                  />
                </motion.div>
              </motion.div>

              {/* Neon underline */}
              <motion.div
                className="mx-auto mt-1 h-[2px] rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, #ff2d7b, #00f0ff, #39ff14, #ff2d7b, transparent)",
                  boxShadow: "0 0 8px #ff2d7b, 0 0 20px #00f0ff, 0 0 40px #b44dff",
                }}
                animate={{
                  width: ["40%", "90%", "60%", "85%", "40%"],
                  opacity: [0.5, 1, 0.7, 0.9, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* SPACER */}
        <div className="flex-1" />

        {/* BOTTOM — Arcade HUD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="pb-[60px] sm:pb-[70px] px-3 sm:px-4"
        >
          {/* Player stats bar */}
          <div className="max-w-[700px] mx-auto flex items-end justify-between gap-2 sm:gap-4">
            {/* P1 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className="text-[5px] sm:text-[7px] text-[#ff2d7b] tracking-[0.15em]"
                  style={{ fontFamily: "var(--font-press-start)" }}
                >
                  P1
                </span>
                <span
                  className="text-[6px] sm:text-[9px] text-[#ff2d7b] glow-text"
                  style={{ fontFamily: "var(--font-press-start)" }}
                >
                  <TickingScore target={88450} delay={3} />
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[4px] sm:text-[5px] text-[#ff2d7b]/60" style={{ fontFamily: "var(--font-press-start)" }}>HP</span>
                <AnimatedBar color="linear-gradient(90deg, #ff2d7b, #ff6b9d)" delay={3.5} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[4px] sm:text-[5px] text-[#00f0ff]/60" style={{ fontFamily: "var(--font-press-start)" }}>MP</span>
                <AnimatedBar color="linear-gradient(90deg, #00c8ff, #00f0ff)" delay={3.8} />
              </div>
            </div>

            {/* Center — status */}
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-[5px] sm:text-[7px] text-[#ffe644] neon-flicker tracking-[0.3em]"
                style={{ fontFamily: "var(--font-press-start)" }}
              >
                <ScrambleText text="READY" finishTime={3000} tickInterval={80} />
              </span>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3 + i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#ffe644",
                      boxShadow: "0 0 4px #ffe644, 0 0 8px #ffe644",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* P2 */}
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className="text-[6px] sm:text-[9px] text-[#00f0ff] glow-text"
                  style={{ fontFamily: "var(--font-press-start)" }}
                >
                  <TickingScore target={72300} delay={3.2} />
                </span>
                <span
                  className="text-[5px] sm:text-[7px] text-[#00f0ff] tracking-[0.15em]"
                  style={{ fontFamily: "var(--font-press-start)" }}
                >
                  P2
                </span>
              </div>
              <div className="flex items-center gap-1">
                <AnimatedBar color="linear-gradient(90deg, #39ff14, #7fff00)" delay={4} />
                <span className="text-[4px] sm:text-[5px] text-[#39ff14]/60" style={{ fontFamily: "var(--font-press-start)" }}>HP</span>
              </div>
              <div className="flex items-center gap-1">
                <AnimatedBar color="linear-gradient(90deg, #b44dff, #d580ff)" delay={4.2} />
                <span className="text-[4px] sm:text-[5px] text-[#b44dff]/60" style={{ fontFamily: "var(--font-press-start)" }}>MP</span>
              </div>
            </div>
          </div>

          {/* Bottom edge line */}
          <div className="max-w-[700px] mx-auto mt-2 sm:mt-3 h-px bg-gradient-to-r from-transparent via-[#ff2d7b]/30 to-transparent" />
        </motion.div>
      </div>

      {/* Corner decorations — hidden on mobile */}
      <div className="hidden sm:block absolute top-3 left-3 z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 3, duration: 1 }}
          className="text-[5px] text-[#b44dff]/60 tracking-[0.2em]"
          style={{ fontFamily: "var(--font-press-start)" }}
        >
          <ScrambleText text="LVL 99" finishTime={4000} tickInterval={100} />
        </motion.div>
      </div>

      <div className="hidden sm:block absolute top-3 right-3 z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 3.5, duration: 1 }}
          className="text-[5px] text-[#39ff14]/60 tracking-[0.2em]"
          style={{ fontFamily: "var(--font-press-start)" }}
        >
          <ScrambleText text="HI-SCORE" finishTime={4000} tickInterval={100} />
        </motion.div>
      </div>

      {/* Bottom bar — token left, links right */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-4 pb-3 sm:pb-4">
        {/* $ZEREBLAST */}
        <motion.a
          href="https://pump.fun/coin/FT3Bozb8AV35XBkJprtxf28sk4JMqQV8d6MspSnCpump"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          transition={{ delay: 4.5, duration: 1 }}
          className="no-underline"
        >
          <span
            className="text-[6px] sm:text-[8px] tracking-[0.2em] uppercase"
            style={{
              fontFamily: "var(--font-press-start)",
              color: "#ffe644",
              textShadow: "0 0 6px rgba(255,230,68,0.4)",
            }}
          >
            $ZEREBLAST
          </span>
        </motion.a>

        {/* Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.a
            href="https://x.com/0xzerebro"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ delay: 4.6, duration: 1 }}
            className="text-[4px] sm:text-[6px] tracking-[0.2em] uppercase no-underline"
            style={{
              fontFamily: "var(--font-press-start)",
              color: "#b44dff",
              textShadow: "0 0 6px rgba(180,77,255,0.4)",
            }}
          >
            @0xzerebro
          </motion.a>
          <motion.a
            href="https://x.com/zereblast"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ delay: 4.3, duration: 1 }}
            className="text-[4px] sm:text-[6px] tracking-[0.2em] uppercase no-underline"
            style={{
              fontFamily: "var(--font-press-start)",
              color: "#00f0ff",
              textShadow: "0 0 6px rgba(0,240,255,0.4)",
            }}
          >
            @zereblast
          </motion.a>
          <motion.a
            href="https://zerebro.org/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ delay: 4, duration: 1 }}
            className="text-[4px] sm:text-[6px] tracking-[0.2em] uppercase no-underline"
            style={{
              fontFamily: "var(--font-press-start)",
              color: "#b44dff",
              textShadow: "0 0 6px rgba(180,77,255,0.4)",
            }}
          >
            zerebro.org
          </motion.a>
        </div>
      </div>

      {/* HUD frame */}
      <HudFrame />

      {/* Glitch system */}
      <GlitchOverlay />
      <div className="crt-overlay" aria-hidden="true" />
    </main>
  );
}
