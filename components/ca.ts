/**
 * The one place the $ZEREBLAST contract address lives. Footer link, Konami reveal, console drop and the
 * CA ticker all import it, so the surfaces can never drift. Empty string = pending (every surface shows
 * its "drops soon" state). Verify a new mint on-chain + DexScreener before changing this.
 */
export const CA = "nkN3eTGKXEWESKtC3i4ebah1ArDvHUrBKiCCWcwpump"; // verified on-chain 2026-11-17: Token-2022 ZEREBLAST/ZEREBLAST, 6 dec, 1B supply, mint+freeze+update authority revoked; pump.fun pair live
export const PUMP_URL = CA ? `https://pump.fun/coin/${CA}` : "";
