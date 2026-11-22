/**
 * ZEREBLAST progression — the one place player records live.
 *
 * Everything is derived from a handful of localStorage keys written by
 * recordRun() when a run ends. Nothing here is faked: no run, no XP, no rank.
 * Records live in this browser only; the copy on the site says so.
 */

export const KEY_BEST = "zb.best";
export const KEY_DAYS = "zb.days";
export const KEY_PLAYS = "zb.plays";
export const KEY_XP = "zb.xp";
export const KEY_RUNS = "zb.runs";
export const KEY_TOTALS = "zb.totals";
export const KEY_MISSIONS = "zb.missions";
export const SCORE_EVENT = "zereblast:score";

export type Run = { d: string; score: number; wave: number; coins: number; bosses: number };
type Totals = { coins: number; bosses: number; bestWave: number; missionDays: number };
type MissionStore = { day: string; done: string[]; all: boolean };

export type Mission = { id: string; name: string; desc: string; test: (today: Run[]) => boolean; progress: (today: Run[]) => [number, number] };
export type MissionState = Mission & { done: boolean; cur: number; goal: number };
export type Badge = { id: string; name: string; desc: string; icon: string; test: (p: ProgressCore) => boolean };
export type BadgeState = Badge & { unlocked: boolean };

type ProgressCore = {
  best: number;
  plays: number;
  days: string[];
  streak: number;
  xp: number;
  totals: Totals;
  runs: Run[];
  today: string;
  runsToday: Run[];
};

export type Progress = ProgressCore & {
  level: number;
  rank: string;
  nextRank: string | null;
  levelFloor: number;
  levelNext: number;
  missions: MissionState[];
  missionsAll: boolean;
  badges: BadgeState[];
};

export type RunResult = {
  progress: Progress;
  isBest: boolean;
  xpGained: number;
  missionsDone: string[];
  missionDay: boolean;
  levelUp: number | null;
  badgesUnlocked: string[];
};

/* ----------------------------------------------------------- storage */

export function utcDay(d = new Date()): string {
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
    /* private mode: the game still plays, nothing persists */
  }
}
/** Consecutive UTC days played, ending today. */
export function streakOf(days: string[]): number {
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
export function pad(n: number, w = 6) {
  return String(Math.max(0, Math.floor(n))).padStart(w, "0");
}
export function msToUtcMidnight(now = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
}

/* ------------------------------------------------------------ levels */

const XP_K = 1500;
export function levelFor(xp: number) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / XP_K)) + 1;
}
export function xpForLevel(level: number) {
  return XP_K * (level - 1) * (level - 1);
}
const RANKS: [number, string][] = [
  [1, "ROOKIE"],
  [2, "CADET"],
  [3, "BLASTER"],
  [4, "GUNNER"],
  [5, "ACE"],
  [7, "VETERAN"],
  [9, "ENTITY HUNTER"],
  [12, "LEGEND"],
];
export function rankFor(level: number) {
  let r = RANKS[0][1];
  let next: string | null = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (level >= RANKS[i][0]) r = RANKS[i][1];
    else {
      next = RANKS[i][1];
      break;
    }
  }
  return { rank: r, nextRank: next };
}

/* ---------------------------------------------------------- missions */

const MISSION_XP = 300;
const MISSION_DAY_XP = 500;

const bestOf = (today: Run[], f: (r: Run) => number) => today.reduce((m, r) => Math.max(m, f(r)), 0);

const POOL: Mission[] = [
  { id: "clockin", name: "CLOCK IN", desc: "Finish one run today", test: (t) => t.length >= 1, progress: (t) => [Math.min(1, t.length), 1] },
  { id: "five", name: "FIVE THOUSAND", desc: "Score 5,000 in a single run", test: (t) => bestOf(t, (r) => r.score) >= 5000, progress: (t) => [Math.min(5000, bestOf(t, (r) => r.score)), 5000] },
  { id: "wave4", name: "FOURTH WAVE", desc: "Reach wave 4 in a run", test: (t) => bestOf(t, (r) => r.wave) >= 4, progress: (t) => [Math.min(4, bestOf(t, (r) => r.wave)), 4] },
  { id: "coins", name: "COIN RUN", desc: "Grab 5 Z coins in a single run", test: (t) => bestOf(t, (r) => r.coins) >= 5, progress: (t) => [Math.min(5, bestOf(t, (r) => r.coins)), 5] },
  { id: "entity", name: "ENTITY DOWN", desc: "Take the Entity down once today", test: (t) => t.some((r) => r.bosses >= 1), progress: (t) => [t.some((r) => r.bosses >= 1) ? 1 : 0, 1] },
  { id: "three", name: "THREE RUNS", desc: "Finish three runs today", test: (t) => t.length >= 3, progress: (t) => [Math.min(3, t.length), 3] },
  { id: "ten", name: "TEN THOUSAND", desc: "Score 10,000 in a single run", test: (t) => bestOf(t, (r) => r.score) >= 10000, progress: (t) => [Math.min(10000, bestOf(t, (r) => r.score)), 10000] },
];

/** The day's three missions: CLOCK IN plus two rotated deterministically by date. */
export function missionsFor(day: string): Mission[] {
  const n = Math.floor(Date.parse(day + "T00:00:00Z") / 86400000);
  const rest = POOL.slice(1);
  const a = rest[n % rest.length];
  const b = rest[(n * 7 + 3) % rest.length];
  const second = b.id === a.id ? rest[(n + 1) % rest.length] : b;
  return [POOL[0], a, second];
}

/* ------------------------------------------------------------ badges */

