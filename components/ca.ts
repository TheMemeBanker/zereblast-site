/**
 * The one place a $ZEREBLAST contract address would live.
 *
 * Empty string = no token surface anywhere on the site: the footer wordmark is
 * plain text and nothing links out. Setting a verified mint here turns the
 * footer wordmark into the token link. Verify a new mint on-chain + DexScreener
 * before changing this.
 */
export const CA = "C3WQcDZryE4eR3KAtwuPAk8F1vL4Yi7AHCUjwA2cpump"; // verified on-chain 2026-11-22: Token-2022 ZEREBLAST/ZEREBLAST, 6 dec, 1B supply, mint+freeze+update authority revoked; pump.fun pair live
export const PUMP_URL = CA ? `https://pump.fun/coin/${CA}` : "";
