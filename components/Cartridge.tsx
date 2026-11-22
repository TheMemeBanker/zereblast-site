"use client";

import { Bolt } from "./Brand";
import { useProgress } from "./useProgress";
import { pad } from "@/lib/progress";

/** The cartridge: the game's physical form. Click it and it boots. */
export default function Cartridge({ onStart }: { onStart: () => void }) {
  const p = useProgress();
  const best = p ? pad(p.best) : "------";
  return (
    <button type="button" className="cart" onClick={onStart} aria-label="Insert cartridge and start ZEREBLAST">
      <div className="cart-shadow" aria-hidden="true" />
      <div className="cart-shell" aria-hidden="true" />
      <div className="cart-ridges" aria-hidden="true" />
      <div className="cart-label">
        <div className="cart-label-band">
          <span className="hud" style={{ fontSize: 8, letterSpacing: ".2em", color: "var(--cream)" }}>CART 01</span>
          <span className="hud" style={{ fontSize: 8, letterSpacing: ".2em", color: "var(--yellow)" }}>1 PLAYER</span>
        </div>
        <div className="cart-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/char-trimmed.png" alt="" style={{ left: "4%", bottom: "-3%", width: "40%" }} draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coin-trimmed.png" alt="" className="bob" style={{ right: "8%", top: "34%", width: "22%" }} draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/powerup-trimmed.png" alt="" className="bob-2" style={{ right: "34%", bottom: "6%", width: "15%" }} draggable={false} />
          <div style={{ position: "absolute", left: "7%", top: "9%" }}>
            <span className="wordmark" style={{ fontSize: "clamp(22px, 6vw, 38px)" }}>ZEREBLAST</span>
          </div>
          <div className="hud" style={{ position: "absolute", left: "7%", top: "30%", fontSize: 7, letterSpacing: ".18em", color: "var(--cream)", background: "var(--ink)", padding: "4px 6px" }}>
            FIXED SHOOTER · 3 LIVES
          </div>
        </div>
      </div>
      <div className="cart-slot hud" style={{ fontSize: 8, letterSpacing: ".16em", color: "var(--cream)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Bolt size={10} color="var(--yellow)" /> HI {best}
        </span>
        <span className="blink" style={{ color: "var(--orange)" }}>INSERT</span>
      </div>
      <div className="cart-contacts" aria-hidden="true" />
    </button>
  );
}
