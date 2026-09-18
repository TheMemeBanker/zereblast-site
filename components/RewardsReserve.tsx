"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * $ZEREBRO rewards reserve — the balance is fetched LIVE from the chain on
 * every page load, never hardcoded, so the panel can only ever show what the
 * wallet actually holds. Solscan link lets anyone verify independently.
 */
const RESERVE_WALLET = "BZfRPexCoXMsFLvbYqn8C4PvTLH5KRaxpsFHynMTGQoN";
// The wallet's ZEREBRO token account (deterministic for wallet+mint, so it
// stays valid across balance changes). Public RPCs now 403 the indexed
// getTokenAccountsByOwner from browsers, but plain getAccountInfo on the
// token account passes — hence the pre-derived address.
const RESERVE_TOKEN_ACCOUNT = "5ZurRsJkvFUvK2rxt9pcWBwgUYM7Bk8RCcnqis8sSU6S";
const RPCS = [
  "https://solana-rpc.publicnode.com",
  "https://api.mainnet-beta.solana.com",
];

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
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getAccountInfo",
              params: [RESERVE_TOKEN_ACCOUNT, { encoding: "jsonParsed" }],
            }),
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
          /* try the next RPC; panel still renders with the verify link */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.a
      href={`https://solscan.io/account/${RESERVE_WALLET}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.85 }}
      transition={{ delay: 4.5, duration: 1 }}
      className="absolute bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 border border-[#39ff14]/25 bg-black/40 backdrop-blur-[2px] hover:border-[#39ff14]/60 transition-colors"
      title="Verify the rewards reserve on Solscan"
    >
      <div
        className="text-[5px] sm:text-[6px] tracking-[0.18em] text-center text-[#39ff14]/80"
        style={{ fontFamily: "var(--font-press-start)" }}
      >
        REWARDS RESERVE{balance !== null ? `: ${fmt(balance)} $ZEREBRO` : ": VERIFY ON-CHAIN"}
      </div>
      <div
        className="mt-1 text-[4px] sm:text-[5px] tracking-[0.14em] text-center text-[#8b8b9e]"
        style={{ fontFamily: "var(--font-press-start)" }}
      >
        FOR $ZEREBLAST HOLDERS + DAILY PLAYERS AT GAME LAUNCH
      </div>
    </motion.a>
  );
}
