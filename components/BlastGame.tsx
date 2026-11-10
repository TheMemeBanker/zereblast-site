"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SIGIL_COLOR, SIGIL_H, SIGIL_ROWS, SIGIL_W } from "./sigil-data";

/**
 * ZEREBLAST — the arcade game.
 *
 * A fixed-shooter rendered on a low-resolution 2D canvas (pixel-perfect,
 * nearest-neighbour upscaled). The player sprite auto-fires upward at glitch
 * blocks falling through the arcade; Z coins and POWER UP crates drop from
 * kills. Three HP, endless waves that speed up every 15 seconds.
 *
 * Everything is client-side. The high score, play count and the list of UTC
 * days played live in localStorage only — that is the honest basis for the
 * "daily players" line in the rewards panel until an on-chain claim exists.
 *
 * Controls: arrows / A D (move), P (pause), Esc (close). Touch: drag.
 * Keys are matched on e.code against the game's own alphabet; everything else
 * is ignored, because this page fires its own synthetic keydown events.
 */

export const KEY_BEST = "zb.best";
const KEY_DAYS = "zb.days";
const KEY_PLAYS = "zb.plays";
export const SCORE_EVENT = "zereblast:score";

const PINK = "#ff2d7b";
const CYAN = "#00f0ff";
const GREEN = "#39ff14";
const YELLOW = "#ffe644";
const PURPLE = "#b44dff";
const BG = "#0a0610";

type Enemy = { x: number; y: number; s: number; vy: number; hp: number; max: number; color: string; seed: number; sway: number };
type Shot = { x: number; y: number; vx: number; vy: number };
type Drop = { x: number; y: number; vy: number; kind: "coin" | "power"; t: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string };

type Boss = { x: number; y: number; w: number; h: number; cell: number; hp: number; max: number; t: number; hit: number; dir: number; dropT: number };

type Phase = "title" | "play" | "over";

type Game = {
  W: number;
  H: number;
  t: number;
  px: number;
  py: number;
  pw: number;
  ph: number;
  target: number | null;
  left: boolean;
  right: boolean;
  hp: number;
  score: number;
  coins: number;
  wave: number;
  waveT: number;
  banner: number;
  spawnT: number;
  fireT: number;
  power: number;
  powerDrop: number;
  shake: number;
  hurt: number;
  enemies: Enemy[];
  shots: Shot[];
  drops: Drop[];
  parts: Particle[];
  stars: { x: number; y: number; z: number; c: string }[];
  boss: Boss | null;
  bossKills: number;
  bannerText: string;
  over: boolean;
  paused: boolean;
};

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
function readJSON<T>(k: string, fb: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
}
function writeJSON(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* private mode — the game still plays, nothing persists */
  }
}
/** Consecutive UTC days played, ending today. */
function streakOf(days: string[]): number {
  const set = new Set(days);
  let n = 0;
  const d = new Date();
  for (;;) {
    if (!set.has(utcDay(d))) break;
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}
function pad(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(6, "0");
}

/** Tiny WebAudio synth — square-wave blips, no assets. */
class Synth {
  ctx: AudioContext | null = null;
  muted = false;
  private get(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    } catch {
      return null;
    }
    return this.ctx;
  }
  resume() {
    const c = this.get();
    if (c && c.state === "suspended") void c.resume();
  }
  beep(freq: number, dur = 0.06, type: OscillatorType = "square", vol = 0.035, slide = 0) {
    if (this.muted) return;
    const c = this.get();
    if (!c) return;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, c.currentTime);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), c.currentTime + dur);
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g).connect(c.destination);
      o.start();
      o.stop(c.currentTime + dur + 0.02);
    } catch {
      /* audio is garnish */
    }
  }
}

const MOVE_KEYS = new Set(["ArrowLeft", "ArrowRight", "KeyA", "KeyD"]);

