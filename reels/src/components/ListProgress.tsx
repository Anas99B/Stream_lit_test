import React from "react";
import { C, MONO } from "../brand/tokens";
import { mix, prog } from "../lib/anim";
import { useTime } from "../lib/time";

export type ListProgressProps = {
  /** Timebase frames at which item 1..N becomes current. */
  steps: number[];
  /** Centre x / top y in the parent's coordinates. */
  x: number;
  y: number;
  /** Overall visibility 0..1. */
  v?: number;
  segW?: number;
  gap?: number;
};

/** Geometry of segment i (for objects that morph into the indicator). */
export const listProgressSegment = (i: number, n: number, x: number, y: number, segW = 46, gap = 10) => {
  const total = n * segW + (n - 1) * gap;
  const left0 = x - total / 2 - 44;
  return { left: left0 + 88 + (n - 1 - i) * (segW + gap), top: y + 11, width: segW, height: 8 };
};

/**
 * Discreet "n/N" progress for list episodes: N short segments that fill in
 * reading order (RTL: item 1 is the right-most), current one in the accent
 * with glow, passed ones dim accent, upcoming ones faint, plus a mono "n/N".
 */
export const ListProgress: React.FC<ListProgressProps> = ({ steps, x, y, v = 1, segW = 46, gap = 10 }) => {
  const t = useTime();
  if (v <= 0.001) return null;
  const n = steps.length;
  let cur = -1;
  steps.forEach((s, i) => {
    if (t >= s) cur = i;
  });
  const total = n * segW + (n - 1) * gap;
  const label = `${Math.max(1, cur + 1)}/${n}`;
  return (
    <div style={{ position: "absolute", left: x - total / 2 - 44, top: y, width: total + 88, height: 30, opacity: v }}>
      {steps.map((s, i) => {
        const on = prog(t, s, 10);
        const passed = i < cur;
        const current = i === cur;
        // RTL: item 1 at the right end
        const left = 88 + (n - 1 - i) * (segW + gap);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top: 11,
              width: segW,
              height: 8,
              borderRadius: 4,
              background: current ? C.mcp : passed ? "rgba(255, 90, 54, 0.45)" : "rgba(255,255,255,0.16)",
              boxShadow: current ? `0 0 ${14 * on}px ${C.mcpGlow}` : undefined,
              scale: current ? `${mix(1, 1.08, on)} ${mix(1, 1.3, on)}` : undefined,
            }}
          />
        );
      })}
      <div
        dir="ltr"
        style={{ position: "absolute", left: 0, top: 0, width: 72, textAlign: "left", fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.mcp, letterSpacing: 2, lineHeight: "30px" }}
      >
        {label}
      </div>
    </div>
  );
};
