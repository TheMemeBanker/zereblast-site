"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function WaitlistCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section ref={ref} className="relative py-28 md:py-40 px-4 md:px-6 lg:px-8 overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(180, 77, 255, 0.04) 0%, transparent 60%)" }}
      />

      <div className="max-w-[420px] mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        >
          <p
            className="coin-blink text-[9px] tracking-[0.4em] uppercase text-[#ffe644] mb-10"
            style={{ fontFamily: "var(--font-press-start)" }}
          >
            Continue?
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@zereblast.org"
                required
                className="flex-1 px-4 py-3.5 bg-transparent border border-[#2a1848] rounded-sm text-white text-sm placeholder-[#3a2858] focus:outline-none focus:border-[#ff2d7b]/40 transition-colors"
                style={{ fontFamily: "var(--font-press-start)", fontSize: "9px" }}
              />
              <button
                type="submit"
                className="px-6 py-3.5 border-2 border-[#ff2d7b] text-[#ff2d7b] text-[9px] font-bold tracking-[0.2em] uppercase rounded-sm transition-all hover:bg-[#ff2d7b] hover:text-white neon-box-pink active:scale-[0.97]"
                style={{ fontFamily: "var(--font-press-start)" }}
              >
                Join
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3"
            >
              <span
                className="text-[9px] tracking-[0.2em] uppercase neon-text-cyan"
                style={{ fontFamily: "var(--font-press-start)" }}
              >
                Player Registered
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
