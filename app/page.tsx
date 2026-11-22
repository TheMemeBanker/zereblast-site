"use client";

import { useState } from "react";
import { Bolt, Mark, Wordmark } from "@/components/Brand";
import Cartridge from "@/components/Cartridge";
import { Badges, Missions, PlayerCard, PlayerChip } from "@/components/Progression";
import HowToPlay from "@/components/HowToPlay";
import RewardsReserve from "@/components/RewardsReserve";
import BlastGame from "@/components/BlastGame";
import { PUMP_URL } from "@/components/ca";
import TokenPanel from "@/components/TokenPanel";

const WRAP: React.CSSProperties = { width: "min(1120px, 100% - 32px)", margin: "0 auto" };

function Ticker() {
  const items = ["$ZEREBLAST", "BLAST THE GLITCH", "THREE LIVES", "DAILY MISSIONS", "CLIMB THE RANKS", "THE ENTITY BREACHES EVERY 4TH WAVE", "RECORDS LIVE IN YOUR BROWSER"];
  const unit = items.map((t, i) => (
    <span key={i} className="hud" style={{ fontSize: 8, letterSpacing: ".22em", padding: "0 22px", display: "inline-flex", alignItems: "center", gap: 14 }}>
      {t} <Bolt size={9} color="var(--yellow)" />
    </span>
  ));
  return (
    <div style={{ background: "var(--ink)", color: "var(--cream)", borderBottom: "2px solid var(--ink)", overflow: "hidden", padding: "9px 0" }} aria-hidden="true">
      <div className="marquee">
        {unit}
        {unit}
      </div>
    </div>
  );
}

