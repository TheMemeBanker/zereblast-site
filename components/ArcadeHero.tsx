"use client";

import { useId } from "react";
import { motion } from "framer-motion";

export default function ArcadeHero() {
  const id = useId().replace(/:/g, "");

  // Original image: 1177 x 732
  // Character crop: offset (950, 260), size (220, 280)
  // As percentages of original: left=80.7%, top=35.5%, width=18.7%, height=38.3%
  const charLeft = (950 / 1177) * 100;
  const charTop = (260 / 732) * 100;
  const charW = (220 / 1177) * 100;
  const charH = (280 / 732) * 100;

  const sparks = Array.from({ length: 25 }, (_, i) => ({
    left: `${(i * 43 + 11) % 100}%`,
    top: `${(i * 31 + 17) % 100}%`,
    delay: `${(i * 0.8) % 5}s`,
    duration: `${1.5 + (i % 4) * 0.5}s`,
    size: 2 + (i % 3),
    color: ["#ff2d7b", "#00f0ff", "#ffe644", "#b44dff", "#39ff14"][i % 5],
  }));

  return (
    <section className="relative h-screen min-h-[600px] flex items-start justify-center pt-[6vh] sm:pt-[8vh] overflow-hidden">
      {/* === SCENE CONTAINER — fixed aspect ratio matching the image === */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Aspect-ratio locked scene wrapper — covers viewport */}
        <div
          className="absolute"
          style={{
            /* Center the image container and make it cover the viewport */
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            /* Use a size large enough to always cover the viewport */
            width: "max(100vw, 177.8vh)",  /* 1177/732 ≈ 1.608 */
            height: "max(100vh, 62.2vw)",  /* 732/1177 ≈ 0.622 */
          }}
        >
          {/* Layer 1: Static background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zereblast1.png"
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ imageRendering: "pixelated", objectFit: "fill" }}
            draggable={false}
            aria-hidden="true"
          />

          {/* Layer 2: Character overlay — bouncing */}
          <div
            className="absolute character-bounce"
            style={{
              left: `${charLeft}%`,
              top: `${charTop}%`,
              width: `${charW}%`,
              height: `${charH}%`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/character.png"
              alt=""
              className="w-full h-full"
              style={{ imageRendering: "pixelated", objectFit: "fill" }}
              draggable={false}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Neon pulse layer */}
        <div className="neon-scene-pulse absolute inset-0 mix-blend-screen overflow-hidden">
          <div
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "max(100vw, 177.8vh)",
              height: "max(100vh, 62.2vw)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zereblast1.png"
              alt=""
              className="absolute inset-0 w-full h-full"
              style={{ imageRendering: "pixelated", objectFit: "fill" }}
              draggable={false}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0610]/30 via-[#0a0610]/10 to-[#0a0610]/85" />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 80% at 50% 55%, transparent 25%, #0a0610 100%)" }}
        />

        {/* Pulsing neon glows */}
        <div className="absolute inset-0 mix-blend-screen neon-glow-pulse-1"
          style={{ background: "radial-gradient(circle at 30% 60%, #b44dff 0%, transparent 40%)" }}
        />
        <div className="absolute inset-0 mix-blend-screen neon-glow-pulse-2"
          style={{ background: "radial-gradient(circle at 75% 45%, #ff2d7b 0%, transparent 35%)" }}
        />
        <div className="absolute inset-0 mix-blend-screen neon-glow-pulse-3"
          style={{ background: "radial-gradient(circle at 50% 70%, #00f0ff 0%, transparent 30%)" }}
        />

        {/* Pixel sparks */}
        {sparks.map((s, i) => (
          <div
            key={`${id}-${i}`}
            className="absolute rounded-sm pixel-spark"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background: s.color,
              boxShadow: `0 0 6px ${s.color}, 0 0 12px ${s.color}66`,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}

        {/* Screen flash */}
        <div className="absolute inset-0 screen-flash pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="mb-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zereblast2.png"
            alt="ZEREBLAST"
            className="title-glow mx-auto w-full max-w-[500px] md:max-w-[650px] select-none"
            style={{ imageRendering: "auto" }}
            draggable={false}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p
            className="coin-blink text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#ffe644] mb-8"
            style={{ fontFamily: "var(--font-press-start)" }}
          >
            Insert Coin
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="flex items-center justify-center gap-4"
        >
          <a
            href="#play"
            className="group arcade-btn inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-[#ff2d7b] text-[#ff2d7b] text-xs font-bold tracking-wider uppercase rounded-sm transition-all hover:bg-[#ff2d7b] hover:text-white"
            style={{ fontFamily: "var(--font-press-start)" }}
          >
            <span className="text-[10px]">Play</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="mt-12 flex items-center justify-center gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-[7px] text-[#8b2572] tracking-[0.2em]" style={{ fontFamily: "var(--font-press-start)" }}>P1</span>
            <span className="text-[9px] text-[#ff2d7b] score-tick" style={{ fontFamily: "var(--font-press-start)" }}>00000</span>
          </div>
          <div className="text-[7px] text-[#ffe644] neon-flicker tracking-[0.3em]" style={{ fontFamily: "var(--font-press-start)" }}>
            READY
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[7px] text-[#8b2572] tracking-[0.2em]" style={{ fontFamily: "var(--font-press-start)" }}>P2</span>
            <span className="text-[9px] text-[#00f0ff] score-tick" style={{ fontFamily: "var(--font-press-start)" }}>00000</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0610] to-transparent z-[5] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-[#ff2d7b]/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
