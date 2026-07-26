"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function ScanEdge({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  const isHorizontal = side === "top" || side === "bottom";
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    [side]: 0,
    ...(isHorizontal
      ? { left: 0, width: "100%", height: "1px" }
      : { top: 0, height: "100%", width: "1px" }),
  };

  return (
    <div style={baseStyle}>
      <motion.div
        style={{
          position: "absolute",
          background: isHorizontal
            ? "linear-gradient(90deg, transparent, #00f0ff, transparent)"
            : "linear-gradient(180deg, transparent, #00f0ff, transparent)",
          ...(isHorizontal
            ? { width: "40px", height: "2px", top: "-0.5px" }
            : { height: "40px", width: "2px", left: "-0.5px" }),
          boxShadow: "0 0 8px #00f0ff, 0 0 20px rgba(0,240,255,0.3)",
        }}
        animate={
          isHorizontal
            ? { left: ["-40px", "calc(100% + 40px)"] }
            : { top: ["-40px", "calc(100% + 40px)"] }
        }
        transition={{
          duration: isHorizontal ? 4 : 5,
          repeat: Infinity,
          ease: "linear",
          delay: side === "bottom" ? 2 : side === "right" ? 1 : side === "left" ? 3 : 0,
        }}
      />
    </div>
  );
}

function CornerBracket({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) {
  const color = position === "tl" || position === "br" ? "#ff2d7b" : "#00f0ff";

  const style: React.CSSProperties = {
    position: "absolute",
    width: 16,
    height: 16,
    ...(position.includes("t") ? { top: 6 } : { bottom: 6 }),
    ...(position.includes("l") ? { left: 6 } : { right: 6 }),
  };

  const borderStyle = `1px solid ${color}`;

  return (
    <motion.div
      style={{
        ...style,
        borderTop: position.includes("t") ? borderStyle : "none",
        borderBottom: position.includes("b") ? borderStyle : "none",
        borderLeft: position.includes("l") ? borderStyle : "none",
        borderRight: position.includes("r") ? borderStyle : "none",
        boxShadow: `0 0 6px ${color}40`,
      }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: position === "tl" ? 0 : position === "tr" ? 0.5 : position === "bl" ? 1 : 1.5 }}
    />
  );
}

function DataTicker() {
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    const chars = "0123456789ABCDEF";
    const generate = () => {
      const newVals: string[] = [];
      for (let i = 0; i < 4; i++) {
        let hex = "0x";
        for (let j = 0; j < 4; j++) hex += chars[Math.floor(Math.random() * 16)];
        newVals.push(hex);
      }
      setValues(newVals);
    };
    generate();
    const interval = setInterval(generate, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ delay: 5, duration: 2 }}
      className="hidden sm:flex absolute top-10 left-3 flex-col gap-0.5 pointer-events-none"
      style={{ fontFamily: "var(--font-press-start)" }}
    >
      {values.map((v, i) => (
        <span key={i} className="text-[4px] text-[#39ff14]/80 tracking-widest">
          {v}
        </span>
      ))}
    </motion.div>
  );
}

function SystemStatus() {
  const [fps, setFps] = useState(60);
  const [mem, setMem] = useState(87);

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(58 + Math.floor(Math.random() * 4));
      setMem(84 + Math.floor(Math.random() * 8));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ delay: 5.5, duration: 2 }}
      className="hidden sm:flex absolute top-10 right-3 flex-col gap-0.5 items-end pointer-events-none"
      style={{ fontFamily: "var(--font-press-start)" }}
    >
      <span className="text-[4px] text-[#00f0ff]/80">{fps} FPS</span>
      <span className="text-[4px] text-[#00f0ff]/80">MEM {mem}%</span>
      <span className="text-[4px] text-[#00f0ff]/80">GPU OK</span>
      <span className="text-[4px] text-[#39ff14]/80">SYS ONLINE</span>
    </motion.div>
  );
}

function EnergyPulse() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        border: "1px solid transparent",
        borderImage: "linear-gradient(90deg, transparent, #ff2d7b40, transparent) 1",
      }}
      animate={{
        boxShadow: [
          "inset 0 0 30px rgba(255,45,123,0)",
          "inset 0 0 60px rgba(255,45,123,0.05)",
          "inset 0 0 80px rgba(0,240,255,0.04)",
          "inset 0 0 40px rgba(180,77,255,0.03)",
          "inset 0 0 30px rgba(255,45,123,0)",
        ],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function HudFrame() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <CornerBracket position="tl" />
      <CornerBracket position="tr" />
      <CornerBracket position="bl" />
      <CornerBracket position="br" />
      <ScanEdge side="top" />
      <ScanEdge side="bottom" />
      <ScanEdge side="left" />
      <ScanEdge side="right" />
      <DataTicker />
      <SystemStatus />
      <EnergyPulse />
    </div>
  );
}
