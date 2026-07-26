"use client";

export default function MarqueeBar() {
  const items = [
    "HIGH SCORE",
    "★",
    "PLAYER 1 READY",
    "★",
    "NEW CHALLENGER",
    "★",
    "LEVEL UP",
    "★",
    "COMBO x99",
    "★",
    "GAME ON",
    "★",
    "BONUS ROUND",
    "★",
    "PERFECT",
    "★",
  ];

  const text = items.join("   ");

  return (
    <div className="relative overflow-hidden border-y border-[#2a1848] bg-[#0d0818]/80 py-3">
      <div className="marquee-scroll flex whitespace-nowrap">
        <span
          className="text-[9px] tracking-[0.3em] uppercase text-[#8b2572] font-bold px-4"
          style={{ fontFamily: "var(--font-press-start)" }}
        >
          {text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;
        </span>
      </div>
    </div>
  );
}
