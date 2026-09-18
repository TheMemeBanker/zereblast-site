# Pump.fun Callout Rewards — research notes & playbook

Research compiled 2026-09-18. Everything below is sourced from Pump.fun's own
materials, their Terms of Service, and published payout analyses — with honest
labels on what is **published**, what is **inferred**, and what is **unknown**.

## How the payout works (published)

- **Daily fixed pot, pro-rata by rank.** Pump.fun funds a daily rewards pool
  from its own treasury (no trader fees). Your attributed **buy volume** is
  computed as a share of all callers' attributed volume that day; payout is
  pro-rata by rank. Minimum daily payout $1, no cap, auto-enrolled.
- **Attribution is single-hop and click-through based.** A trade credits you
  when a user opens/clicks *your* callout — home feed, coin page, push
  notification, anywhere it surfaces — and then trades that token. It is NOT
  based on the follow graph.
- **Quantity penalty.** Their FAQ admits "negative multipliers if the number
  of callouts you posted exceeded a certain threshold," and after community
  backlash they further reduced the weight of callout count ("quality >>>
  quantity" rebalance, confirmed by the COO; new weights unpublished).
- **The formula is deliberately secret.** The ToS states the Activity Metric,
  ranking methodology, and pool size are confidential, may change without
  notice, and the pool "may be zero" on any day. Allocations can be re-ranked
  or cancelled at their discretion.

## No pyramid / degrees of separation

There is **no multi-level mechanic**, published or observed. Volume from
someone who traded off your callout and then posted their own callout is
theirs alone. Nothing propagates through follower-of-follower or wallet
graphs. Note the flip side: the ToS forfeiture clause targets sybil accounts
and coordinated trading — simulated referral trees are the fastest way to get
an allocation zeroed.

## What the first ~$700K distribution revealed (empirical)

| Caller | Payout | Callouts | ~$/callout |
|---|---|---|---|
| Top earner ("Slingoor") | $47,500 | 215 | $221 |
| Martin Shkreli | ~$11,000 | 11 | $1,000 |
| Spam case | $6,800 | 2,417 | $2.80 |
| Bottom of top-50 | $6,100 | 624 | $10 |

A ~350× spread in per-callout efficiency → converted volume dominates the
formula; count is (now more heavily) penalized. 80% of top-50 earners called
sub-$100K-mcap tokens — small caps where *your* callout is the discovery point
convert best.

## Maximization playbook

1. **Optimize for trade-through, not reach.** A 0-follower account can
   out-earn a 50K-follower account (their own FAQ). Conviction picks that
   convert beat broadcast spam.
2. **Fewer, better calls.** Stay clearly under the count-penalty threshold.
3. **Call ahead of volume.** The winning call lands minutes-to-hours before a
   token's velocity, so yours is the callout people click during the run.
4. **Spend the 6-hour slot wisely** (~4 calls/day max) on the
   highest-expected-velocity candidate.
5. **Small/mid caps where you're the discovery > megacaps where you're caller
   #400** — on trending tokens attribution splits across every caller.
6. **Stay clean.** Wash/coordinated/undisclosed-promo activity is forfeitable
   at their discretion, retroactively.
7. **Track your own payout ÷ attributed volume daily.** The weights are secret
   and have already changed once — your own ratio is the only live signal of
   the current formula.

## Daily window & send time

- **Cutoff (inferred, unverified):** midnight UTC is the best-supported
  reading — it's the platform's only stated day convention ("streak resets at
  midnight UTC") and matches the "call now, earn tomorrow / get paid the next
  day" language. Pump.fun has never published the callout cutoff anywhere
  (ToS, FAQs, and the app's full UI-string bundle all checked). Attribution
  almost certainly follows when the *trade* happens, not when the callout was
  posted.
- **Send time: unpublished.** No consistent hour is documented anywhere.

## How to pin down the schedule and pot sizes (trace instructions)

The ToS states every reward is an **on-chain USDC transfer** — so the
distributor wallet's history is public and answers everything at once:

1. In the app: Callout rewards → All payouts → open any payout → copy the
   transaction signature / Solscan link.
2. From that tx, identify the **sender** (the distributor wallet).
3. Pull its full history: `getSignaturesForAddress` on public RPC, then parse
   each batch's block time and USDC transfer amounts.
4. Aggregate:
   - batch timestamps by day → the **actual send schedule** (and, minus a few
     processing hours, corroboration of the cutoff);
   - per-day transfer sums → the **real daily pot** (officially undisclosed);
   - per-day recipient counts and amounts → **earners by day**, your rank
     percentile, and pool trend since launch.

No public source names the distributor wallet (checked: Solscan labels,
analyst threads, and pump.fun's client bundles) — a single received-payout tx
is the anchor that unlocks the trace.

## Sources

- Announcement thread: <https://x.com/Pumpfun/status/2087913075827474852>
- FAQs pt. 2: <https://x.com/Pumpfun/status/2087913081032659382>
- Alon's launch post: <https://x.com/a1lon9/status/2087913907268493797>
- Terms of Service: <https://pump.fun/docs/callout-reward-terms>
- Quality rebalance coverage: <https://www.bydfi.com/en/crypto-news/pump/pump-fun-adjusts-callout-rewards-to-favor-quality-99752>
- $700K payout analysis: <https://cryptonews.net/news/altcoins/33359148/>
- Dethective's top-50 breakdown: <https://x.com/dethective/status/2092882796196839534>
