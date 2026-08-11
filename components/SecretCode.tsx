"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Hidden $ZEREBLAST contract address.
 *
 * Two ways to find it — nothing on screen gives it away until you go looking:
 *   1. open the console
 *   2. enter the Konami code on the page
 *
 * (A JSX comment in layout.tsx is NOT a third way: JSX comments are stripped at
 * build time and never reach the served HTML. Verified — 0 occurrences in
 * out/index.html. The address does ship inside the JS bundle, which is where a
 * determined reader will find it.)
 *
 * Kept in one place so the address can never drift between them.
 */
const CA = "AnTTVwu1mhybtbs4b1QqKEP1UziJyuYYYcnJoCSzpump";

/** ↑ ↑ ↓ ↓ ← → ← → B A */
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "KeyB", "KeyA",
] as const;

export default function SecretCode() {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Console drop — the cheapest way in for anyone who opens devtools.
  useEffect(() => {
    try {
      const style = "color:#39ff14;background:#0a0610;font-size:12px;padding:2px 6px";
      // eslint-disable-next-line no-console
      console.log("%c▛▀▘ ZEREBLAST // SYS.ONLINE ▝▀▟", style);
      // eslint-disable-next-line no-console
      console.log("%c$ZEREBLAST CA  " + CA, "color:#00f0ff;font-size:12px");
      // eslint-disable-next-line no-console
      console.log("%c↑ ↑ ↓ ↓ ← → ← → B A", "color:#ff2d7b;font-size:11px");
    } catch {
      /* console unavailable — never let an easter egg break the page */
    }
  }, []);

  // Konami listener.
  useEffect(() => {
    let i = 0;
    // Only keys that are part of the sequence may advance OR reset it.
    //
    // This page dispatches its own synthetic keydown events (the arcade loop
    // fires KeyJ continuously). A naive matcher resets on every foreign key, so
    // the sequence could never complete — not just under test, but for a real
    // visitor too, because the interference is constant. Ignoring everything
    // outside the alphabet makes the code enterable at human speed while the
    // game keeps running underneath.
    const ALPHABET = new Set<string>(KONAMI);
    const onKey = (e: KeyboardEvent) => {
      if (!ALPHABET.has(e.code)) return;
      // Match on physical key code so it works regardless of layout/shift.
      if (e.code === KONAMI[i]) {
        i++;
        if (i === KONAMI.length) {
          i = 0;
          setRevealed(true);
        }
      } else {
        // Restart, but allow this key to begin a fresh attempt.
        i = e.code === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copy = useCallback(() => {
    try {
      void navigator.clipboard?.writeText(CA);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the address is still selectable on screen */
    }
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setRevealed(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [revealed]);

  if (!revealed) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-[2px]"
      onClick={() => setRevealed(false)}
      role="dialog"
      aria-label="Secret contract address"
    >
      <div
        className="relative w-full max-w-xl border-2 px-5 py-6 text-center"
        style={{
          borderColor: "#39ff14",
          background: "#0a0610",
          boxShadow: "0 0 0 1px #0a0610, 0 0 24px rgba(57,255,20,.35), inset 0 0 40px rgba(57,255,20,.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-[10px] tracking-[0.3em]"
          style={{ color: "#ff2d7b", fontFamily: "var(--font-display)" }}
        >
          CHEAT ACCEPTED
        </div>

        <div
          className="mt-3 text-[11px] tracking-[0.2em]"
          style={{ color: "#00f0ff", fontFamily: "var(--font-display)" }}
        >
          $ZEREBLAST CA
        </div>

        <button
          onClick={copy}
          className="mt-4 block w-full cursor-pointer break-all border px-3 py-3 text-[11px] leading-relaxed transition sm:text-[13px]"
          style={{ borderColor: "rgba(57,255,20,.4)", color: "#39ff14", background: "rgba(57,255,20,.05)" }}
          title="Click to copy"
        >
          {CA}
        </button>

        <div className="mt-3 text-[10px]" style={{ color: copied ? "#39ff14" : "#8b8b9e" }}>
          {copied ? "COPIED" : "CLICK TO COPY · ESC TO CLOSE"}
        </div>
      </div>
    </div>
  );
}
