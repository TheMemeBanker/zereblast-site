/**
 * The one place a $ZEREBLAST contract address would live.
 *
 * Empty string = no token surface anywhere on the site: the footer wordmark is
 * plain text and nothing links out. Setting a verified mint here turns the
 * footer wordmark into the token link. Verify a new mint on-chain + DexScreener
 * before changing this.
 */
export const CA = ""; // unlinked 2026-11-22 21:4x CT (operator: new CA coming); C3WQcDZryE4eR3KAtwuPAk8F1vL4Yi7AHCUjwA2cpump retired
export const PUMP_URL = CA ? `https://pump.fun/coin/${CA}` : "";
