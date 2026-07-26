"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const leaders = [
  { rank: 1, name: "XERO", score: "9,999,999", color: "#ffe644" },
  { rank: 2, name: "NOVA", score: "8,421,300", color: "#c0c0c0" },
  { rank: 3, name: "BLITZ", score: "7,890,100", color: "#cd7f32" },
  { rank: 4, name: "PHANTOM", score: "6,234,800", color: "#71767b" },
  { rank: 5, name: "RAZOR", score: "5,678,200", color: "#71767b" },
];

export default function Leaderboard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-20 md:py-28 px-4 md:px-6 lg:px-8">
      <div className="max-w-[500px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="text-center mb-10"
        >
          <p
            className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-[#ffe644] font-bold neon-flicker"
            style={{ fontFamily: "var(--font-press-start)" }}
          >
            High Scores
          </p>
        </motion.div>

        <div className="border border-[#2a1848] rounded-sm bg-[#0d0818]/80 overflow-hidden">
          {leaders.map((l, i) => (
            <motion.div
              key={l.name}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className={`flex items-center justify-between px-5 py-4 ${
                i < leaders.length - 1 ? "border-b border-[#2a1848]/60" : ""
              } hover:bg-white/[0.02] transition-colors`}
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-[10px] w-6 text-center"
                  style={{ fontFamily: "var(--font-press-start)", color: l.color }}
                >
                  {l.rank}
                </span>
                <span
                  className="text-[10px] sm:text-[11px] text-white/90 tracking-wider"
                  style={{ fontFamily: "var(--font-press-start)" }}
                >
                  {l.name}
                </span>
              </div>
              <span
                className="text-[10px] sm:text-[11px] text-[#b44dff] tracking-wide"
                style={{ fontFamily: "var(--font-press-start)" }}
              >
                {l.score}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
