/**
 * The one place a $ZEREBLAST contract address would live.
 *
 * Empty string = no token surface anywhere on the site: the footer wordmark is
 * plain text and nothing links out. Setting a verified mint here turns the
 * footer wordmark into the token link. Verify a new mint on-chain + DexScreener
 * before changing this.
 */
export const CA = "";
export const PUMP_URL = CA ? `https://pump.fun/coin/${CA}` : "";
