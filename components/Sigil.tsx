"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SIGIL_CELLS, SIGIL_COLOR, SIGIL_H, SIGIL_HEX, SIGIL_ROWS, SIGIL_W } from "./sigil-data";
import { KEY_BEST, SCORE_EVENT } from "./BlastGame";

/**
 * THE ENTITY — the ZEREBLAST emblem treated as data, not decoration.
 *
 * The green silhouette lives in the repo as a 23×35 bitmap (sigil-data.ts).
 * On load the cells fly in from the void and lock into place row by row while
 * the HUD prints each row's hex word (a boot sequence). When the bitmap is
 * complete it docks to the top-right corner as the system badge: the sigil,
 * the real local HI-SCORE, the live Solana slot (fetched, never hardcoded) and
 * the bitmap rows cycling as a hex readout. Click the badge to start the game.
 *
 * Reduced-motion users skip the boot and get the badge immediately.
 */

const RPCS = ["https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"];
const DISPLAY: React.CSSProperties = { fontFamily: "var(--font-press-start)" };

/** Crisp vector rendering of the bitmap; `cell` px per bitmap pixel. */
export function SigilSVG({ cell = 2, color = SIGIL_COLOR, className, style, glitch = 0 }: { cell?: number; color?: string; className?: string; style?: React.CSSProperties; glitch?: number }) {
  return (
    <svg
      width={SIGIL_W * cell}
      height={SIGIL_H * cell}
      viewBox={`0 0 ${SIGIL_W} ${SIGIL_H}`}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {SIGIL_ROWS.map((row, y) => {
        // a glitched frame offsets a band of rows sideways
        const dx = glitch && y >= glitch && y < glitch + 4 ? (y % 2 ? 1.5 : -1.5) : 0;
        return [...row].map((c, x) => (c === "#" ? <rect key={`${x}-${y}`} x={x + dx} y={y} width={1} height={1} fill={color} /> : null));
      })}
    </svg>
  );
}

function useBest() {
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => {
    const read = () => {
      try {
        const v = Number(localStorage.getItem(KEY_BEST) || 0);
        setBest(v > 0 ? v : null);
      } catch {
        setBest(null);
      }
    };
    read();
    window.addEventListener(SCORE_EVENT, read);
    return () => window.removeEventListener(SCORE_EVENT, read);
  }, []);
  return best;
}

function useSlot(intervalMs = 12000) {
  const [slot, setSlot] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      for (const rpc of RPCS) {
        try {
          const r = await fetch(rpc, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot", params: [{ commitment: "confirmed" }] }),
            signal: AbortSignal.timeout(6000),
          });
          if (!r.ok) continue;
          const j = await r.json();
          if (typeof j?.result === "number" && alive) {
            setSlot(j.result);
            return;
          }
        } catch {
          /* next RPC */
        }
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), intervalMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [intervalMs]);
  return slot;
}

