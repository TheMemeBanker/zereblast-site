import EntityMark from "./EntityMark";

function Key({ k }: { k: string }) {
  return (
    <kbd className="hud" style={{ display: "inline-block", padding: "6px 8px", border: "2px solid var(--ink)", boxShadow: "2px 2px 0 var(--ink)", background: "var(--cream)", fontSize: 8, letterSpacing: ".1em", marginRight: 6 }}>
      {k}
    </kbd>
  );
}

function Block({ color, size = 28, big }: { color: string; size?: number; big?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="0" y="0" width="14" height="14" fill={color} />
      <rect x="2" y="2" width="10" height="10" fill="var(--screen)" />
      <rect x="3" y="3" width="2" height="2" fill={color} />
      <rect x="7" y="3" width="2" height="2" fill={color} />
      <rect x="5" y="6" width="2" height="2" fill={color} />
      <rect x="9" y="6" width="2" height="2" fill={color} />
      <rect x="3" y="9" width="2" height="2" fill={color} />
      <rect x="8" y="9" width="3" height="2" fill={color} />
      {big && <rect x="1" y="-1" width="11" height="1" fill="#fff" />}
    </svg>
  );
}

const ROSTER: { name: string; what: string; pts: string; icon: React.ReactNode }[] = [
  { name: "GLITCH BLOCK", what: "Falls through the field, sways. One shot.", pts: "100 pts, scaling by wave", icon: <Block color="var(--orange)" /> },
  { name: "BIG BLOCK", what: "Three shots. Slower, heavier. Appears from wave 2.", pts: "350 pts, scaling by wave", icon: <Block color="var(--cobalt-2)" big /> },
  // eslint-disable-next-line @next/next/no-img-element
  { name: "Z COIN", what: "Drops from kills. Catch it.", pts: "+500 pts", icon: <img src="/coin-trimmed.png" alt="" width={30} height={30} style={{ imageRendering: "pixelated" }} /> },
  // eslint-disable-next-line @next/next/no-img-element
  { name: "POWER UP", what: "Spread shot and double fire rate for 8 seconds. One is guaranteed early.", pts: "", icon: <img src="/powerup-trimmed.png" alt="" width={22} height={32} style={{ imageRendering: "pixelated" }} /> },
  { name: "THE ENTITY", what: "Breaches every fourth wave. Sweeps the top of the field dropping blocks. Touching it costs a life.", pts: "2,500 pts × wave factor + a coin shower", icon: <EntityMark size={34} /> },
];

export default function HowToPlay() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow">RULES</div>
        <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)" }}>
          <li>You auto-fire. Steer, dodge, collect.</li>
          <li>Three lives. A block that reaches the floor costs one. So does a hit.</li>
          <li>A new wave every 15 seconds. Faster, denser, bigger.</li>
          <li>Every fourth wave the Entity breaches. Take it down for the big points.</li>
          <li>Your score is your XP. Missions and badges stack on top.</li>
        </ul>
        <div className="eyebrow" style={{ marginTop: 22 }}>CONTROLS</div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
          <div><Key k="←" /><Key k="→" /> or <Key k="A" /><Key k="D" /> move</div>
          <div><Key k="P" /> pause &nbsp; <Key k="ESC" /> eject</div>
          <div><Key k="TOUCH" /> drag anywhere on the screen to steer</div>
        </div>
      </div>
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow">ROSTER</div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
          {ROSTER.map((r) => (
            <div key={r.name} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 14, alignItems: "center", padding: "12px 0", borderTop: "2px solid var(--cream-3)" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>{r.icon}</div>
              <div>
                <div className="hud" style={{ fontSize: 8, letterSpacing: ".16em" }}>{r.name}</div>
                <div style={{ fontSize: 14, lineHeight: 1.45, color: "var(--ink-2)", marginTop: 4 }}>{r.what}</div>
                {r.pts && <div className="hud" style={{ fontSize: 7, letterSpacing: ".14em", color: "var(--orange-2)", marginTop: 4 }}>{r.pts}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