export default function Home() {
  const [gameOpen, setGameOpen] = useState(false);
  const start = () => setGameOpen(true);

  return (
    <main>
      <Ticker />

      {/* ---------------------------------------------------------- header */}
      <header style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 0" }}>
        <a href="#top" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }} aria-label="ZEREBLAST home">
          <Mark size={40} />
          <Wordmark className="hide-sm" />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#token" className="tag tag-yellow hide-sm" style={{ textDecoration: "none", color: "var(--ink)", padding: "9px 10px" }}>$ZEREBLAST</a>
          <PlayerChip />
          <button type="button" className="btn btn-primary btn-sm hide-sm" onClick={start}>
            PRESS START
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------ hero */}
      <section id="top" style={{ ...WRAP, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(28px, 5vw, 64px)", alignItems: "center", padding: "clamp(24px, 5vw, 64px) 0 clamp(40px, 6vw, 80px)" }}>
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="tag tag-fill">CARTRIDGE 01</span>
            <span className="tag">FIXED SHOOTER</span>
            <span className="tag tag-yellow">FREE PLAY</span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(44px, 8.2vw, 104px)", margin: "22px 0 0", lineHeight: 0.92 }}>
            <span style={{ display: "block" }}>BLAST</span>
            <span style={{ display: "block", color: "var(--orange)", textShadow: "0.05em 0.05em 0 var(--ink)" }}>THE</span>
            <span style={{ display: "block", color: "var(--cobalt)", textShadow: "0.05em 0.05em 0 var(--ink)" }}>GLITCH.</span>
          </h1>
          <p style={{ fontSize: "clamp(16px, 1.6vw, 19px)", lineHeight: 1.55, maxWidth: 520, margin: "22px 0 0", color: "var(--ink-2)" }}>
            A pocket arcade in a cartridge. Three lives, endless waves, the Entity every fourth. Every point you score is XP: clear the day&apos;s missions, unlock badges, climb from ROOKIE to LEGEND. Your record lives in this browser, nowhere else.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 28 }}>
            <button type="button" className="btn btn-primary" onClick={start}>
              <Bolt size={12} color="var(--ink)" /> PRESS START
            </button>
            <a className="btn" href="#missions">
              TODAY&apos;S MISSIONS
            </a>
          </div>
          <div className="hud" style={{ fontSize: 8, letterSpacing: ".18em", color: "var(--muted)", marginTop: 22 }}>
            KEYBOARD OR TOUCH · NO ACCOUNT · NO DOWNLOAD
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 16px 16px 0" }}>
          <Cartridge onStart={start} />
        </div>
      </section>

      {/* ------------------------------------------------------------ token */}
      <section className="section" style={{ background: "var(--cream-2)" }}>
        <div style={WRAP}>
          <div className="section-title">
            <span className="num">00</span>
            <h2>$ZEREBLAST</h2>
            <span className="eyebrow">THE COIN BEHIND THE CARTRIDGE</span>
          </div>
          <TokenPanel />
        </div>
      </section>

      {/* ----------------------------------------------------- player card */}
      <section className="section">
        <div style={WRAP}>
          <div className="section-title">
            <span className="num">01</span>
            <h2>YOUR CARD</h2>
          </div>
          <PlayerCard />
        </div>
      </section>

      {/* --------------------------------------------------------- missions */}
      <section className="section" id="missions" style={{ background: "var(--cream-2)" }}>
        <div style={WRAP}>
          <div className="section-title">
            <span className="num">02</span>
            <h2>DAILY MISSIONS</h2>
            <span className="eyebrow">THREE A DAY · RESET AT 00:00 UTC</span>
          </div>
          <Missions />
        </div>
      </section>

      {/* ----------------------------------------------------------- badges */}
      <section className="section">
        <div style={WRAP}>
          <div className="section-title">
            <span className="num">03</span>
            <h2>BADGES</h2>
            <span className="eyebrow">EARNED, NEVER BOUGHT</span>
          </div>
          <Badges />
        </div>
      </section>

      {/* ------------------------------------------------------ how to play */}
      <section className="section" id="how" style={{ background: "var(--cream-2)" }}>
        <div style={WRAP}>
          <div className="section-title">
            <span className="num">04</span>
            <h2>HOW TO PLAY</h2>
          </div>
          <HowToPlay />
        </div>
      </section>

      {/* ---------------------------------------------------------- rewards */}
      <section className="section" id="rewards">
        <div style={WRAP}>
          <div className="section-title">
            <span className="num">05</span>
            <h2>REWARDS</h2>
          </div>
          <RewardsReserve />
        </div>
      </section>

      {/* ------------------------------------------------------------- CTA */}
      <section className="section" style={{ background: "var(--ink)", color: "var(--cream)", borderBottom: "2px solid var(--ink)" }}>
        <div style={{ ...WRAP, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--cobalt-2)" }}>READY?</div>
            <div className="display" style={{ fontSize: "clamp(30px, 5vw, 56px)", marginTop: 8 }}>INSERT CARTRIDGE.</div>
          </div>
          <button type="button" className="btn btn-primary" onClick={start}>
            <Bolt size={12} color="var(--ink)" /> PRESS START
          </button>
        </div>
      </section>

      {/* ---------------------------------------------------------- footer */}
      <footer style={{ ...WRAP, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "26px 0 34px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Mark size={28} />
          {PUMP_URL ? (
            <a href={PUMP_URL} target="_blank" rel="noopener noreferrer" className="hud" style={{ fontSize: 9, letterSpacing: ".2em", color: "var(--ink)" }}>
              $ZEREBLAST
            </a>
          ) : (
            <a href="#token" className="hud" style={{ fontSize: 9, letterSpacing: ".2em", color: "var(--ink)" }}>$ZEREBLAST</a>
          )}
        </div>
        <div className="hud" style={{ display: "flex", flexWrap: "wrap", gap: 18, fontSize: 8, letterSpacing: ".18em" }}>
          <a href="https://x.com/0xzerebro" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)" }}>@0XZEREBRO</a>
          <a href="https://zerebro.org/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)" }}>ZEREBRO.ORG</a>
        </div>
        <div className="hud" style={{ fontSize: 7, letterSpacing: ".16em", color: "var(--muted)", width: "100%" }}>
          ZEREBLAST 2026 · RECORDS LIVE IN THIS BROWSER ONLY · REWARDS ARE A PLAN, NOT A GUARANTEE
        </div>
      </footer>

      <BlastGame open={gameOpen} onClose={() => setGameOpen(false)} />
    </main>
  );
}
