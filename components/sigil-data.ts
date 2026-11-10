// Generated from the ZEREBLAST emblem (Desktop/ZEREBLAST.png): the green silhouette
// quantised onto its own 23x35 pixel grid. Rows are strings, "#" = lit cell.
// One source of truth for the boot sequence, the HUD badge and the in-game Entity boss.
export const SIGIL_W = 23;
export const SIGIL_H = 35;
export const SIGIL_COLOR = "#8ccc68";
export const SIGIL_ROWS: readonly string[] = [
  ".......########........",
  ".....############......",
  "....##############.....",
  "...################....",
  "...################....",
  "..##################...",
  "..##################...",
  "..##################...",
  "..##################...",
  "..##################...",
  "..##################...",
  "..##################...",
  "..##################...",
  "..##################...",
  "..##################...",
  "..##################...",
  "...#################...",
  ".....###############...",
  ".......#############...",
  "........############...",
  ".........##########....",
  "....##....#########....",
  "....###....#######..##.",
  "...#####....#####...###",
  "..#######..........####",
  ".##########.......#####",
  "#############....#####.",
  "...###################.",
  ".....#################.",
  ".......##############..",
  ".........############..",
  "...........#########...",
  ".............######....",
  "...............####....",
  "................##....."
] as const;
/** Each row as a hex word (MSB = leftmost cell). */
export const SIGIL_HEX: readonly string[] = SIGIL_ROWS.map((r) => parseInt(r.replace(/#/g, "1").replace(/\./g, "0"), 2).toString(16).toUpperCase().padStart(6, "0"));
/** Lit cells as [x, y] pairs, top row first. */
export const SIGIL_CELLS: readonly (readonly [number, number])[] = SIGIL_ROWS.flatMap((r, y) => [...r].map((c, x) => (c === "#" ? ([x, y] as const) : null)).filter((v): v is readonly [number, number] => v !== null));
