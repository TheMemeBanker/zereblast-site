"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: "10M+", label: "PLAYS" },
  { value: "142K", label: "PLAYERS" },
  { value: "∞", label: "LEVELS" },
  { value: "24/7", label: "ONLINE" },
];

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="border-y border-[#2a1848] bg-[#0d0818]/60 py-8 md:py-10 px-4">
      <div className="max-w-[800px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <div
              className="text-white text-xl md:text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-press-start)", textShadow: "0 0 10px rgba(180, 77, 255, 0.3)" }}
            >
              {s.value}
            </div>
            <div
              className="text-[7px] tracking-[0.3em] text-[#8b2572]"
              style={{ fontFamily: "var(--font-press-start)" }}
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
