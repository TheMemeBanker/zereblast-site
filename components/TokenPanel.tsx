"use client";

import { useState } from "react";
import { CA, PUMP_URL } from "./ca";
import { Bolt } from "./Brand";

/**
 * $ZEREBLAST on the page. One source: components/ca.ts.
 * CA set   -> address box (click to copy) + BUY ON PUMP.FUN.
 * CA empty -> the same panel in its pending state: CA DROPS SOON, nothing to copy, no link.
 */
export default function TokenPanel() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!CA) return;
    try {
      void navigator.clipboard?.writeText(CA);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* the address is still selectable on screen */
    }
  };
  return (
    <div id="token" className="card-ink" style={{ padding: "clamp(18px, 3vw, 32px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "center" }}>
      <div>
        <div className="eyebrow" style={{ color: "var(--cobalt-2)" }}>THE TOKEN · SOLANA</div>
        <div className="wordmark" style={{ fontSize: "clamp(34px, 6vw, 64px)", marginTop: 10 }}>$ZEREBLAST</div>
        <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.55, color: "var(--cream-3)", maxWidth: 520 }}>
          The coin behind the cartridge. Holders and daily players share the $ZEREBRO rewards reserve at game launch. Only ever copy the address from this box, never from a wallet history or an explorer.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="eyebrow" style={{ color: "var(--cream-3)" }}>CONTRACT ADDRESS</div>
        <button
          type="button"
          onClick={copy}
          className="hud"
          disabled={!CA}
          style={{ textAlign: "left", wordBreak: "break-all", padding: "14px 14px", border: "2px solid var(--cream)", background: CA ? "var(--cream)" : "transparent", color: CA ? "var(--ink)" : "var(--yellow)", fontSize: CA ? 9 : 11, letterSpacing: ".12em", lineHeight: 1.8, cursor: CA ? "pointer" : "default", boxShadow: CA ? "4px 4px 0 var(--cobalt)" : "none" }}
          title={CA ? "Click to copy" : "Contract address drops soon"}
          aria-label={CA ? "Copy the contract address" : "Contract address drops soon"}
        >
          {CA || "CA DROPS SOON"}
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          {CA ? (
            <>
              <button type="button" onClick={copy} className="btn btn-sm" style={{ background: copied ? "var(--yellow)" : "var(--cream)" }}>
                {copied ? "COPIED" : "COPY CA"}
              </button>
              <a className="btn btn-sm btn-primary" href={PUMP_URL} target="_blank" rel="noopener noreferrer">
                <Bolt size={10} color="var(--ink)" /> BUY ON PUMP.FUN
              </a>
            </>
          ) : (
            <span className="tag tag-yellow">STAY TUNED</span>
          )}
          <a href="#rewards" className="hud" style={{ fontSize: 8, letterSpacing: ".16em", color: "var(--cream)" }}>
            REWARDS RESERVE
          </a>
        </div>
      </div>
    </div>
  );
}
