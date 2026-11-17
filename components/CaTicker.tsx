"use client";

import { useEffect, useState } from "react";
import { CA, PUMP_URL } from "./ca";

/**
 * The contract address, flashing across the site. A fixed HUD band at the top edge: the CA scrolls
 * right-to-left on a loop, the whole band flashes every few seconds, click copies the address.
 * Pending state (empty CA) shows "CA DROPS SOON" and copies nothing. Reduced motion: static, no scroll.
 */
export default function CaTicker() {
  const [copied, setCopied] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    try { setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch {}
  }, []);
  function copy() {
    if (!CA) return;
    try { void navigator.clipboard?.writeText(CA); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {}
  }
  const label = CA ? `$ZEREBLAST CA  ${CA}` : "$ZEREBLAST CA  DROPS SOON";
  const unit = `★  ${label}  ★  ${copied ? "COPIED" : CA ? "CLICK TO COPY" : "STAY TUNED"}  `;
  const text = unit.repeat(6);
  return (
    <div
      className={`ca-ticker${CA ? "" : " pending"}`}
      role="button"
      tabIndex={0}
      aria-label={CA ? `Contract address ${CA}, click to copy` : "Contract address drops soon"}
      onClick={copy}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copy(); } }}
      title={CA ? "Click to copy the contract address" : "CA drops soon"}
    >
      <div className={`ca-ticker-track${reduced ? " static" : ""}`} aria-hidden>
        <span style={{ fontFamily: "var(--font-press-start)" }}>{reduced ? unit : text}</span>
      </div>
      <i className="ca-ticker-flash" aria-hidden />
      {CA && (
        <a className="ca-ticker-link" href={PUMP_URL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} aria-label="Open on pump.fun" style={{ fontFamily: "var(--font-press-start)" }}>
          PUMP.FUN ↗
        </a>
      )}
    </div>
  );
}
