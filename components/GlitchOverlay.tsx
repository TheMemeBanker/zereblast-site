"use client";

import { useEffect, useRef } from "react";

export default function GlitchOverlay() {
  const glitchRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glitch = glitchRef.current;
    const scan = scanRef.current;
    if (!glitch || !scan) return;

    // Random glitch flash
    const triggerGlitch = () => {
      const duration = Math.random() * 300 + 100;
      const opacity = Math.random() * 0.5 + 0.2;
      const colorIdx = Math.floor(Math.random() * 3);
      const color = colorIdx === 0 ? "255, 0, 0" : colorIdx === 1 ? "0, 255, 0" : "0, 0, 255";

      glitch.style.setProperty("--glitch-opacity", String(opacity));
      glitch.style.setProperty("--glitch-color", color);
      glitch.classList.add("glitch-active");

      setTimeout(() => {
        glitch.classList.remove("glitch-active");
      }, duration);
    };

    // Scanline sweep
    const triggerScan = () => {
      scan.style.animationDelay = `-${Math.random() * 2}s`;
      scan.classList.add("scanning");
      setTimeout(() => {
        scan.classList.remove("scanning");
      }, 2000);
    };

    // RGB shift
    const triggerRgbShift = () => {
      glitch.classList.add("rgb-shift");
      setTimeout(() => {
        glitch.classList.remove("rgb-shift");
      }, 100);
    };

    triggerGlitch();
    triggerScan();

    const glitchInterval = setInterval(() => {
      triggerGlitch();
    }, Math.random() * 1500 + 500);

    const scanInterval = setInterval(() => {
      triggerScan();
    }, Math.random() * 4000 + 2000);

    const rgbInterval = setInterval(() => {
      if (Math.random() > 0.7) triggerRgbShift();
    }, Math.random() * 1500 + 500);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(scanInterval);
      clearInterval(rgbInterval);
    };
  }, []);

  return (
    <>
      <div ref={glitchRef} className="glitch-overlay" />
      <div ref={scanRef} className="scanline-sweep" />
      <div className="noise-overlay" />
    </>
  );
}
