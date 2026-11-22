"use client";

import { useEffect, useState } from "react";
import { readProgress, SCORE_EVENT, type Progress } from "@/lib/progress";

/** Live view of the player's records. null until mounted (so SSR and first paint agree). */
export function useProgress(): Progress | null {
  const [p, setP] = useState<Progress | null>(null);
  useEffect(() => {
    const read = () => setP(readProgress());
    read();
    window.addEventListener(SCORE_EVENT, read);
    window.addEventListener("storage", read);
    // a new UTC day flips the mission set and the streak without a run
    const id = window.setInterval(read, 60_000);
    return () => {
      window.removeEventListener(SCORE_EVENT, read);
      window.removeEventListener("storage", read);
      window.clearInterval(id);
    };
  }, []);
  return p;
}
