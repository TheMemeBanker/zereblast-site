/**
 * ZEREBLAST brand marks.
 *
 * THE BOLT — a Z drawn as a lightning strike, set in a cartridge. 10x12 bitmap,
 * rendered as crisp SVG rects so it stays sharp at every size (favicon to hero).
 * THE WORDMARK — Bungee, orange face, ink + cobalt hard offsets, a 4° lean.
 */

export const BOLT_ROWS: readonly string[] = [
  "##########",
  "##########",
  ".......##.",
  "......##..",
  ".....##...",
  "...####...",
  "..#####...",
  "....##....",
  "...##.....",
  "..##......",
  "##########",
  "##########",
];
export const BOLT_W = 10;
export const BOLT_H = 12;

export function Bolt({ color = "var(--orange)", size = 20, className }: { color?: string; size?: number; className?: string }) {
  const s = size / BOLT_H;
  return (
    <svg width={BOLT_W * s} height={size} viewBox={`0 0 ${BOLT_W} ${BOLT_H}`} shapeRendering="crispEdges" className={className} aria-hidden="true">
      {BOLT_ROWS.map((row, y) => [...row].map((c, x) => (c === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null)))}
    </svg>
  );
}

/** The cartridge mark: ink shell, cream label, the bolt. 16x18 units. */
export function Mark({ size = 36, className, title = "ZEREBLAST" }: { size?: number; className?: string; title?: string }) {
  return (
    <svg width={size * (16 / 18)} height={size} viewBox="0 0 16 18" shapeRendering="crispEdges" className={className} role="img" aria-label={title}>
      {/* shell */}
      <rect x="1" y="0" width="14" height="18" fill="var(--ink)" />
      <rect x="0" y="1" width="16" height="16" fill="var(--ink)" />
      {/* grip ridges */}
      <rect x="3" y="1" width="10" height="1" fill="var(--ink-2)" />
      {/* label */}
      <rect x="2" y="3" width="12" height="11" fill="var(--cream)" />
      <rect x="2" y="3" width="12" height="1" fill="var(--cobalt)" />
      {/* the bolt, 6x7 inside the label */}
      <g transform="translate(5 5)">
        <rect x="0" y="0" width="6" height="1" fill="var(--orange)" />
        <rect x="4" y="1" width="2" height="1" fill="var(--orange)" />
        <rect x="3" y="2" width="2" height="1" fill="var(--orange)" />
        <rect x="1" y="3" width="4" height="1" fill="var(--orange)" />
        <rect x="2" y="4" width="2" height="1" fill="var(--orange)" />
        <rect x="1" y="5" width="2" height="1" fill="var(--orange)" />
        <rect x="0" y="6" width="6" height="1" fill="var(--orange)" />
      </g>
      {/* contacts */}
      <rect x="3" y="15" width="10" height="2" fill="var(--yellow)" />
      <rect x="4" y="15" width="1" height="2" fill="var(--ink)" />
      <rect x="6" y="15" width="1" height="2" fill="var(--ink)" />
      <rect x="8" y="15" width="1" height="2" fill="var(--ink)" />
      <rect x="10" y="15" width="1" height="2" fill="var(--ink)" />
    </svg>
  );
}

export function Wordmark({ className = "", as: Tag = "span" }: { className?: string; as?: "span" | "h1" | "div" }) {
  return (
    <Tag className={`wordmark ${className}`} translate="no">
      ZEREBLAST
    </Tag>
  );
}