/* ------------------------------------------------------------------ boot */

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function SigilBoot({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [rowsDone, setRowsDone] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const small = window.innerWidth < 640;
    const cell = small ? 5 : 8;
    const pad = 40;
    const W = SIGIL_W * cell + pad * 2;
    const H = SIGIL_H * cell + pad * 2;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.width = `${W}px`;
    cv.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // deterministic scatter per cell (no Math.random so SSR/CSR never disagree)
    const seeds = SIGIL_CELLS.map(([x, y], i) => {
      const a = ((i * 2654435761) % 360) * (Math.PI / 180);
      const r = 160 + ((i * 7919) % 220);
      return { tx: pad + x * cell, ty: pad + y * cell, sx: pad + x * cell + Math.cos(a) * r, sy: pad + y * cell + Math.sin(a) * r, delay: y * 0.045 + ((i * 31) % 7) * 0.01, row: y };
    });
    const ASSEMBLE = 1.1; // per-cell flight time
    const total = SIGIL_H * 0.045 + ASSEMBLE + 0.5;
    let start = 0;
    let raf = 0;
    let lastRows = -1;
    let finished = false;

    const frame = (now: number) => {
      if (!start) start = now;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, W, H);
      // faint grid of the target lattice
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = SIGIL_COLOR;
      ctx.lineWidth = 1;
      for (let x = 0; x <= SIGIL_W; x += 1) {
        ctx.beginPath();
        ctx.moveTo(pad + x * cell + 0.5, pad);
        ctx.lineTo(pad + x * cell + 0.5, pad + SIGIL_H * cell);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      let locked = 0;
      for (const s of seeds) {
        const k = Math.max(0, Math.min(1, (t - s.delay) / ASSEMBLE));
        if (k <= 0) continue;
        const e = easeOut(k);
        const x = s.sx + (s.tx - s.sx) * e;
        const y = s.sy + (s.ty - s.sy) * e;
        if (k >= 1) locked++;
        ctx.globalAlpha = k >= 1 ? 1 : 0.35 + 0.65 * e;
        ctx.fillStyle = k >= 1 ? SIGIL_COLOR : "#c8ff9a";
        const sz = k >= 1 ? cell : cell * (0.4 + 0.6 * e);
        ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(sz), Math.ceil(sz));
        if (k < 1) {
          // motion trail
          ctx.globalAlpha = 0.18 * (1 - e);
          ctx.fillRect(Math.round(s.sx + (s.tx - s.sx) * easeOut(Math.max(0, k - 0.08))), Math.round(s.sy + (s.ty - s.sy) * easeOut(Math.max(0, k - 0.08))), cell, cell);
        }
      }
      ctx.globalAlpha = 1;
      // scanline sweep after assembly
      const done = t > SIGIL_H * 0.045 + ASSEMBLE;
      if (done) {
        const sy = pad + ((t * 220) % (SIGIL_H * cell + 40)) - 20;
        const grad = ctx.createLinearGradient(0, sy - 14, 0, sy + 14);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.5, "rgba(255,255,255,0.45)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(pad, sy - 14, SIGIL_W * cell, 28);
        ctx.shadowColor = SIGIL_COLOR;
      }
      // rows locked -> hex readout progress (rounded to whole rows)
      const rows = Math.min(SIGIL_H, Math.floor(locked / Math.max(1, SIGIL_CELLS.length / SIGIL_H)));
      if (rows !== lastRows) {
        lastRows = rows;
        setRowsDone(rows);
      }
      if (t > total && !finished) {
        finished = true;
        setFade(true);
        window.setTimeout(onDone, 450);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const shown = SIGIL_HEX.slice(Math.max(0, rowsDone - 9), rowsDone);
  const pct = Math.round((rowsDone / SIGIL_H) * 100);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: "rgba(10,6,16,0.72)", opacity: fade ? 0 : 1, transition: "opacity .45s ease" }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-4 sm:gap-10" style={{ filter: `drop-shadow(0 0 18px ${SIGIL_COLOR}66)` }}>
        <canvas ref={ref} />
        <div className="w-[118px] sm:w-[190px] text-[5px] sm:text-[7px] leading-[2.1] tracking-[0.16em]" style={{ ...DISPLAY, color: SIGIL_COLOR }}>
          <div style={{ color: "#8b8b9e" }}>ENTITY.BMP {SIGIL_W}x{SIGIL_H}</div>
          <div style={{ color: "#8b8b9e" }}>{SIGIL_CELLS.length} CELLS · {pct}%</div>
          <div className="mt-1 h-[3px] w-full" style={{ background: "#1a0f2e" }}>
            <div className="h-full" style={{ width: `${pct}%`, background: SIGIL_COLOR, transition: "width .12s linear" }} />
          </div>
          <div className="mt-2 opacity-90">
            {shown.map((h, i) => (
              <div key={`${h}-${i}`} style={{ opacity: 0.35 + (i / Math.max(1, shown.length - 1)) * 0.65 }}>
                0x{h}
              </div>
            ))}
            {rowsDone < SIGIL_H && <div className="animate-pulse">▌</div>}
          </div>
          {rowsDone >= SIGIL_H && <div className="mt-1" style={{ color: "#ffe644" }}>ENTITY ONLINE</div>}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- badge */

function SigilBadge({ onStart, visible }: { onStart: () => void; visible: boolean }) {
  const best = useBest();
  const slot = useSlot();
  const [hexIdx, setHexIdx] = useState(0);
  const [glitch, setGlitch] = useState(0);

  useEffect(() => {
    const a = window.setInterval(() => setHexIdx((i) => (i + 1) % SIGIL_H), 420);
    const b = window.setInterval(() => {
      setGlitch(2 + Math.floor(Math.random() * (SIGIL_H - 6)));
      window.setTimeout(() => setGlitch(0), 140);
    }, 4200);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, []);

  return (
    <motion.button
      type="button"
      onClick={onStart}
      initial={{ opacity: 0, y: -8 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.6 }}
      className="pointer-events-auto absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center gap-2 sm:gap-3 border px-2 py-1.5 sm:px-3 sm:py-2 cursor-pointer text-left"
      style={{ borderColor: `${SIGIL_COLOR}40`, background: "rgba(10,6,16,0.55)", boxShadow: `0 0 16px ${SIGIL_COLOR}22, inset 0 0 20px rgba(0,0,0,.4)` }}
      title={`ENTITY ${SIGIL_W}x${SIGIL_H}\n${SIGIL_HEX.join(" ")}\n\nPress to start`}
      aria-label="Entity system badge. Press to start ZEREBLAST"
    >
      <div className="relative overflow-hidden" style={{ filter: `drop-shadow(0 0 6px ${SIGIL_COLOR}99)` }}>
        <SigilSVG cell={1} glitch={glitch} className="h-[26px] w-auto sm:h-[44px]" />
        {/* slow scan */}
        <div
          className="absolute left-0 right-0 h-[6px] pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,.55), transparent)", animation: "sigil-scan 3.6s linear infinite" }}
        />
      </div>
      <div className="flex flex-col gap-[3px] text-[4px] sm:text-[5px] tracking-[0.18em] leading-none" style={DISPLAY}>
        <span style={{ color: SIGIL_COLOR }}>SYS.ID ZEREBLAST</span>
        <span style={{ color: "#ffe644" }}>HI-SCORE {best !== null ? String(Math.min(best, 999999)).padStart(6, "0") : "------"}</span>
        <span className="hidden sm:block" style={{ color: "#00f0ff" }}>SLOT {slot !== null ? slot.toLocaleString("en-US") : "---"}</span>
        <span className="hidden sm:block" style={{ color: "#8b8b9e" }}>
          ROW {String(hexIdx + 1).padStart(2, "0")} 0x{SIGIL_HEX[hexIdx]}
        </span>
        <span className="sm:hidden" style={{ color: "#8b8b9e" }}>0x{SIGIL_HEX[hexIdx]}</span>
      </div>
      <style>{`@keyframes sigil-scan{0%{top:-8px}100%{top:100%}}`}</style>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ root */

export default function Sigil({ onStart }: { onStart: () => void }) {
  const [booted, setBooted] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setSkip(true);
    } catch {
      /* no matchMedia — run the boot */
    }
  }, []);

  const done = booted || skip;
  return (
    <>
      {!done && <SigilBoot onDone={() => setBooted(true)} />}
      <SigilBadge onStart={onStart} visible={done} />
    </>
  );
}