export const BADGES: Badge[] = [
  { id: "first", name: "FIRST BLAST", desc: "Finish your first run", icon: "run", test: (p) => p.plays >= 1 },
  { id: "5k", name: "5K CLUB", desc: "Score 5,000 in a run", icon: "score", test: (p) => p.best >= 5000 },
  { id: "10k", name: "10K CLUB", desc: "Score 10,000 in a run", icon: "score", test: (p) => p.best >= 10000 },
  { id: "25k", name: "25K CLUB", desc: "Score 25,000 in a run", icon: "score", test: (p) => p.best >= 25000 },
  { id: "wave4", name: "BREACH", desc: "Reach wave 4", icon: "wave", test: (p) => p.totals.bestWave >= 4 },
  { id: "wave8", name: "DEEP WAVE", desc: "Reach wave 8", icon: "wave", test: (p) => p.totals.bestWave >= 8 },
  { id: "entity", name: "ENTITY DOWN", desc: "Defeat the Entity", icon: "entity", test: (p) => p.totals.bosses >= 1 },
  { id: "hunter", name: "HUNTER", desc: "Defeat the Entity five times", icon: "entity", test: (p) => p.totals.bosses >= 5 },
  { id: "coins", name: "HOARD", desc: "Collect 50 Z coins all-time", icon: "coin", test: (p) => p.totals.coins >= 50 },
  { id: "streak3", name: "THREE DAYS", desc: "Play three days in a row", icon: "streak", test: (p) => p.streak >= 3 },
  { id: "streak7", name: "ONE WEEK", desc: "Play seven days in a row", icon: "streak", test: (p) => p.streak >= 7 },
  { id: "mission", name: "MISSION DAY", desc: "Clear all three missions in a day", icon: "mission", test: (p) => p.totals.missionDays >= 1 },
];

/* ------------------------------------------------------------- read */

function core(): ProgressCore {
  const today = utcDay();
  const days = readJSON<string[]>(KEY_DAYS, []);
  const runs = readJSON<Run[]>(KEY_RUNS, []);
  const totals = { coins: 0, bosses: 0, bestWave: 0, missionDays: 0, ...readJSON<Partial<Totals>>(KEY_TOTALS, {}) };
  return {
    best: readJSON<number>(KEY_BEST, 0),
    plays: readJSON<number>(KEY_PLAYS, 0),
    days,
    streak: streakOf(days),
    xp: readJSON<number>(KEY_XP, 0),
    totals,
    runs,
    today,
    runsToday: runs.filter((r) => r.d === today),
  };
}

function decorate(c: ProgressCore): Progress {
  const level = levelFor(c.xp);
  const { rank, nextRank } = rankFor(level);
  const store = readJSON<MissionStore>(KEY_MISSIONS, { day: "", done: [], all: false });
  const doneToday = store.day === c.today ? store.done : [];
  const missions = missionsFor(c.today).map((m) => {
    const [cur, goal] = m.progress(c.runsToday);
    return { ...m, done: doneToday.includes(m.id) || m.test(c.runsToday), cur, goal };
  });
  return {
    ...c,
    level,
    rank,
    nextRank,
    levelFloor: xpForLevel(level),
    levelNext: xpForLevel(level + 1),
    missions,
    missionsAll: missions.every((m) => m.done),
    badges: BADGES.map((b) => ({ ...b, unlocked: b.test(c) })),
  };
}

export function readProgress(): Progress {
  return decorate(core());
}

/* ------------------------------------------------------------ write */

export function recordRun(run: { score: number; wave: number; coins: number; bosses: number }): RunResult {
  const before = readProgress();
  const today = utcDay();

  const isBest = run.score > before.best;
  const best = Math.max(before.best, run.score);
  const days = before.days.includes(today) ? before.days : [...before.days, today];
  const plays = before.plays + 1;
  const runs = [...before.runs, { d: today, ...run }].slice(-60);
  const totals: Totals = {
    coins: before.totals.coins + run.coins,
    bosses: before.totals.bosses + run.bosses,
    bestWave: Math.max(before.totals.bestWave, run.wave),
    missionDays: before.totals.missionDays,
  };
  let xp = before.xp + run.score;

  // missions: award once per id per day
  const prev = readJSON<MissionStore>(KEY_MISSIONS, { day: "", done: [], all: false });
  const store: MissionStore = prev.day === today ? prev : { day: today, done: [], all: false };
  const runsToday = runs.filter((r) => r.d === today);
  const missionsDone: string[] = [];
  for (const m of missionsFor(today)) {
    if (!store.done.includes(m.id) && m.test(runsToday)) {
      store.done.push(m.id);
      missionsDone.push(m.name);
      xp += MISSION_XP;
    }
  }
  let missionDay = false;
  if (!store.all && store.done.length >= 3) {
    store.all = true;
    missionDay = true;
    totals.missionDays += 1;
    xp += MISSION_DAY_XP;
  }

  writeJSON(KEY_BEST, best);
  writeJSON(KEY_DAYS, days.slice(-400));
  writeJSON(KEY_PLAYS, plays);
  writeJSON(KEY_RUNS, runs);
  writeJSON(KEY_TOTALS, totals);
  writeJSON(KEY_XP, xp);
  writeJSON(KEY_MISSIONS, store);

  const progress = readProgress();
  const levelUp = progress.level > before.level ? progress.level : null;
  const badgesUnlocked = progress.badges.filter((b) => b.unlocked && !before.badges.find((o) => o.id === b.id)?.unlocked).map((b) => b.name);
  const result: RunResult = { progress, isBest, xpGained: xp - before.xp, missionsDone, missionDay, levelUp, badgesUnlocked };
  try {
    window.dispatchEvent(new CustomEvent(SCORE_EVENT, { detail: result }));
  } catch {
    /* ignore */
  }
  return result;
}
