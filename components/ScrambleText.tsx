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
      return revealed.has(i)
        ? char
        : String.fromCharCode(Math.floor(Math.random() * 94) + 33);
    })
    .join("");

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}
