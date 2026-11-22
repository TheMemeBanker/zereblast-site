"use client";

import { useEffect, useState } from "react";

/**
 * $ZEREBRO rewards reserve. The balance is fetched LIVE from the chain on every
 * page load and never hardcoded, so the panel can only show what the wallet
 * holds. The Solscan link is there so anyone can check it independently.
 */
const RESERVE_WALLET = "BZfRPexCoXMsFLvbYqn8C4PvTLH5KRaxpsFHynMTGQoN";
// The wallet's ZEREBRO token account (deterministic for wallet+mint). Public
// RPCs 403 browser getTokenAccountsByOwner; plain getAccountInfo passes.
const RESERVE_TOKEN_ACCOUNT = "5ZurRsJkvFUvK2rxt9pcWBwgUYM7Bk8RCcnqis8sSU6S";
const RPCS = ["https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"];

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "K";
  return String(Math.round(n));
}

export default function RewardsReserve() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const rpc of RPCS) {
        try {
          const res = await fetch(rpc, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getAccountInfo", params: [RESERVE_TOKEN_ACCOUNT, { encoding: "jsonParsed" }] }),
            signal: AbortSignal.timeout(8000),
          });
          if (!res.ok) continue;
          const data = await res.json();
          const amt = data?.result?.value?.data?.parsed?.info?.tokenAmount?.uiAmount;
          if (typeof amt === "number" && !cancelled) {
            setBalance(amt);
            return;
          }
        } catch {
          /* next RPC; the panel still renders with the verify link */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="card" style={{ padding: "clamp(18px, 3vw, 28px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, alignItems: "center" }}>
      <div>
        <div className="eyebrow">REWARDS RESERVE · LIVE ON-CHAIN</div>
        <div className="display" style={{ fontSize: "clamp(30px, 5vw, 54px)", marginTop: 8, color: "var(--cobalt)" }}>
          {balance !== null ? `${fmt(balance)} $ZEREBRO` : "VERIFY ON-CHAIN"}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)", maxWidth: 520 }}>
          Set aside for $ZEREBLAST holders and daily players, claimed on-chain at game launch. The number above is read from the wallet every time this page loads. It is a plan, not a guarantee.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
        <a className="btn btn-sm" href={`https://solscan.io/account/${RESERVE_WALLET}`} target="_blank" rel="noopener noreferrer">
          VERIFY ON SOLSCAN
        </a>
        <div className="hud" style={{ fontSize: 7, letterSpacing: ".14em", color: "var(--muted)", wordBreak: "break-all" }}>{RESERVE_WALLET}</div>
      </div>
    </div>
  );
}
