import { SIGIL_COLOR, SIGIL_H, SIGIL_ROWS, SIGIL_W } from "./sigil-data";

/** The Entity's 23x35 bitmap as crisp SVG. It is the boss in the game and the badge icon here. */
export default function EntityMark({ size = 35, color = SIGIL_COLOR, className }: { size?: number; color?: string; className?: string }) {
  const s = size / SIGIL_H;
  return (
    <svg width={SIGIL_W * s} height={size} viewBox={`0 0 ${SIGIL_W} ${SIGIL_H}`} shapeRendering="crispEdges" className={className} aria-hidden="true">
      {SIGIL_ROWS.map((row, y) => [...row].map((c, x) => (c === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null)))}
    </svg>
  );
}