function makeGame(W: number, H: number): Game {
  const stars = Array.from({ length: 70 }, (_, i) => ({
    x: (i * 97 + 13) % W,
    y: (i * 53 + 7) % H,
    z: 0.3 + ((i * 7) % 10) / 12,
    c: [PINK, CYAN, GREEN, YELLOW, PURPLE, "#ffffff"][i % 6],
  }));
  return {
    W, H, t: 0,
    px: W / 2, py: H - 30, pw: 22, ph: 28,
    target: null, left: false, right: false,
    hp: 3, score: 0, coins: 0, wave: 1, waveT: 0, banner: 1.6,
    spawnT: 0.8, fireT: 0, power: 0, powerDrop: 14, shake: 0, hurt: 0,
    enemies: [], shots: [], drops: [], parts: [], stars,
    boss: null, bossKills: 0, bannerText: "WAVE 1",
    over: false, paused: false,
  };
}

export default function BlastGame({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rafRef = useRef<number>(0);
  const synth = useRef<Synth | null>(null);
  const sprites = useRef<{ char?: HTMLImageElement; coin?: HTMLImageElement; power?: HTMLImageElement }>({});
  const fontRef = useRef<string>("monospace");

  const [phase, setPhase] = useState<Phase>("title");
  const [dims, setDims] = useState({ W: 320, H: 240, cssW: 640, cssH: 480 });
  const [best, setBest] = useState(0);
  const [streak, setStreak] = useState(0);
  const [plays, setPlays] = useState(0);
  const [last, setLast] = useState({ score: 0, coins: 0, wave: 1, isBest: false, bosses: 0 });
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);

  // Fit the logical canvas to the viewport: portrait phones get a tall field.
  const measure = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const portrait = vh > vw;
    const W = portrait ? 240 : 320;
    const H = portrait ? 320 : 240;
    const maxW = Math.min(vw - 24, portrait ? 480 : 720);
    const maxH = vh - 150;
    let cssW = maxW;
    let cssH = (cssW * H) / W;
    if (cssH > maxH) {
      cssH = maxH;
      cssW = (cssH * W) / H;
    }
    setDims({ W, H, cssW: Math.floor(cssW), cssH: Math.floor(cssH) });
  }, []);

  useEffect(() => {
    if (!open) return;
    measure();
    window.addEventListener("resize", measure);
    setBest(readJSON<number>(KEY_BEST, 0));
    setStreak(streakOf(readJSON<string[]>(KEY_DAYS, [])));
    setPlays(readJSON<number>(KEY_PLAYS, 0));
    try {
      fontRef.current = getComputedStyle(document.documentElement).getPropertyValue("--font-press-start").trim() || "monospace";
    } catch {
      fontRef.current = "monospace";
    }
    for (const [k, src] of [["char", "/char-trimmed.png"], ["coin", "/coin-trimmed.png"], ["power", "/powerup-trimmed.png"]] as const) {
      const img = new Image();
      img.onload = () => {
        sprites.current[k] = img;
      };
      img.src = src;
    }
    return () => window.removeEventListener("resize", measure);
  }, [open, measure]);

  const finish = useCallback((g: Game) => {
    g.over = true;
    const prevBest = readJSON<number>(KEY_BEST, 0);
    const isBest = g.score > prevBest;
    const newBest = Math.max(prevBest, g.score);
    const days = readJSON<string[]>(KEY_DAYS, []);
    const today = utcDay();
    if (!days.includes(today)) days.push(today);
    const p = readJSON<number>(KEY_PLAYS, 0) + 1;
    writeJSON(KEY_BEST, newBest);
    writeJSON(KEY_DAYS, days.slice(-400));
    writeJSON(KEY_PLAYS, p);
    setBest(newBest);
    setStreak(streakOf(days));
    setPlays(p);
    setLast({ score: g.score, coins: g.coins, wave: g.wave, isBest, bosses: g.bossKills });
    setPhase("over");
    try {
      window.dispatchEvent(new CustomEvent(SCORE_EVENT, { detail: { score: g.score, best: newBest } }));
    } catch {
      /* ignore */
    }
    synth.current?.beep(220, 0.5, "sawtooth", 0.04, -180);
  }, []);

  // The loop. Runs only while phase === "play".
  useEffect(() => {
    if (!open || phase !== "play") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = gameRef.current ?? makeGame(dims.W, dims.H);
    gameRef.current = g;
    canvas.width = g.W;
    canvas.height = g.H;
    ctx.imageSmoothingEnabled = false;
    const font = (px: number) => `${px}px ${fontRef.current}`;
    const s = synth.current;

    let lastT = 0;
    const step = (now: number) => {
      rafRef.current = requestAnimationFrame(step);
      if (!lastT) lastT = now;
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.05) dt = 0.05;
      if (g.paused || document.hidden) {
        draw();
        return;
      }
      g.t += dt;
      update(dt);
      draw();
    };

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const burst = (x: number, y: number, color: string, n = 10, speed = 70) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = rnd(speed * 0.3, speed);
        g.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.25, 0.6), max: 0.6, color });
      }
    };
    const hurt = () => {
      g.hp -= 1;
      g.hurt = 0.6;
      g.shake = 0.35;
      s?.beep(110, 0.25, "sawtooth", 0.05, -60);
      burst(g.px, g.py, PINK, 16, 90);
      if (g.hp <= 0) finish(g);
    };

    const update = (dt: number) => {
      const { W, H } = g;
      // player movement
      const speed = 170;
      let dx = 0;
      if (g.left) dx -= 1;
      if (g.right) dx += 1;
      if (g.target !== null) {
        const d = g.target - g.px;
        if (Math.abs(d) > 2) dx = Math.sign(d) * Math.min(1, Math.abs(d) / 24);
      }
      g.px = Math.max(g.pw / 2 + 2, Math.min(W - g.pw / 2 - 2, g.px + dx * speed * dt));

      // waves
      g.waveT += dt;
      if (g.waveT >= 15) {
        g.waveT = 0;
        g.wave += 1;
        g.banner = 1.6;
        g.bannerText = `WAVE ${g.wave}`;
        s?.beep(660, 0.12, "square", 0.04, 300);
        if (g.wave % 4 === 0 && !g.boss) {
          // THE ENTITY breaches: the emblem itself, drawn from the bitmap
          const cell = 2;
          const max = 14 + g.wave * 2;
          g.boss = { x: W / 2, y: -SIGIL_H * cell, w: SIGIL_W * cell, h: SIGIL_H * cell, cell, hp: max, max, t: 0, hit: 0, dir: 1, dropT: 2 };
          g.bannerText = "ENTITY DETECTED";
          g.banner = 2.2;
          s?.beep(90, 0.6, "sawtooth", 0.05, 60);
        }
      }
      // the Entity
      if (g.boss) {
        const b = g.boss;
        b.t += dt;
        b.hit = Math.max(0, b.hit - dt);
        const targetY = 34 + b.h / 2;
        if (b.y < targetY) b.y = Math.min(targetY, b.y + 28 * dt);
        b.x += b.dir * (26 + g.wave * 2) * dt;
        if (b.x > W - b.w / 2 - 4) b.dir = -1;
        if (b.x < b.w / 2 + 4) b.dir = 1;
        b.dropT -= dt;
        if (b.dropT <= 0 && b.y >= targetY) {
          b.dropT = Math.max(0.9, 2.4 - g.wave * 0.1);
          g.enemies.push({ x: b.x + rnd(-b.w / 3, b.w / 3), y: b.y + b.h / 2, s: 12, vy: 60 + g.wave * 6, hp: 1, max: 1, color: SIGIL_COLOR, seed: Math.random() * 1000, sway: 0 });
        }
        for (const sh of g.shots) {
          if (Math.abs(sh.x - b.x) < b.w / 2 && Math.abs(sh.y - b.y) < b.h / 2) {
            sh.y = -99;
            b.hp -= 1;
            b.hit = 0.08;
            burst(sh.x, sh.y + 4, SIGIL_COLOR, 3, 50);
            s?.beep(140, 0.04, "square", 0.02);
            if (b.hp <= 0) {
              g.bossKills += 1;
              g.score += Math.round(2500 * (1 + (g.wave - 1) * 0.25));
              burst(b.x, b.y, SIGIL_COLOR, 60, 160);
              burst(b.x, b.y, "#ffffff", 20, 90);
              for (let i = 0; i < 4; i++) g.drops.push({ x: b.x + rnd(-24, 24), y: b.y + rnd(-10, 10), vy: 44, kind: "coin", t: 0 });
              g.bannerText = "ENTITY DOWN";
              g.banner = 2;
              g.shake = 0.5;
              g.boss = null;
              s?.beep(60, 0.9, "sawtooth", 0.06, 400);
              break;
            }
          }
        }
        if (g.boss && Math.abs(b.x - g.px) < (b.w + g.pw) / 2 - 4 && Math.abs(b.y - g.py) < (b.h + g.ph) / 2 - 4) hurt();
      }
      g.banner = Math.max(0, g.banner - dt);
      g.power = Math.max(0, g.power - dt);
      g.shake = Math.max(0, g.shake - dt);
      g.hurt = Math.max(0, g.hurt - dt);

      // firing
      g.fireT -= dt;
      if (g.fireT <= 0) {
        g.fireT = g.power > 0 ? 0.11 : 0.19;
        const y = g.py - g.ph / 2;
        g.shots.push({ x: g.px, y, vx: 0, vy: -260 });
        if (g.power > 0) {
          g.shots.push({ x: g.px - 5, y: y + 4, vx: -70, vy: -240 });
          g.shots.push({ x: g.px + 5, y: y + 4, vx: 70, vy: -240 });
        }
        s?.beep(g.power > 0 ? 1200 : 900, 0.035, "square", 0.012, -300);
      }

      // spawns
      g.spawnT -= dt;
      if (g.spawnT <= 0) {
        g.spawnT = Math.max(0.22, 0.95 - g.wave * 0.07) * rnd(0.7, 1.3) * (g.boss ? 2.2 : 1);
        const big = g.wave >= 2 && Math.random() < Math.min(0.3, 0.08 + g.wave * 0.03);
        const sz = big ? 22 : Math.round(rnd(11, 16));
        g.enemies.push({
          x: rnd(sz, W - sz), y: -sz, s: sz,
          vy: (big ? 26 : 42) + g.wave * 7 + rnd(0, 18),
          hp: big ? 3 : 1, max: big ? 3 : 1,
          color: [PINK, CYAN, PURPLE, GREEN][Math.floor(Math.random() * 4)],
          seed: Math.random() * 1000, sway: rnd(-18, 18),
        });
      }
      // guaranteed first power-up, then rare drops
      g.powerDrop -= dt;
      if (g.powerDrop <= 0) {
        g.powerDrop = rnd(22, 34);
        g.drops.push({ x: rnd(16, W - 16), y: -10, vy: 36, kind: "power", t: 0 });
      }

      // shots
      for (const sh of g.shots) {
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
      }
      g.shots = g.shots.filter((sh) => sh.y > -6 && sh.x > -4 && sh.x < W + 4);

      // enemies
      for (const e of g.enemies) {
        e.y += e.vy * dt;
        e.x += Math.sin(g.t * 2 + e.seed) * e.sway * dt;
        e.x = Math.max(e.s / 2, Math.min(W - e.s / 2, e.x));
        // shot hits
        for (const sh of g.shots) {
          if (Math.abs(sh.x - e.x) < e.s / 2 + 1 && Math.abs(sh.y - e.y) < e.s / 2 + 2) {
            sh.y = -99;
            e.hp -= 1;
            burst(sh.x, sh.y, e.color, 3, 40);
            if (e.hp <= 0) {
              e.y = H + 999;
              const pts = (e.max === 3 ? 350 : 100) * (1 + Math.floor((g.wave - 1) / 2) * 0.5);
              g.score += Math.round(pts);
              burst(e.x, e.y - 0, e.color, e.max === 3 ? 18 : 9, e.max === 3 ? 110 : 70);
              s?.beep(e.max === 3 ? 180 : 320, 0.08, "square", 0.03, -120);
              const r = Math.random();
              if (r < 0.1) g.drops.push({ x: e.x, y: e.y, vy: 44, kind: "coin", t: 0 });
              else if (r < 0.125 && g.power <= 0) g.drops.push({ x: e.x, y: e.y, vy: 36, kind: "power", t: 0 });
            } else {
              s?.beep(500, 0.03, "square", 0.015);
            }
          }
        }
        // player hit
        if (e.y < H + 500 && Math.abs(e.x - g.px) < (e.s + g.pw) / 2 - 3 && Math.abs(e.y - g.py) < (e.s + g.ph) / 2 - 4) {
          e.y = H + 999;
          hurt();
        } else if (e.y > H + 500) {
          /* already dead */
        } else if (e.y - e.s / 2 > H) {
          // reached the floor — a leak costs a life
          e.y = H + 999;
          hurt();
        }
      }
      g.enemies = g.enemies.filter((e) => e.y < H + 500);
      g.shots = g.shots.filter((sh) => sh.y > -50);

      // drops
      for (const d of g.drops) {
        d.y += d.vy * dt;
        d.t += dt;
        if (Math.abs(d.x - g.px) < 14 && Math.abs(d.y - g.py) < 18) {
          d.y = H + 999;
          if (d.kind === "coin") {
            g.coins += 1;
            g.score += 500;
            s?.beep(1046, 0.08, "square", 0.04, 500);
            burst(d.x, d.y, YELLOW, 10, 60);
          } else {
            g.power = 8;
            s?.beep(392, 0.3, "square", 0.04, 500);
            burst(d.x, d.y, GREEN, 14, 80);
          }
        }
      }
      g.drops = g.drops.filter((d) => d.y < H + 12);

      // particles
      for (const p of g.parts) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 60 * dt;
        p.life -= dt;
      }
      g.parts = g.parts.filter((p) => p.life > 0);
    };

    const draw = () => {
      const { W, H } = g;
      ctx.save();
      if (g.shake > 0) ctx.translate(Math.round(rnd(-2, 2)), Math.round(rnd(-2, 2)));
      ctx.fillStyle = BG;
      ctx.fillRect(-4, -4, W + 8, H + 8);
      // starfield (parallax drift)
      for (const st of g.stars) {
        const y = (st.y + g.t * 18 * st.z) % H;
        ctx.globalAlpha = 0.25 + st.z * 0.5;
        ctx.fillStyle = st.c;
        ctx.fillRect(Math.round(st.x), Math.round(y), 1, 1);
      }
      ctx.globalAlpha = 1;
      // floor line
      ctx.fillStyle = "#2a1848";
      ctx.fillRect(0, H - 10, W, 1);
      ctx.fillStyle = "#1a0f2e";
      ctx.fillRect(0, H - 9, W, 9);

      // drops
      for (const d of g.drops) {
        const img = d.kind === "coin" ? sprites.current.coin : sprites.current.power;
        const bob = Math.sin(d.t * 6) * 1.5;
        if (img) {
          const h = d.kind === "coin" ? 14 : 18;
          const w = Math.round((img.naturalWidth / img.naturalHeight) * h);
          ctx.drawImage(img, Math.round(d.x - w / 2), Math.round(d.y - h / 2 + bob), w, h);
        } else {
          ctx.fillStyle = d.kind === "coin" ? YELLOW : GREEN;
          ctx.fillRect(Math.round(d.x - 5), Math.round(d.y - 5 + bob), 10, 10);
        }
      }

      // enemies: glitch blocks
      for (const e of g.enemies) {
        const half = e.s / 2;
        const jx = Math.random() < 0.08 ? Math.round(rnd(-2, 2)) : 0;
        const x = Math.round(e.x - half + jx);
        const y = Math.round(e.y - half);
        ctx.fillStyle = e.color;
        ctx.globalAlpha = 0.18;
        ctx.fillRect(x - 2, y - 2, e.s + 4, e.s + 4);
        ctx.globalAlpha = 1;
        ctx.fillRect(x, y, e.s, e.s);
        ctx.fillStyle = BG;
        ctx.fillRect(x + 2, y + 2, e.s - 4, e.s - 4);
        ctx.fillStyle = e.color;
        // inner glyph: scrambled bits
        const cell = Math.max(2, Math.floor((e.s - 6) / 3));
        for (let i = 0; i < 3; i++)
          for (let j = 0; j < 3; j++) {
            const on = ((Math.floor(e.seed * 97) + i * 3 + j + Math.floor(g.t * 6)) * 2654435761) % 7 < 3;
            if (on) ctx.fillRect(x + 3 + i * cell, y + 3 + j * cell, cell - 1, cell - 1);
          }
        if (e.max > 1) {
          // hp pips for the big ones
          for (let i = 0; i < e.hp; i++) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 1 + i * 4, y - 4, 3, 2);
          }
        }
      }

      // the Entity
      if (g.boss) {
        const b = g.boss;
        const x0 = Math.round(b.x - b.w / 2);
        const y0 = Math.round(b.y - b.h / 2);
        const flick = b.hit > 0;
        ctx.fillStyle = flick ? "#ffffff" : SIGIL_COLOR;
        for (let r = 0; r < SIGIL_H; r++) {
          const row = SIGIL_ROWS[r];
          const jx = !flick && Math.random() < 0.05 ? (Math.random() < 0.5 ? -1 : 1) : 0;
          for (let c = 0; c < SIGIL_W; c++) {
            if (row[c] === "#") ctx.fillRect(x0 + c * b.cell + jx, y0 + r * b.cell, b.cell, b.cell);
          }
        }
        // hp bar
        ctx.fillStyle = "#1a0f2e";
        ctx.fillRect(W / 2 - 30, 24, 60, 3);
        ctx.fillStyle = SIGIL_COLOR;
        ctx.fillRect(W / 2 - 30, 24, Math.round(60 * (b.hp / b.max)), 3);
      }

      // shots
      for (const sh of g.shots) {
        ctx.fillStyle = g.power > 0 ? GREEN : CYAN;
        ctx.fillRect(Math.round(sh.x) - 1, Math.round(sh.y) - 4, 2, 6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(sh.x) - 1, Math.round(sh.y) - 1, 2, 2);
      }

      // player
      const img = sprites.current.char;
      const flicker = g.hurt > 0 && Math.floor(g.t * 20) % 2 === 0;
      if (!flicker) {
        if (g.power > 0) {
          ctx.globalAlpha = 0.35 + 0.25 * Math.sin(g.t * 12);
          ctx.fillStyle = GREEN;
          ctx.fillRect(Math.round(g.px - g.pw / 2 - 2), Math.round(g.py - g.ph / 2 - 2), g.pw + 4, g.ph + 4);
          ctx.globalAlpha = 1;
        }
        if (img) {
          ctx.drawImage(img, Math.round(g.px - g.pw / 2), Math.round(g.py - g.ph / 2), g.pw, g.ph);
        } else {
          ctx.fillStyle = PURPLE;
          ctx.fillRect(Math.round(g.px - g.pw / 2), Math.round(g.py - g.ph / 2), g.pw, g.ph);
        }
      }

      // particles
      for (const p of g.parts) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      }
      ctx.globalAlpha = 1;

      // HUD
      ctx.font = font(7);
      ctx.textBaseline = "top";
      ctx.fillStyle = PINK;
      ctx.textAlign = "left";
      ctx.fillText(pad(g.score), 4, 4);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < g.hp ? PINK : "#2a1848";
        ctx.fillRect(4 + i * 7, 14, 5, 3);
      }
      ctx.textAlign = "right";
      ctx.fillStyle = YELLOW;
      ctx.fillText(`W${g.wave}`, W - 4, 4);
      ctx.fillStyle = YELLOW;
      ctx.fillText(`Z${g.coins}`, W - 4, 14);
      if (g.power > 0) {
        ctx.fillStyle = GREEN;
        ctx.fillRect(W / 2 - 20, 5, Math.round(40 * (g.power / 8)), 2);
      }
      if (g.banner > 0 && !g.over) {
        ctx.textAlign = "center";
        ctx.globalAlpha = Math.min(1, g.banner * 2);
        ctx.fillStyle = CYAN;
        ctx.font = font(10);
        ctx.fillText(g.bannerText, W / 2, H / 2 - 20);
        ctx.globalAlpha = 1;
      }
      if (g.paused) {
        ctx.fillStyle = "rgba(10,6,16,0.7)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.fillStyle = YELLOW;
        ctx.font = font(10);
        ctx.fillText("PAUSED", W / 2, H / 2 - 6);
      }
      if (g.hurt > 0.45) {
        ctx.fillStyle = "rgba(255,45,123,0.18)";
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, phase, dims.W, dims.H, finish]);

  const start = useCallback(() => {
    synth.current ??= new Synth();
    synth.current.muted = muted;
    synth.current.resume();
    gameRef.current = makeGame(dims.W, dims.H);
    setPaused(false);
    setPhase("play");
    synth.current.beep(523, 0.08, "square", 0.04, 300);
  }, [dims.W, dims.H, muted]);

  const close = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    gameRef.current = null;
    setPhase("title");
    setPaused(false);
    onClose();
  }, [onClose]);

  // Keyboard: only our alphabet, matched on e.code.
  useEffect(() => {
    if (!open) return;
    const down = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      const g = gameRef.current;
      if (phase === "play" && g) {
        if (MOVE_KEYS.has(e.code)) {
          e.preventDefault();
          if (e.code === "ArrowLeft" || e.code === "KeyA") g.left = true;
          else g.right = true;
          g.target = null;
        } else if (e.code === "KeyP") {
          e.preventDefault();
          g.paused = !g.paused;
          setPaused(g.paused);
        }
      } else if ((phase === "title" || phase === "over") && (e.code === "Enter" || e.code === "Space")) {
        e.preventDefault();
        start();
      }
    };
    const up = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (!g || !MOVE_KEYS.has(e.code)) return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") g.left = false;
      else g.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [open, phase, start, close]);

  // Pointer: drag anywhere on the field to steer.
  const pointerTo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = gameRef.current;
    const c = canvasRef.current;
    if (!g || !c) return;
    const r = c.getBoundingClientRect();
    g.target = ((e.clientX - r.left) / r.width) * g.W;
    g.left = g.right = false;
  };
  const pointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.currentTarget as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
    pointerTo(e);
  };
  const pointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0 && e.pointerType === "mouse") return;
    pointerTo(e);
  };

  const toggleMute = () => {
    setMuted((m) => {
      if (synth.current) synth.current.muted = !m;
      return !m;
    });
  };

  if (!open) return null;

  const label: React.CSSProperties = { fontFamily: "var(--font-press-start)" };
  const btn = "px-4 py-2 border-2 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase cursor-pointer transition active:scale-[0.97]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px] px-3"
      role="dialog"
      aria-label="ZEREBLAST arcade game"
    >
      <div className="relative flex flex-col items-center gap-2" style={{ width: dims.cssW }}>
        {/* top bar */}
        <div className="w-full flex items-center justify-between" style={label}>
          <span className="text-[6px] sm:text-[7px] tracking-[0.25em]" style={{ color: YELLOW }}>
            ZEREBLAST
          </span>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-[6px] sm:text-[7px] tracking-[0.2em] cursor-pointer" style={{ color: muted ? "#8b8b9e" : GREEN }} aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? "SND OFF" : "SND ON"}
            </button>
            <button onClick={close} className="text-[6px] sm:text-[7px] tracking-[0.2em] cursor-pointer" style={{ color: PINK }} aria-label="Close game">
              ESC
            </button>
          </div>
        </div>

        {/* screen */}
        <div
          className="relative overflow-hidden border-2"
          style={{
            width: dims.cssW,
            height: dims.cssH,
            borderColor: "#2a1848",
            boxShadow: `0 0 0 1px ${BG}, 0 0 28px rgba(180,77,255,.25), inset 0 0 40px rgba(0,0,0,.6)`,
            background: BG,
          }}
        >
          <canvas
            ref={canvasRef}
            width={dims.W}
            height={dims.H}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            className="block touch-none select-none"
            style={{ width: dims.cssW, height: dims.cssH, imageRendering: "pixelated" }}
          />
          {/* CRT scanlines */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 1px, transparent 1px 3px)", mixBlendMode: "multiply" }}
            aria-hidden="true"
          />

          {phase !== "play" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-4" style={{ background: "rgba(10,6,16,.78)", ...label }}>
              {phase === "title" ? (
                <>
                  <div className="text-[12px] sm:text-[16px] tracking-[0.2em]" style={{ color: PINK, textShadow: `0 0 12px ${PINK}` }}>
                    ZEREBLAST
                  </div>
                  <div className="text-[6px] sm:text-[7px] leading-relaxed tracking-[0.15em]" style={{ color: "#8b8b9e" }}>
                    GLITCH BLOCKS ARE BREACHING THE ARCADE.
                    <br />
                    BLAST THEM. GRAB THE Z COINS. 3 LIVES.
                    <br />
                    EVERY 4TH WAVE THE ENTITY BREACHES.
                  </div>
                  <button onClick={start} className={`${btn} coin-blink`} style={{ borderColor: YELLOW, color: YELLOW, ...label }}>
                    Press Start
                  </button>
                  <div className="text-[5px] sm:text-[6px] tracking-[0.15em]" style={{ color: CYAN }}>
                    ARROWS / A D TO MOVE · AUTO-FIRE · P PAUSE
                    <br />
                    TOUCH: DRAG TO STEER
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[11px] sm:text-[14px] tracking-[0.2em]" style={{ color: PINK, textShadow: `0 0 12px ${PINK}` }}>
                    GAME OVER
                  </div>
                  <div className="text-[9px] sm:text-[11px] tracking-[0.15em]" style={{ color: YELLOW }}>
                    {pad(last.score)}
                  </div>
                  <div className="text-[6px] sm:text-[7px] tracking-[0.15em]" style={{ color: last.isBest ? GREEN : "#8b8b9e" }}>
                    {last.isBest ? "NEW HIGH SCORE" : `HIGH SCORE ${pad(best)}`}
                  </div>
                  <div className="text-[5px] sm:text-[6px] tracking-[0.15em]" style={{ color: CYAN }}>
                    WAVE {last.wave} · {last.coins} Z COIN{last.coins === 1 ? "" : "S"}{last.bosses ? ` · ${last.bosses} ENTIT${last.bosses === 1 ? "Y" : "IES"} DOWN` : ""}
                  </div>
                  <button onClick={start} className={btn} style={{ borderColor: GREEN, color: GREEN, ...label }}>
                    Continue?
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* bottom strip: honest local records */}
        <div className="w-full flex items-center justify-between text-[5px] sm:text-[6px] tracking-[0.18em]" style={{ ...label, color: "#8b8b9e" }}>
          <span>
            HI <span style={{ color: YELLOW }}>{pad(best)}</span>
          </span>
          <span>
            DAILY STREAK <span style={{ color: GREEN }}>{streak}</span> · PLAYS <span style={{ color: CYAN }}>{plays}</span>
          </span>
        </div>
        <div className="w-full text-center text-[4px] sm:text-[5px] tracking-[0.14em]" style={{ ...label, color: "#5a5a6e" }}>
          RECORDS LIVE IN THIS BROWSER ONLY. {paused ? "PAUSED." : ""} REWARDS FOR DAILY PLAYERS ARE CLAIMED ON-CHAIN AT LAUNCH.
        </div>
      </div>
    </div>
  );
}
