/**
 * The one place a $ZEREBLAST contract address would live.
 *
 * Empty string = no token surface anywhere on the site: the footer wordmark is
 * plain text and nothing links out. Setting a verified mint here turns the
 * footer wordmark into the token link. Verify a new mint on-chain + DexScreener
 * before changing this.
 */
export const CA = "FLuBStU8k1VySaKYNksBJ6WvYqZhWaUZkXva3EYcpump"; // verified on-chain 2026-11-22 ~21:50 CT: Token-2022 ZEREBLAST.ORG/ZEREBLAST, 6 dec, 1B supply, mint+freeze+update authority revoked (replaces C3WQcDZr…pump)
export const PUMP_URL = CA ? `https://pump.fun/coin/${CA}` : "";
