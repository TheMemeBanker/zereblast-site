"use client";

import { useState, useEffect, useMemo } from "react";

interface ScrambleTextProps {
  text: string;
  finishTime?: number;
  tickInterval?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrambleText({
  text,
  finishTime = 1500,
  tickInterval = 50,
  className = "",
  style,
}: ScrambleTextProps) {
  const totalTicks = Math.ceil(finishTime / tickInterval);
  const [tick, setTick] = useState(0);
  // Hydration guard: the server and the client's first render must produce
  // identical text, so random glyphs only start after mount (React #418).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shuffledIndices = useMemo(() => {
    const indices = [...Array(text.length).keys()];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [text]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => {
        if (t >= totalTicks) {
          clearInterval(interval);
          return totalTicks;
        }
        return t + 1;
      });
    }, tickInterval);
    return () => clearInterval(interval);
  }, [tickInterval, totalTicks]);

  const revealCount = Math.min(
    text.length,
    Math.floor((tick / totalTicks) * text.length)
  );
  const revealed = new Set(shuffledIndices.slice(0, revealCount));

  const display = text
    .split("")
    .map((char, i) => {
      if (char === " ") return " ";
      if (revealed.has(i)) return char;
      if (!mounted) {
        // deterministic pre-mount scramble: same output on server and client
        return String.fromCharCode(33 + ((char.charCodeAt(0) * 7 + i * 13) % 94));
      }
      return String.fromCharCode(Math.floor(Math.random() * 94) + 33);
    })
    .join("");

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}
