"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const games = [
  { name: "VOID RUNNER", color: "#ff2d7b", genre: "ENDLESS" },
  { name: "NEON SIEGE", color: "#00f0ff", genre: "TOWER DEF" },
  { name: "PIXEL FURY", color: "#b44dff", genre: "BEAT EM UP" },
  { name: "STAR DRIFT", color: "#ffe644", genre: "RACER" },
  { name: "BLAST CORE", color: "#39ff14", genre: "SHOOTER" },
  { name: "SHADOW ARC", color: "#ff2d7b", genre: "RPG" },
];

export default function GameShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="play" ref={ref} className="relative py-24 md:py-36 px-4 md:px-6 lg:px-8">
      <div className="max-w-[1100px] mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="text-center mb-14"
        >
          <p
            className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-[#8b2572] font-bold"
            style={{ fontFamily: "var(--font-press-start)" }}
          >
            Select Game
          </p>
        </motion.div>

        {/* Game grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {games.map((game, i) => (
            <motion.div
              key={game.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              className="arcade-card group cursor-pointer relative overflow-hidden rounded-sm border border-[#2a1848] bg-[#0d0818]"
            >
              {/* Game screen */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${game.color}15 0%, #0d0818 60%)`,
                  }}
                />
                {/* Pixel grid */}
                <div className="absolute inset-0 pixel-grid opacity-40" />
                {/* Center icon glow */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle, ${game.color}20, transparent 70%)` }}
                />
                {/* Play triangle */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div
                    className="w-10 h-10 rounded-sm border flex items-center justify-center"
                    style={{ borderColor: `${game.color}60`, boxShadow: `0 0 15px ${game.color}30` }}
                  >
                    <svg className="w-4 h-4 ml-0.5" fill={game.color} viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Genre tag */}
                <span
                  className="absolute top-2 left-2 text-[7px] tracking-[0.2em] px-2 py-1 rounded-sm bg-black/50"
                  style={{ color: game.color, fontFamily: "var(--font-press-start)" }}
                >
                  {game.genre}
                </span>
              </div>
              {/* Title */}
              <div className="p-3 border-t border-[#2a1848]">
                <p
                  className="text-[8px] sm:text-[9px] text-white/80 group-hover:text-white transition-colors tracking-wider"
                  style={{ fontFamily: "var(--font-press-start)" }}
                >
                  {game.name}
                </p>
              </div>
              {/* Hover border glow */}
              <div
                className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 20px ${game.color}15, 0 0 15px ${game.color}10` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
