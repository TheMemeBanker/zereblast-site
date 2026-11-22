"use client";

import { useEffect, useState } from "react";
import { msToUtcMidnight, pad, type Progress } from "@/lib/progress";
import { useProgress } from "./useProgress";
import { Bolt } from "./Brand";
import EntityMark from "./EntityMark";

const n = (v: number) => v.toLocaleString("en-US");

function Bar({ value, max, fill, small }: { value: number; max: number; fill?: string; small?: boolean }) {
  const w = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={`bar${small ? " bar-sm" : ""}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <i style={{ ["--w" as string]: `${w}%`, ["--fill" as string]: fill ?? "var(--orange)" }} />
    </div>
  );
}

/* ------------------------------------------------------ header chip */

export function PlayerChip() {
  const p = useProgress();
  const level = p?.level ?? 1;
  const rank = p?.rank ?? "ROOKIE";
  const floor = p?.levelFloor ?? 0;
  const next = p?.levelNext ?? 1500;
  const xp = p?.xp ?? 0;
  return (
    <a href="#player" className="card-flat hud" style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", textDecoration: "none", color: "var(--ink)", background: "var(--cream)" }} aria-label={`Player card: level ${level}, ${rank}`}>
      <span className="tag tag-fill" style={{ fontSize: 9 }}>LV {level}</span>
      <span style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 92 }}>
        <span style={{ fontSize: 7, letterSpacing: ".18em" }}>{rank}</span>
        <Bar value={xp - floor} max={next - floor} small />
      </span>
      {p && p.streak > 0 && (
        <span className="tag tag-orange" style={{ fontSize: 8 }} title="Daily streak">
          <Bolt size={9} color="var(--ink)" /> {p.streak}
        </span>
      )}
    </a>
  );
}

/* ------------------------------------------------------ player card */

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card-flat" style={{ padding: "14px 14px 12px", background: "var(--cream)" }}>
      <div className="eyebrow" style={{ fontSize: 7 }}>{label}</div>
      <div className="hud" style={{ fontSize: "clamp(14px, 2.2vw, 20px)", marginTop: 8, color: accent ?? "var(--ink)" }}>{value}</div>
    </div>
  );
}

export function PlayerCard() {
  const p = useProgress();
  const level = p?.level ?? 1;
  const floor = p?.levelFloor ?? 0;
  const next = p?.levelNext ?? 1500;
  const xp = p?.xp ?? 0;
  const played = (p?.plays ?? 0) > 0;
  return (
    <div id="player" className="card-ink" style={{ padding: "clamp(18px, 3vw, 32px)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--cobalt-2)" }}>PLAYER CARD · THIS BROWSER</div>
          <div className="display" style={{ fontSize: "clamp(34px, 6vw, 64px)", marginTop: 8, color: "var(--yellow)" }}>
            {p?.rank ?? "ROOKIE"}
          </div>
          <div className="hud" style={{ fontSize: 9, letterSpacing: ".18em", marginTop: 8, color: "var(--cream)" }}>
            LEVEL {level}
            {p?.nextRank ? <span style={{ color: "var(--muted)" }}> · NEXT RANK {p.nextRank}</span> : <span style={{ color: "var(--muted)" }}> · TOP RANK</span>}
          </div>
        </div>
        <div style={{ minWidth: "min(100%, 300px)", flex: "1 1 260px" }}>
          <div className="hud" style={{ display: "flex", justifyContent: "space-between", fontSize: 8, letterSpacing: ".16em", marginBottom: 8 }}>
            <span style={{ color: "var(--cream)" }}>XP {n(xp)}</span>
            <span style={{ color: "var(--muted)" }}>LV {level + 1} AT {n(next)}</span>
          </div>
          <Bar value={xp - floor} max={next - floor} fill="var(--yellow)" />
          <div className="hud" style={{ fontSize: 7, letterSpacing: ".14em", marginTop: 8, color: "var(--muted)" }}>
            XP = EVERY POINT YOU SCORE + 300 PER MISSION + 500 FOR A FULL MISSION DAY
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginTop: 24, color: "var(--ink)" }}>
        <Stat label="HI-SCORE" value={played ? pad(p!.best) : "------"} accent="var(--orange)" />
        <Stat label="BEST WAVE" value={played ? String(p!.totals.bestWave) : "-"} />
        <Stat label="DAILY STREAK" value={played ? `${p!.streak}D` : "-"} accent="var(--cobalt)" />
        <Stat label="RUNS" value={played ? n(p!.plays) : "-"} />
        <Stat label="ENTITIES DOWN" value={played ? n(p!.totals.bosses) : "-"} accent="#5f9a3e" />
        <Stat label="Z COINS" value={played ? n(p!.totals.coins) : "-"} accent="#b07f00" />
      </div>
      {!played && (
        <div className="hud" style={{ fontSize: 8, letterSpacing: ".16em", marginTop: 18, color: "var(--cream)" }}>
          NO RUNS YET. INSERT THE CARTRIDGE TO OPEN YOUR CARD.
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- missions */

function Countdown() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(msToUtcMidnight());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  if (ms === null) return <span>--:--:--</span>;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return <span>{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(sec).padStart(2, "0")}</span>;
}

export function Missions() {
  const p = useProgress();
  const missions = p?.missions ?? [];
  const done = missions.filter((m) => m.done).length;
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="hud" style={{ fontSize: 9, letterSpacing: ".18em" }}>
          {done}/3 CLEARED {p?.missionsAll && <span className="tag tag-yellow" style={{ marginLeft: 8 }}>MISSION DAY +500 XP</span>}
        </div>
        <div className="hud" style={{ fontSize: 8, letterSpacing: ".18em", color: "var(--muted)" }}>
          NEW SET IN <Countdown /> UTC
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {(missions.length ? missions : [0, 1, 2].map((i) => ({ id: `s${i}`, name: "LOADING", desc: "", done: false, cur: 0, goal: 1 }))).map((m) => (
          <div key={m.id} className="card" style={{ padding: 18, background: m.done ? "var(--yellow)" : "var(--cream)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div className="display" style={{ fontSize: 20 }}>{m.name}</div>
              <span className={`tag ${m.done ? "tag-fill" : ""}`}>{m.done ? "CLEAR" : "+300 XP"}</span>
            </div>
            <p style={{ margin: "10px 0 14px", fontSize: 14, lineHeight: 1.45, color: "var(--ink-2)" }}>{m.desc}</p>
            <Bar value={m.cur} max={m.goal} fill={m.done ? "var(--ink)" : "var(--cobalt)"} />
            <div className="hud" style={{ fontSize: 7, letterSpacing: ".16em", marginTop: 8, color: "var(--ink-2)" }}>
              {n(m.cur)} / {n(m.goal)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ badges */

function BadgeIcon({ kind, on }: { kind: string; on: boolean }) {
  const c = on ? "var(--ink)" : "var(--muted)";
  const px = (cells: string[]) => (
    <svg width={28} height={28} viewBox={`0 0 ${cells[0].length} ${cells.length}`} shapeRendering="crispEdges" aria-hidden="true">
      {cells.map((row, y) => [...row].map((ch, x) => (ch === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={c} /> : ch === "o" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={on ? "var(--orange)" : "var(--muted)"} /> : null)))}
    </svg>
  );
  switch (kind) {
    case "entity":
      return <EntityMark size={30} color={on ? "#4f8a2f" : "var(--muted)"} />;
    case "coin":
      return px(["..####..", ".#oooo#.", "#oo##oo#", "#o#..#o#", "#o#..#o#", "#oo##oo#", ".#oooo#.", "..####.."]);
    case "wave":
      return px(["........", "#..##..#", "##.##.##", "#.####.#", "#..##..#", "........", "..####..", ".######."]);
    case "streak":
      return <Bolt size={28} color={on ? "var(--orange)" : "var(--muted)"} />;
    case "mission":
      return px(["########", "#......#", "#.##...#", "#.##...#", "#......#", "#..##..#", "#......#", "########"]);
    case "score":
      return px(["...##...", "..####..", ".##oo##.", "##oooo##", "##oooo##", ".##oo##.", "..####..", "...##..."]);
    default:
      return px(["..####..", ".#....#.", "#..##..#", "#..##..#", "#......#", "#.#..#.#", ".#.##.#.", "..####.."]);
  }
}

export function Badges() {
  const p = useProgress();
  const badges = p?.badges ?? [];
  const on = badges.filter((b) => b.unlocked).length;
  return (
    <div>
      <div className="hud" style={{ fontSize: 9, letterSpacing: ".18em", marginBottom: 16 }}>
        {on}/{badges.length || 12} UNLOCKED
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))", gap: 12 }}>
        {badges.map((b) => (
          <div key={b.id} className={`badge ${b.unlocked ? "on" : "off"}`} title={b.desc}>
            <BadgeIcon kind={b.icon} on={b.unlocked} />
            <div className="hud" style={{ fontSize: 7, letterSpacing: ".14em", lineHeight: 1.5 }}>{b.name}</div>
            <div style={{ fontSize: 11, lineHeight: 1.3, color: b.unlocked ? "var(--ink-2)" : "var(--muted)" }}>{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------- run summary (game over) */

export function RunSummary({ r }: { r: { xpGained: number; missionsDone: string[]; missionDay: boolean; levelUp: number | null; badgesUnlocked: string[] } }) {
  const lines: { t: string; c: string }[] = [{ t: `+${n(r.xpGained)} XP`, c: "var(--yellow)" }];
  for (const m of r.missionsDone) lines.push({ t: `MISSION CLEAR · ${m}`, c: "var(--cobalt-2)" });
  if (r.missionDay) lines.push({ t: "MISSION DAY · +500 XP", c: "var(--yellow)" });
  if (r.levelUp) lines.push({ t: `LEVEL UP · LV ${r.levelUp}`, c: "var(--orange)" });
  for (const b of r.badgesUnlocked) lines.push({ t: `BADGE · ${b}`, c: "var(--green)" });
  return (
    <div className="hud" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 7, letterSpacing: ".16em" }}>
      {lines.map((l, i) => (
        <span key={i} style={{ color: l.c }}>{l.t}</span>
      ))}
    </div>
  );
}

export type { Progress };
