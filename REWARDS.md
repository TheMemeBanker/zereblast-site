# $ZEREBRO rewards reserve

A reserve of **$ZEREBRO** is set aside to reward **$ZEREBLAST holders and
daily players** on zereblast.org when the game launches.

| | |
|---|---|
| Reserve wallet | [`BZfRPexCoXMsFLvbYqn8C4PvTLH5KRaxpsFHynMTGQoN`](https://solscan.io/account/BZfRPexCoXMsFLvbYqn8C4PvTLH5KRaxpsFHynMTGQoN) |
| Token | $ZEREBRO — mint [`8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn`](https://solscan.io/token/8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn) |
| Balance at last verification | 62,289,034 $ZEREBRO (2026-09-18, on-chain) |

## How it's shown on the site

The site's rewards panel (`components/RewardsReserve.tsx`) fetches the
wallet's live $ZEREBRO balance from public Solana RPC on every page load —
the displayed number is **computed from the chain, never hardcoded**, and the
panel links straight to Solscan so anyone can verify independently. If RPC is
unreachable it shows "verify on-chain" instead of a stale number.

## Distribution

Rewards go to $ZEREBLAST holders and daily players on zereblast.org once the
game launches. Exact split, snapshot mechanics, and schedule will be published
before the first distribution. This is a planned reward program funded by the
reserve above — verify the balance yourself; nothing here is financial advice.
